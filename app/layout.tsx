import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LumaForge — Create clearly. Publish confidently.",
  description: "A content workspace for drafting, reviewing, and managing on-brand work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
