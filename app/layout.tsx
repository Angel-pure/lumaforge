import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LumaForge — Create clearly. Publish confidently.",
  description: "A focused workspace for creating and approving on-brand content.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
