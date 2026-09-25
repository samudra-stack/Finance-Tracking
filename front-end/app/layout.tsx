import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";

const inter = localFont({
  src: "../public/fonts/InterVariable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  icons: { icon: "/icons/wallet.svg" },
  title: {
    default: "MyFinance — Take Control of Your Money",
    template: "%s | MyFinance",
  },
  description:
    "Kelola pemasukan, pengeluaran, akun, dan anggaran pribadi. Pratinjau antarmuka MyFinance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
