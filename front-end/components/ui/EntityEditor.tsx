"use client";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select } from "./Select";
import { useToast } from "@/contexts/ToastContext";
import { useFinance } from "@/contexts/FinanceContext";
import { currentMonth } from "@/lib/calculations";
import {
  validateAccount,
  validateBudget,
  validateCategory,
  type Errors,
} from "@/lib/validators";
import type { Account, Category, Budget } from "@/types/finance";
type Props =
  | { entity: "kategori"; item?: Category }
  | { entity: "akun"; item?: Account }
  | { entity: "anggaran"; item?: Budget };
export function EntityEditor(props: Props) {
  const [open, setOpen] = useState(false);
  const { state } = useFinance();
  const item = props.item;
  const name =
    item &&
    ("name" in item
      ? item.name
      : state.categories.find((c) => c.id === item.categoryId)?.name);
  return (
    <>
      <Button
        variant={props.item ? "ghost" : "primary"}
        aria-label={`${props.item ? "Edit" : "Tambah"} ${name ?? props.entity}`}
        onClick={() => setOpen(true)}
      >
        {props.item ? (
          <Pencil size={15} />
        ) : (
          <>
            <Plus size={16} />
            Tambah
          </>
        )}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`${props.item ? "Edit" : "Tambah"} ${props.entity}`}
      >
        <EntityForm {...props} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}
function EntityForm(props: Props & { onClose: () => void }) {
  const { state, execute } = useFinance();
  const notify = useToast();
  const [errors, setErrors] = useState<Errors>({});
  const category = props.entity === "kategori" ? props.item : undefined;
  const account = props.entity === "akun" ? props.item : undefined;
  const budget = props.entity === "anggaran" ? props.item : undefined;
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const get = (name: string) => String(data.get(name) ?? "").trim();
        const id = props.item?.id ?? crypto.randomUUID();
        let issues: Errors;
        let result: string | null;
        if (props.entity === "kategori") {
          const payload: Category = {
            id,
            name: get("name"),
            type: get("type") as Category["type"],
            color: get("color"),
            icon: get("icon"),
          };
          issues = validateCategory(payload, state);
          setErrors(issues);
          if (Object.keys(issues).length) return;
          result = execute({
            type: props.item ? "UPDATE_CATEGORY" : "ADD_CATEGORY",
            payload,
          });
        } else if (props.entity === "akun") {
          const payload: Account = {
            id,
            name: get("name"),
            type: get("type") as Account["type"],
            initialBalance:
              get("initialBalance") === ""
                ? NaN
                : Number(get("initialBalance")),
            icon: get("icon"),
            isActive: data.get("isActive") === "on",
          };
          issues = validateAccount(payload);
          setErrors(issues);
          if (Object.keys(issues).length) return;
          result = execute({
            type: props.item ? "UPDATE_ACCOUNT" : "ADD_ACCOUNT",
            payload,
          });
        } else {
          const payload: Budget = {
            id,
            categoryId: get("categoryId"),
            month: get("month"),
            limitAmount: Number(get("limitAmount")),
          };
          issues = validateBudget(payload, state);
          setErrors(issues);
          if (Object.keys(issues).length) return;
          result = execute({
            type: props.item ? "UPDATE_BUDGET" : "ADD_BUDGET",
            payload,
          });
        }
        if (result) {
          setErrors({ form: result });
          return;
        }
        notify(
          `${props.entity} berhasil ${props.item ? "diperbarui" : "ditambahkan"}.`,
        );
        props.onClose();
      }}
    >
      {props.entity !== "anggaran" && (
        <Input
          label="Nama"
          name="name"
          defaultValue={category?.name ?? account?.name}
          error={errors.name}
          required
          maxLength={80}
        />
      )}
      {props.entity === "kategori" && (
        <>
          <Select
            label="Jenis"
            name="type"
            defaultValue={category?.type ?? "expense"}
            error={errors.type}
          >
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </Select>
          <Input
            label="Warna"
            name="color"
            type="color"
            defaultValue={category?.color ?? "#8b5cf6"}
            error={errors.color}
          />
        </>
      )}
      {props.entity === "akun" && (
        <>
          <Select
            label="Jenis akun"
            name="type"
            defaultValue={account?.type ?? "bank"}
            error={errors.type}
          >
            <option value="bank">Bank</option>
            <option value="cash">Tunai</option>
            <option value="e-wallet">E-wallet</option>
          </Select>
          <Input
            label="Saldo awal (Rp)"
            name="initialBalance"
            type="number"
            step="any"
            defaultValue={account?.initialBalance ?? 0}
            error={errors.initialBalance}
            required
          />
          <label className="setting-row">
            <span>Akun aktif</span>
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={account?.isActive ?? true}
            />
          </label>
        </>
      )}
      {props.entity !== "anggaran" && (
        <Select
          label="Ikon"
          name="icon"
          defaultValue={category?.icon ?? account?.icon ?? "wallet"}
          error={errors.icon}
        >
          {[
            "wallet",
            "utensils",
            "car",
            "receipt",
            "bag",
            "sparkles",
            "heart",
            "briefcase",
            "landmark",
            "banknote",
          ].map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </Select>
      )}
      {props.entity === "anggaran" && (
        <>
          <Select
            label="Kategori pengeluaran"
            name="categoryId"
            defaultValue={budget?.categoryId ?? ""}
            error={errors.categoryId}
          >
            <option value="">Pilih kategori</option>
            {state.categories
              .filter((c) => c.type === "expense")
              .map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
          </Select>
          <Input
            label="Periode"
            name="month"
            type="month"
            defaultValue={budget?.month ?? currentMonth()}
            error={errors.month}
          />
          <Input
            label="Batas anggaran (Rp)"
            name="limitAmount"
            type="number"
            step="any"
            defaultValue={budget?.limitAmount}
            error={errors.limitAmount}
          />
        </>
      )}
      {errors.form && (
        <p className="field-error" role="alert">
          {errors.form}
        </p>
      )}
      <div className="modal-actions">
        <Button variant="secondary" onClick={props.onClose}>
          Batal
        </Button>
        <Button type="submit">Simpan {props.entity}</Button>
      </div>
    </form>
  );
}
