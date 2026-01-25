import { computed, type Ref } from 'vue'
import { calculateMarginalRate } from '../data/germanTaxBrackets'

export interface PropertyInputs {
  purchasePrice: Ref<number>
  stateCode: Ref<string>
  stateTaxRate: Ref<number>
  notaryRate: Ref<number>
  landRegistryRate: Ref<number>
  brokerRate: Ref<number>
  includeBroker: Ref<boolean>
}

export interface FinancingInputs {
  equity: Ref<number>
  interestRate: Ref<number>
  repaymentRate: Ref<number>
}

export interface RentalInputs {
  monthlyRent: Ref<number>
  monthlyHausgeld: Ref<number>
  maintenanceReserve: Ref<number>
  vacancyRate: Ref<number>
}

export interface TaxInputs {
  depreciationRate: Ref<number>
  landValuePercent: Ref<number>
  taxInputMode: Ref<'rate' | 'income'>
  marginalTaxRate: Ref<number>
  taxableIncome: Ref<number>
  includeSoli: Ref<boolean>
  jointTaxDeclaration: Ref<boolean>
}

export function useCalculations(
  property: PropertyInputs,
  financing: FinancingInputs,
  rental: RentalInputs,
  tax?: TaxInputs
) {
  // Purchase costs (Kaufnebenkosten)
  const transferTax = computed(
    () => property.purchasePrice.value * (property.stateTaxRate.value / 100)
  )

  const notaryFees = computed(
    () => property.purchasePrice.value * (property.notaryRate.value / 100)
  )

  const landRegistryFees = computed(
    () => property.purchasePrice.value * (property.landRegistryRate.value / 100)
  )

  const brokerFees = computed(() =>
    property.includeBroker.value
      ? property.purchasePrice.value * (property.brokerRate.value / 100)
      : 0
  )

  const totalPurchaseCosts = computed(
    () => transferTax.value + notaryFees.value + landRegistryFees.value + brokerFees.value
  )

  const purchaseCostsRate = computed(() =>
    property.purchasePrice.value > 0
      ? (totalPurchaseCosts.value / property.purchasePrice.value) * 100
      : 0
  )

  // Total investment
  const totalInvestment = computed(() => property.purchasePrice.value + totalPurchaseCosts.value)

  // Financing
  const loanAmount = computed(() => Math.max(0, totalInvestment.value - financing.equity.value))

  const loanToValue = computed(() =>
    property.purchasePrice.value > 0 ? (loanAmount.value / property.purchasePrice.value) * 100 : 0
  )

  // Monthly mortgage payment (annuity formula)
  // Monthly payment = Loan * (interest + repayment) / 12
  const monthlyMortgage = computed(() => {
    if (loanAmount.value <= 0) return 0
    const annualRate = (financing.interestRate.value + financing.repaymentRate.value) / 100
    return (loanAmount.value * annualRate) / 12
  })

  const annualMortgage = computed(() => monthlyMortgage.value * 12)

  // Interest portion only (for tax purposes)
  const monthlyInterest = computed(() => {
    if (loanAmount.value <= 0) return 0
    return (loanAmount.value * (financing.interestRate.value / 100)) / 12
  })

  // Rental income
  const effectiveMonthlyRent = computed(
    () => rental.monthlyRent.value * (1 - rental.vacancyRate.value / 100)
  )

  const annualRent = computed(() => rental.monthlyRent.value * 12)
  const effectiveAnnualRent = computed(() => effectiveMonthlyRent.value * 12)

  // Monthly expenses (non-recoverable)
  const monthlyExpenses = computed(
    () => rental.monthlyHausgeld.value + rental.maintenanceReserve.value
  )

  const annualExpenses = computed(() => monthlyExpenses.value * 12)

  // Cash flow
  const monthlyCashFlow = computed(
    () => effectiveMonthlyRent.value - monthlyExpenses.value - monthlyMortgage.value
  )

  const annualCashFlow = computed(() => monthlyCashFlow.value * 12)

  // Net operating income (before financing)
  const monthlyNOI = computed(() => effectiveMonthlyRent.value - monthlyExpenses.value)

  const annualNOI = computed(() => monthlyNOI.value * 12)

  // Yields
  const grossYield = computed(() =>
    property.purchasePrice.value > 0 ? (annualRent.value / property.purchasePrice.value) * 100 : 0
  )

  const netYield = computed(() =>
    totalInvestment.value > 0 ? (annualNOI.value / totalInvestment.value) * 100 : 0
  )

  // Rent multiplier (Kaufpreisfaktor)
  const rentMultiplier = computed(() =>
    annualRent.value > 0 ? property.purchasePrice.value / annualRent.value : 0
  )

  // Tax calculations (only computed if tax inputs provided)
  const depreciationRate = computed(() => {
    if (!tax) return 2
    return tax.depreciationRate.value
  })

  // Total acquisition costs (Anschaffungskosten) for depreciation base
  // Includes purchase price + Anschaffungsnebenkosten (transfer tax, notary fees, land registry, broker)
  // All these costs are depreciated proportionally (building portion only)
  const totalAcquisitionCost = computed(
    () => property.purchasePrice.value + totalPurchaseCosts.value
  )

  const buildingValue = computed(() => {
    if (!tax) return totalAcquisitionCost.value * 0.8
    return totalAcquisitionCost.value * (1 - tax.landValuePercent.value / 100)
  })

  const landValue = computed(() => {
    if (!tax) return totalAcquisitionCost.value * 0.2
    return totalAcquisitionCost.value * (tax.landValuePercent.value / 100)
  })

  const annualDepreciation = computed(() => buildingValue.value * (depreciationRate.value / 100))

  const effectiveMarginalRate = computed(() => {
    if (!tax) return 42
    let baseRate: number
    if (tax.taxInputMode.value === 'income') {
      // Apply income splitting (Splittingverfahren) for joint tax declaration
      const incomeForCalculation = tax.jointTaxDeclaration.value
        ? tax.taxableIncome.value / 2
        : tax.taxableIncome.value
      baseRate = calculateMarginalRate(incomeForCalculation)
    } else {
      baseRate = tax.marginalTaxRate.value
    }
    // Add Solidaritätszuschlag if enabled (5.5% of the tax rate)
    if (tax.includeSoli.value) {
      return baseRate * 1.055
    }
    return baseRate
  })

  const annualDeductibleInterest = computed(() => monthlyInterest.value * 12)

  const totalDeductibleExpenses = computed(
    () => annualDepreciation.value + annualDeductibleInterest.value + annualExpenses.value
  )

  // Taxable rental income (Einkünfte aus Vermietung und Verpachtung)
  // Negative = loss that offsets other income, Positive = taxable profit
  const taxableRentalIncome = computed(
    () => effectiveAnnualRent.value - totalDeductibleExpenses.value
  )

  // Tax impact: negative taxable income = savings, positive = tax due
  // We express this as "savings" so negative value means tax due
  const annualTaxSavings = computed(
    () => -taxableRentalIncome.value * (effectiveMarginalRate.value / 100)
  )

  const monthlyTaxSavings = computed(() => annualTaxSavings.value / 12)

  const monthlyCashFlowAfterTax = computed(() => monthlyCashFlow.value + monthlyTaxSavings.value)

  const annualCashFlowAfterTax = computed(() => monthlyCashFlowAfterTax.value * 12)

  // Cash-on-cash return (return on equity invested, after tax)
  const cashOnCashReturn = computed(() =>
    financing.equity.value > 0 ? (annualCashFlowAfterTax.value / financing.equity.value) * 100 : 0
  )

  return {
    // Purchase costs
    transferTax,
    notaryFees,
    landRegistryFees,
    brokerFees,
    totalPurchaseCosts,
    purchaseCostsRate,
    totalInvestment,

    // Financing
    loanAmount,
    loanToValue,
    monthlyMortgage,
    annualMortgage,
    monthlyInterest,

    // Rental
    effectiveMonthlyRent,
    annualRent,
    effectiveAnnualRent,
    monthlyExpenses,
    annualExpenses,

    // Cash flow
    monthlyCashFlow,
    annualCashFlow,
    monthlyNOI,
    annualNOI,

    // Yields
    grossYield,
    netYield,
    cashOnCashReturn,
    rentMultiplier,

    // Tax calculations
    depreciationRate,
    totalAcquisitionCost,
    buildingValue,
    landValue,
    annualDepreciation,
    effectiveMarginalRate,
    annualDeductibleInterest,
    totalDeductibleExpenses,
    taxableRentalIncome,
    annualTaxSavings,
    monthlyTaxSavings,
    monthlyCashFlowAfterTax,
    annualCashFlowAfterTax,
  }
}
