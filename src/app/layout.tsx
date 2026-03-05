import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeFi Visual - Interactive DeFi Education",
  description:
    "Learn DeFi mechanisms through interactive simulations. Understand AMMs, Impermanent Loss, and more with hands-on visualizations.",
  keywords: ["DeFi", "AMM", "Impermanent Loss", "Education", "Blockchain"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
