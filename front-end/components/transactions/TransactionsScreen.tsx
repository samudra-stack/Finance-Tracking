"use client";
import { useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { TransactionFilter } from "./TransactionFilter";
import { TransactionTable } from "./TransactionTable";
import { Pagination } from "@/components/ui/Pagination";
import { SetupGuide } from "@/components/ui/SetupGuide";
import { defaultQuery, paginate, queryTransactions } from "@/lib/calculations";
export function TransactionsScreen() {
  const { state } = useFinance();
  const [query, setQuery] = useState(defaultQuery);
  const [page, setPage] = useState(1);
  const result = paginate(queryTransactions(state.transactions, query), page);
  return (
    <>
      <SetupGuide />
      <TransactionFilter
        query={query}
        onChange={(value) => {
          setQuery(value);
          setPage(1);
        }}
      />
      <TransactionTable rows={result.rows} />
      <Pagination {...result} onChange={setPage} />
    </>
  );
}
