import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#071115",
};

export const metadata: Metadata = {
  title: "DeFi Visual - Interactive DeFi Education",
  description:
    "Learn DeFi mechanisms through interactive simulations. Understand AMMs, Impermanent Loss, MEV sandwich attacks, flash loans, and Pendle yield tokenization with hands-on visualizations.",
  keywords: [
    "DeFi", "AMM", "Impermanent Loss", "MEV", "Sandwich Attack",
    "Flash Loans", "Pendle", "Yield Tokenization", "Education", "Blockchain",
    "Uniswap", "Aave", "Constant Product",
  ],
  openGraph: {
    title: "DeFi Visual - Interactive DeFi Education",
    description: "Master DeFi primitives through interactive simulations powered by real protocol math.",
    type: "website",
  },
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
