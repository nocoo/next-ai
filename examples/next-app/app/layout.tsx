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
      <body>{children}</body>
    </html>
  );
}
