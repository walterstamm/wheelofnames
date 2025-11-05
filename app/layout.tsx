import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cumorah Wheel",
  description: "Ruleta de nombres con controles básicos"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
