# DeFi Visual

Interactive DeFi education platform — learn how DeFi protocols actually work through hands-on simulations powered by real protocol math. No wallet needed.

**Built by [@Eli5DeFi](https://x.com/Eli5defi)**

---

## Simulators

| Simulator | What You'll Learn |
|---|---|
| **AMMs & Impermanent Loss** | Constant product formula (`x × y = k`), price impact, slippage, LP fee accrual, and how IL changes with price divergence |
| **MEV Sandwich Attacks** | How searcher bots extract value from the mempool — front-running, back-running, and profit optimization curves |
| **Flash Loans** | Aave-style uncollateralized borrowing, arbitrage execution, gas cost analysis, and profit/loss calculations |
| **Pendle PT/YT** | Yield tokenization — splitting yield-bearing assets into Principal Tokens and Yield Tokens, and how they converge at maturity |
| **APY Calculator** | APR vs APY comparison, compounding frequency effects (annual → per-block), growth curves, and yield source breakdowns |
| **Funding Rates & OI** | Perpetual futures funding mechanics, long/short OI imbalances, mark vs index price, cumulative funding cost, and position PnL with leverage |
| **Money Legos** | DeFi composability — stack protocols like building blocks (Aave, Lido, Curve, Convex, Pendle, Yearn, Morpho, EigenLayer) with risk scoring and capital flow visualization |

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **UI:** [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [Framer Motion](https://www.framer.com/motion/)
- **Charts:** [Recharts](https://recharts.org)
- **Icons:** [Lucide React](https://lucide.dev)
- **Language:** TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to start exploring.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main page with tab navigation
│   ├── layout.tsx            # Root layout + SEO metadata
│   └── globals.css           # Theme, animations, glass-card styles
├── components/
│   ├── amm/                  # AMM simulator (pool viz, charts, swap panel)
│   ├── mev/                  # MEV simulator (mempool viz, profit chart)
│   ├── flashloan/            # Flash loan simulator
│   ├── pendle/               # Pendle PT/YT simulator
│   ├── apy/                  # APY calculator (growth chart, breakdown)
│   ├── funding/              # Funding rate & OI simulator
│   ├── composability/        # Money Legos stack builder
│   └── ui/                   # Shared UI primitives (Button, Slider, Tabs, Card)
└── lib/
    ├── mathEngine.ts         # AMM math (constant product, IL, swap)
    ├── mevEngine.ts          # Sandwich attack calculations
    ├── flashLoanEngine.ts    # Flash loan arbitrage math
    ├── pendleEngine.ts       # Yield tokenization math
    ├── apyEngine.ts          # APR/APY conversion, growth curves
    ├── fundingEngine.ts      # Funding rate, OI, position PnL
    ├── composabilityEngine.ts # DeFi stack builder logic
    ├── constants.ts          # Shared chart styling, theme tokens, defaults
    └── utils.ts              # Tailwind class merge utility
```

## Design

- **Theme:** Dark teal/cyan with amber accents on `#030712` background
- **Glass cards** with backdrop blur and subtle animated gradient borders
- **Consistent chart styling** via shared constants (`CHART_MARGIN`, `CHART_GRID`, `CHART_AXIS`, `CHART_TICK`, `CHART_TOOLTIP_STYLE`)
- **Accessible:** `aria-expanded`, `aria-selected`, `aria-label`, focus-visible rings, reduced-motion support

## Deploy

Deploy to [Vercel](https://vercel.com/new) — zero config for Next.js:

```bash
npx vercel
```

## License

Educational use. Not financial advice.
