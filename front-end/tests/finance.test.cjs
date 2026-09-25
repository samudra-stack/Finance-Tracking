const ts = require("typescript");
require.extensions[".ts"] = (module, filename) => {
  module._compile(
    ts.transpileModule(require("node:fs").readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText,
    filename,
  );
};
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createSeed, emptyState } = require("../data/mock-data.ts");
const { financeReducer: reduce } = require("../lib/reducer.ts");
const v = require("../lib/validators.ts");
const c = require("../lib/calculations.ts");
const { loadFinance, saveStorage } = require("../lib/storage.ts");
const { readSession, startSession, endSession } = require("../lib/session.ts");
const { avatarFileError, storeAvatar, readAvatar, MAX_AVATAR_DATA } = require("../lib/avatar.ts");
const { STORAGE_KEYS } = require("../lib/constants.ts");
const seed = () => createSeed(new Date(2026, 8, 23));
const memory = () => {
  const map = new Map();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, value) => map.set(k, value),
  };
};
test("seed: minimum counts, unique IDs, valid relations across months", () => {
  const s = seed();
  assert.equal(s.transactions.length, 30);
  assert.equal(s.categories.length, 10);
  assert.equal(s.accounts.length, 4);
  assert.equal(s.budgets.length, 5);
  assert.ok(v.isFinanceState(s));
  assert.equal(new Set(s.transactions.map((t) => t.date.slice(0, 7))).size, 3);
});
test("storage: only absent key seeds; reset persists empty arrays and preferences across reloads", () => {
  const store = memory();
  assert.equal(loadFinance(store).state.transactions.length, 30);
  let state = reduce(seed(), {
    type: "UPDATE_PREFERENCE",
    payload: { ...seed().preference, name: "Test", theme: "light" },
  });
  state = reduce(state, { type: "RESET_DATA" });
  saveStorage(store, STORAGE_KEYS.data, state);
  for (let i = 0; i < 3; i++) {
    const loaded = loadFinance(store);
    assert.ok(loaded.writable);
    assert.deepEqual(loaded.state, state);
    assert.equal(loaded.state.categories.length, 0);
  }
  assert.equal(state.preference.name, "Test");
  assert.equal(state.preference.theme, "light");
});
test("storage: malformed JSON/schema/relations fallback without overwriting original", () => {
  for (const value of [
    "{",
    "{}",
    "null",
    JSON.stringify({ ...seed(), accounts: [] }),
    JSON.stringify({ ...seed(), transactions: [null] }),
  ]) {
    const store = memory();
    store.setItem(STORAGE_KEYS.data, value);
    const result = loadFinance(store);
    assert.equal(result.writable, false);
    assert.ok(result.warning);
    assert.equal(result.state.transactions.length, 0);
    assert.equal(store.getItem(STORAGE_KEYS.data), value);
  }
});
test("storage: blocked read and failed write return clear warnings", () => {
  const store = {
    getItem() {
      throw Error("blocked");
    },
    setItem() {
      throw Error("quota");
    },
  };
  assert.equal(loadFinance(store).writable, false);
  assert.ok(saveStorage(store, "x", {}));
  assert.equal(readSession(store, store).session.loggedIn, false);
});
test("session: migrate email without legacy login; no financial data changes", () => {
  const local = memory(), tab = memory();
  saveStorage(local, STORAGE_KEYS.data, seed());
  const before = local.getItem(STORAGE_KEYS.data);
  saveStorage(local, STORAGE_KEYS.session, { loggedIn: true, rememberedEmail: "a@b.com" });
  assert.deepEqual(readSession(local, tab).session, { loggedIn: false, rememberedEmail: "a@b.com" });
  assert.equal(local.getItem(STORAGE_KEYS.data), before);
  assert.equal(JSON.parse(local.getItem(STORAGE_KEYS.session)).loggedIn, false);
  assert.ok(v.validateLogin("wrong", "123").email);
  assert.ok(v.validateLogin("a@b.com", "123").password);
  assert.deepEqual(v.validateLogin("a@b.com", "123456"), {});
});
test("session: refresh persists only in same tab; remember email is independent", () => {
  const local = memory(), tab = memory();
  startSession(local, tab, "a@b.com", true);
  assert.deepEqual(readSession(local, tab).session, { loggedIn: true, rememberedEmail: "a@b.com" });
  assert.deepEqual(readSession(local, memory()).session, { loggedIn: false, rememberedEmail: "a@b.com" });
  startSession(local, tab, "b@c.com", false);
  assert.deepEqual(readSession(local, tab).session, { loggedIn: true, rememberedEmail: "" });
  assert.equal(JSON.parse(local.getItem(STORAGE_KEYS.rememberedEmail)), "");
});
test("session: logout invalidates other and suspended tabs without deleting data", () => {
  const local = memory(), first = memory(), second = memory();
  saveStorage(local, STORAGE_KEYS.data, seed());
  startSession(local, first, "a@b.com", true);
  startSession(local, second, "a@b.com", true);
  assert.equal(endSession(local, first, "logout-1"), "");
  assert.equal(readSession(local, first).session.loggedIn, false);
  assert.equal(readSession(local, second).session.loggedIn, false);
  assert.equal(readSession(local, second).session.rememberedEmail, "a@b.com");
  assert.equal(loadFinance(local).state.transactions.length, 30);
  startSession(local, second, "a@b.com", false);
  assert.equal(readSession(local, second).session.loggedIn, true);
  assert.equal(readSession(local, first).session.loggedIn, false);
});
test("session: malformed and unavailable storage fail closed with warnings", () => {
  const local = memory(), tab = memory();
  tab.setItem(STORAGE_KEYS.tabSession, '{"loggedIn":true}');
  assert.equal(readSession(local, tab).session.loggedIn, false);
  tab.setItem(STORAGE_KEYS.tabSession, "{");
  assert.ok(readSession(local, tab).warning);
  assert.ok(readSession(null, null).warning);
  assert.ok(startSession(null, null, "a@b.com", false).warning);
  assert.ok(endSession(null, null, "x"));
});
test("avatar: file validation and storage failures cannot overwrite financial data", () => {
  assert.equal(avatarFileError({ type: "image/png", size: 100 }), null);
  assert.ok(avatarFileError({ type: "image/svg+xml", size: 100 }));
  assert.ok(avatarFileError({ type: "image/jpeg", size: 6 * 1024 * 1024 }));
  assert.ok(avatarFileError({ type: "image/webp", size: 0 }));
  const local = memory();
  saveStorage(local, STORAGE_KEYS.data, seed());
  const before = local.getItem(STORAGE_KEYS.data), photo = "data:image/jpeg;base64,YWJj";
  assert.equal(storeAvatar(local, photo), null);
  assert.equal(readAvatar(local), photo);
  assert.ok(storeAvatar(local, "data:image/jpeg;base64," + "A".repeat(MAX_AVATAR_DATA)));
  assert.equal(readAvatar(local), photo);
  assert.ok(storeAvatar({ getItem: local.getItem, setItem() { throw Error("quota"); } }, ""));
  assert.equal(readAvatar(local), photo);
  assert.equal(local.getItem(STORAGE_KEYS.data), before);
  saveStorage(local, STORAGE_KEYS.data, reduce(seed(), { type: "RESET_DATA" }));
  assert.equal(readAvatar(local), photo);
  assert.equal(storeAvatar(local, ""), null);
  assert.equal(readAvatar(local), "");
  local.setItem(STORAGE_KEYS.avatar, '"https://example.com/photo.jpg"');
  assert.equal(readAvatar(local), "");
});
test("inactive accounts: reject new or reassigned transactions, preserve historical edits", () => {
  let s = seed();
  const original = s.transactions[0], account = s.accounts.find((a) => a.id === original.accountId);
  s = reduce(s, { type: "UPDATE_ACCOUNT", payload: { ...account, isActive: false } });
  assert.ok(v.isFinanceState(s));
  assert.throws(() => reduce(s, { type: "ADD_TRANSACTION", payload: { ...original, id: "new" } }), /nonaktif/);
  s = reduce(s, { type: "UPDATE_TRANSACTION", payload: { ...original, amount: 123 } });
  assert.equal(s.transactions[0].amount, 123);
  const other = s.transactions.find((t) => t.accountId !== account.id);
  assert.throws(() => reduce(s, { type: "UPDATE_TRANSACTION", payload: { ...other, accountId: account.id } }), /nonaktif/);
});
test("transactions: add/edit/delete changes balances and rejects invalid amount/date/references", () => {
  let s = seed();
  const before = c.totalBalance(s);
  const t = { ...s.transactions[0], id: "new", amount: 123 };
  s = reduce(s, { type: "ADD_TRANSACTION", payload: t });
  assert.equal(c.totalBalance(s), before - 123);
  s = reduce(s, { type: "UPDATE_TRANSACTION", payload: { ...t, amount: 200 } });
  assert.equal(c.totalBalance(s), before - 200);
  s = reduce(s, { type: "DELETE_TRANSACTION", payload: t.id });
  assert.equal(c.totalBalance(s), before);
  for (const patch of [
    { amount: 0 },
    { amount: -1 },
    { amount: Infinity },
    { amount: NaN },
    { date: "2026-02-30" },
    { categoryId: "salary" },
    { accountId: "missing" },
    { description: " " },
  ])
    assert.throws(() =>
      reduce(s, { type: "ADD_TRANSACTION", payload: { ...t, ...patch } }),
    );
  assert.throws(() => reduce(s, { type: "UPDATE_TRANSACTION", payload: t }));
});
test("category/account CRUD and relational deletion guards; category type changes guarded", () => {
  let s = seed();
  assert.throws(
    () => reduce(s, { type: "DELETE_CATEGORY", payload: "food" }),
    /transaksi/,
  );
  assert.throws(
    () => reduce(s, { type: "DELETE_ACCOUNT", payload: "bca" }),
    /transaksi/,
  );
  assert.throws(() =>
    reduce(s, {
      type: "UPDATE_CATEGORY",
      payload: { ...s.categories[0], type: "income" },
    }),
  );
  const cat = {
    id: "new",
    name: "Baru",
    type: "expense",
    color: "#123456",
    icon: "wallet",
  };
  s = reduce(s, { type: "ADD_CATEGORY", payload: cat });
  s = reduce(s, { type: "UPDATE_CATEGORY", payload: { ...cat, name: "Edit" } });
  assert.throws(() =>
    reduce(s, {
      type: "ADD_CATEGORY",
      payload: { ...cat, id: "duplicate", name: " edit " },
    }),
  );
  s = reduce(s, { type: "DELETE_CATEGORY", payload: cat.id });
  assert.equal(s.categories.length, 10);
  const a = { ...s.accounts[0], id: "new", name: "New", initialBalance: 0 };
  s = reduce(s, { type: "ADD_ACCOUNT", payload: a });
  s = reduce(s, {
    type: "UPDATE_ACCOUNT",
    payload: { ...a, initialBalance: -100 },
  });
  s = reduce(s, { type: "DELETE_ACCOUNT", payload: a.id });
  assert.equal(s.accounts.length, 4);
});
test("budget CRUD, expense-only and unique category/month, deletion protects budget relation", () => {
  let s = seed();
  const b = {
    id: "new",
    categoryId: "health",
    month: "2026-09",
    limitAmount: 100,
  };
  s = reduce(s, { type: "ADD_BUDGET", payload: b });
  s = reduce(s, { type: "UPDATE_BUDGET", payload: { ...b, limitAmount: 200 } });
  assert.throws(() =>
    reduce(s, { type: "ADD_BUDGET", payload: { ...b, id: "other" } }),
  );
  assert.throws(() =>
    reduce(s, {
      type: "ADD_BUDGET",
      payload: { ...b, id: "other", categoryId: "salary" },
    }),
  );
  s = reduce(s, { type: "DELETE_BUDGET", payload: b.id });
  assert.equal(s.budgets.length, 5);
  s = { ...s, transactions: [] };
  assert.throws(
    () => reduce(s, { type: "DELETE_CATEGORY", payload: "food" }),
    /anggaran/,
  );
});
test("budget thresholds: 79%, 80%, 100%, >100%; month and category isolation", () => {
  const s = seed();
  const b = { id: "b", categoryId: "food", month: "2026-09", limitAmount: 100 };
  for (const [amount, status] of [
    [79, "Aman"],
    [80, "Hampir habis"],
    [100, "Hampir habis"],
    [100.01, "Terlampaui"],
  ]) {
    const result = c.budgetUsage(b, [{ ...s.transactions[0], amount }]);
    assert.equal(result.status, status);
    assert.equal(result.remaining, 100 - amount);
  }
  assert.equal(
    c.budgetUsage({ ...b, month: "2025-01" }, s.transactions).spent,
    0,
  );
});
test("selectors: empty, multi-account, cross-month aggregation and total consistency", () => {
  assert.equal(c.totalBalance(emptyState()), 0);
  assert.deepEqual(c.totals([]), { income: 0, expense: 0, net: 0 });
  assert.deepEqual(c.monthlyTotals([]), []);
  const s = seed();
  assert.equal(
    c.totalBalance(s),
    s.accounts.reduce((sum, a) => sum + c.accountBalance(a, s.transactions), 0),
  );
  assert.equal(
    c.monthlyTotals(s.transactions).reduce((sum, m) => sum + m.expense, 0),
    c.totals(s.transactions).expense,
  );
});
test("query: combined filters inclusive dates, sorting before pagination, page clamp", () => {
  const s = seed();
  const t = s.transactions[0];
  const q = {
    ...c.defaultQuery,
    search: "MAKANAN",
    type: "expense",
    categoryId: "food",
    accountId: t.accountId,
    from: t.date,
    to: t.date,
  };
  assert.deepEqual(c.queryTransactions(s.transactions, q), [t]);
  const sorted = c.queryTransactions(s.transactions, {
    ...c.defaultQuery,
    sort: "amount-desc",
  });
  assert.ok(sorted[0].amount >= sorted[29].amount);
  assert.equal(c.paginate(sorted, 2).rows[0].id, sorted[10].id);
  assert.equal(c.paginate([], 99).page, 1);
  assert.equal(c.paginate(sorted, 99).page, 3);
});
test("reset then create category/account/transaction from scratch without seed", () => {
  let s = reduce(seed(), { type: "RESET_DATA" });
  const cat = seed().categories[0],
    account = seed().accounts[0],
    t = seed().transactions[0];
  s = reduce(s, { type: "ADD_CATEGORY", payload: cat });
  s = reduce(s, { type: "ADD_ACCOUNT", payload: account });
  s = reduce(s, {
    type: "ADD_TRANSACTION",
    payload: { ...t, accountId: account.id },
  });
  assert.equal(s.transactions.length, 1);
  assert.equal(s.categories.length, 1);
  assert.equal(s.accounts.length, 1);
  assert.equal(s.budgets.length, 0);
});
test("date range: valid inclusive endpoints, reversed and impossible dates rejected", () => {
  assert.equal(v.validateDateRange("2026-09-01", "2026-09-01"), null);
  assert.equal(v.validateDateRange("2026-07-01", "2026-09-30"), null);
  for (const [from, to] of [
    ["2026-09-02", "2026-09-01"],
    ["2026-02-30", "2026-03-01"],
    ["", "2026-03-01"],
  ])
    assert.ok(v.validateDateRange(from, to));
});
test("all sorting modes keep source immutable; filters combine before pagination", () => {
  const s = seed(),
    original = JSON.stringify(s.transactions);
  for (const sort of ["amount-asc", "amount-desc", "date-asc", "date-desc"]) {
    const result = c.queryTransactions(s.transactions, {
      ...c.defaultQuery,
      sort,
    });
    for (let i = 1; i < result.length; i++) {
      const a = result[i - 1],
        b = result[i];
      assert.ok(
        sort === "amount-asc"
          ? a.amount <= b.amount
          : sort === "amount-desc"
            ? a.amount >= b.amount
            : sort === "date-asc"
              ? a.date <= b.date
              : a.date >= b.date,
      );
    }
  }
  assert.equal(JSON.stringify(s.transactions), original);
  const result = c.queryTransactions(s.transactions, {
    ...c.defaultQuery,
    type: "income",
    from: "2026-08-01",
    to: "2026-09-30",
  });
  assert.equal(result.length, 6);
  assert.equal(c.paginate(result, 1, 5).rows.length, 5);
  assert.equal(c.paginate(result, 2, 5).rows.length, 1);
});
