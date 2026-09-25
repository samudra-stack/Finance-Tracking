import type {
  Account,
  Budget,
  Category,
  FinanceState,
  Transaction,
  UserPreference,
} from "../types/finance";
import { deletionError, isFinanceState, transactionAccountError } from "./validators";
export type FinanceAction =
  | { type: "LOAD_DATA"; payload: FinanceState }
  | { type: "ADD_TRANSACTION" | "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "ADD_CATEGORY" | "UPDATE_CATEGORY"; payload: Category }
  | { type: "ADD_ACCOUNT" | "UPDATE_ACCOUNT"; payload: Account }
  | { type: "ADD_BUDGET" | "UPDATE_BUDGET"; payload: Budget }
  | {
      type:
        | "DELETE_TRANSACTION"
        | "DELETE_CATEGORY"
        | "DELETE_ACCOUNT"
        | "DELETE_BUDGET";
      payload: string;
    }
  | { type: "UPDATE_PREFERENCE"; payload: UserPreference }
  | { type: "RESET_DATA" };
export function financeReducer(
  state: FinanceState,
  action: FinanceAction,
): FinanceState {
  let next: FinanceState;
  if (action.type === "ADD_TRANSACTION" || action.type === "UPDATE_TRANSACTION") {
    const previous = action.type === "UPDATE_TRANSACTION" ? state.transactions.find((t) => t.id === action.payload.id) : undefined;
    const error = transactionAccountError(action.payload, state, previous);
    if (error) throw new Error(error);
  }
  if (action.type === "LOAD_DATA") next = action.payload;
  else if (action.type === "RESET_DATA")
    next = {
      ...state,
      transactions: [],
      categories: [],
      accounts: [],
      budgets: [],
    };
  else if (action.type === "UPDATE_PREFERENCE")
    next = { ...state, preference: action.payload };
  else {
    const [operation, entity] = action.type.split("_");
    const key = (
      {
        TRANSACTION: "transactions",
        CATEGORY: "categories",
        ACCOUNT: "accounts",
        BUDGET: "budgets",
      } as const
    )[entity as "TRANSACTION" | "CATEGORY" | "ACCOUNT" | "BUDGET"];
    const list = state[key];
    const id =
      typeof action.payload === "string" ? action.payload : action.payload.id;
    if (operation !== "ADD" && !list.some((x) => x.id === id))
      throw new Error("Data tidak ditemukan. Muat ulang halaman.");
    if (operation === "ADD" && list.some((x) => x.id === id))
      throw new Error("ID sudah digunakan.");
    if (
      operation === "DELETE" &&
      (entity === "CATEGORY" || entity === "ACCOUNT")
    ) {
      const error = deletionError(state, entity, id);
      if (error) throw new Error(error);
    }
    next = {
      ...state,
      [key]:
        operation === "ADD"
          ? [...list, action.payload]
          : operation === "DELETE"
            ? list.filter((x) => x.id !== id)
            : list.map((x) => (x.id === id ? action.payload : x)),
    };
  }
  if (!isFinanceState(next))
    throw new Error(
      "Data tidak valid atau relasinya tidak sesuai. Periksa kembali formulir.",
    );
  return next;
}
