import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="MyFinance — halaman masuk">
      <span className="brand-mark" aria-hidden="true">
        M
      </span>
      <span>MyFinance</span>
    </Link>
  );
}
