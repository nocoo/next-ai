import Link from "next/link";
import type { ReactNode } from "react";
import { CssVariables } from "./css-variables";
import "./globals.css";

export const metadata = {
  title: "next-ai example",
  description: "Example app for @nocoo/next-ai",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <CssVariables />
      </head>
      <body>
        <header className="px-8 pt-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <img src="/logo-64.png" width={32} height={32} alt="next-ai logo" />
            <span className="font-semibold">next-ai</span>
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
