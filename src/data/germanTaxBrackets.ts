// Marginal rate presets for quick selection
export const marginalRatePresets = [
  { label: '0%', rate: 0 },
  { label: '14%', rate: 14 },
  { label: '24%', rate: 24 },
  { label: '33%', rate: 33 },
  { label: '42%', rate: 42 },
  { label: '45%', rate: 45 },
]

// German tax brackets (2024) for calculating marginal rate from income
// Based on German income tax formula (Einkommensteuergesetz)
export function calculateMarginalRate(taxableIncome: number): number {
  if (taxableIncome <= 11604) {
    // Grundfreibetrag - no tax
    return 0
  } else if (taxableIncome <= 17005) {
    // First progression zone (14% - ~24%)
    const y = (taxableIncome - 11604) / 10000
    // Marginal rate derivative: 14 + 2 * 922.98 * y
    return 14 + 2 * 922.98 * y
  } else if (taxableIncome <= 66760) {
    // Second progression zone (~24% - 42%)
    const z = (taxableIncome - 17005) / 10000
    // Marginal rate derivative: ~24 + 2 * 181.19 * z
    return 23.97 + 2 * 181.19 * z
  } else if (taxableIncome <= 277825) {
    // Linear zone at 42%
    return 42
  } else {
    // Top rate zone at 45% (Reichensteuer)
    return 45
  }
}
