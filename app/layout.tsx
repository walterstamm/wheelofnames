import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cumorah Wheel",
  description: "Name wheel prototype with basic controls"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
