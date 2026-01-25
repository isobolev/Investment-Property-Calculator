# Investment Property Calculator (Immobilien Renditerechner)

A comprehensive Vue.js calculator for analyzing real estate investment returns in Germany (Buy to Let investment). Compare property investment with stocks/ETFs alternative, accounting for taxes and financing.

## Features

### Investment Parameters

- **Purchase Data**: Property price, state-specific transfer tax, notary fees, land registry fees, broker fees
- **Financing**: Equity, interest rate, repayment rate, loan term calculation
- **Rental Income**: Monthly rent, Hausgeld, maintenance reserve, vacancy rate
- **Tax Settings**: Depreciation (AfA), land value percentage, marginal tax rate, solidarity surcharge
- **Assumptions**: Property appreciation, holding period, alternative investment return (stocks/ETF)

### Analysis & Results

- **Purchase Costs Breakdown**: All acquisition costs with percentages
- **Tax Benefits**: Depreciation, deductible interest, operating costs, tax savings/liability
- **Cash Flow**: Monthly and annual cash flow before and after tax
- **Key Metrics**: Gross yield, net yield, cash-on-cash return, rent multiplier
- **Resale Analysis**:
  - Projected sale price with appreciation
  - Remaining loan balance
  - Net profit (nominal and inflation-adjusted)
  - ROI on equity (CAGR, nominal and real)
- **Alternative Investment Comparison**:
  - Stocks/ETF portfolio growth simulation
  - Capital gains tax (26.375% German Abgeltungssteuer)
  - Side-by-side comparison with real estate

### German Tax Specifics

- State-specific property transfer tax rates (Grunderwerbsteuer)
- 2% annual depreciation (AfA) for buildings
- Deductible mortgage interest
- Tax-free capital gains after 10 years (Spekulationsfrist)
- Capital gains tax on stocks/ETF (25% + 5.5% Soli)

## Tech Stack

- **Vue 3** with Composition API and `<script setup>`
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Vite** for development and building

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality

```bash
# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

## Project Structure

```
src/
├── components/
│   ├── PropertyInput.vue      # Purchase price and costs
│   ├── FinancingInput.vue     # Loan and equity settings
│   ├── RentalInput.vue        # Rental income settings
│   ├── TaxInput.vue           # Tax-related settings
│   ├── AssumptionsInput.vue   # Appreciation, holding period, alt. investment
│   └── ResultsSummary.vue     # All calculated results
├── composables/
│   └── useCalculations.ts     # Core calculation logic
├── data/
│   ├── germanStates.ts        # State tax rates
│   └── germanTaxBrackets.ts   # Income tax brackets
├── App.vue                    # Main application
└── main.ts                    # Entry point
```

## Calculations

### Key Formulas

**Gross Yield**: `Annual Rent / Purchase Price × 100`

**Net Yield**: `(Annual Rent - Expenses) / Total Investment × 100`

**Cash-on-Cash Return**: `Annual Cash Flow After Tax / Equity × 100`

**Loan Term**: `n = -log(1 - (P × r / PMT)) / log(1 + r)`

**ROI (CAGR)**: `((End Value / Start Value) ^ (1/years)) - 1`

### Alternative Investment Simulation

The stocks/ETF comparison:

1. Invests initial equity
2. Adds monthly contributions equal to negative cash flow (if any)
3. Compounds at the specified return rate
4. Deducts 26.375% capital gains tax on profits

## License

MIT
