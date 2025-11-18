import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventScout AI - Smart Networking Assistant",
  description: "AI-powered networking assistant for green energy and industrial events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
