<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  // Purchase costs
  purchasePrice: number
  transferTax: number
  notaryFees: number
  landRegistryFees: number
  brokerFees: number
  totalPurchaseCosts: number
  purchaseCostsRate: number
  totalInvestment: number

  // Assumptions
  appreciationRate: number
  holdingPeriod: number

  // Financing
  equity: number
  loanAmount: number
  interestRate: number
  monthlyMortgage: number
  annualMortgage: number

  // Cash flow
  effectiveMonthlyRent: number
  monthlyExpenses: number
  monthlyCashFlow: number
  annualCashFlow: number

  // Yields
  grossYield: number
  netYield: number
  cashOnCashReturn: number
  rentMultiplier: number

  // Tax calculations
  annualDepreciation: number
  annualDeductibleInterest: number
  annualExpenses: number
  totalDeductibleExpenses: number
  effectiveAnnualRent: number
  taxableRentalIncome: number
  annualTaxSavings: number
  monthlyCashFlowAfterTax: number
  annualCashFlowAfterTax: number
}>()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number): string {
  return value.toFixed(2) + '%'
}

function getCashFlowColor(value: number): string {
  if (value > 0) return 'text-green-600'
  if (value < 0) return 'text-red-600'
  return 'text-gray-600'
}

function getYieldColor(value: number): string {
  if (value >= 4) return 'text-green-600'
  if (value >= 3) return 'text-yellow-600'
  return 'text-red-600'
}

function getRentMultiplierColor(value: number): string {
  if (value <= 20) return 'text-green-600'
  if (value <= 25) return 'text-yellow-600'
  return 'text-red-600'
}

// Resale calculations
const resalePrice = computed(
  () => props.purchasePrice * Math.pow(1 + props.appreciationRate / 100, props.holdingPeriod)
)

const appreciation = computed(() => resalePrice.value - props.purchasePrice)

// Remaining loan balance after holding period (annuity formula)
const remainingBalance = computed(() => {
  if (props.loanAmount <= 0 || props.monthlyMortgage <= 0) return 0

  const monthlyRate = props.interestRate / 100 / 12
  const months = props.holdingPeriod * 12

  if (monthlyRate === 0) {
    // No interest case: simple subtraction
    return Math.max(0, props.loanAmount - props.monthlyMortgage * months)
  }

  // Remaining balance = L × (1+r)^n - P × ((1+r)^n - 1) / r
  const factor = Math.pow(1 + monthlyRate, months)
  const balance = props.loanAmount * factor - (props.monthlyMortgage * (factor - 1)) / monthlyRate
  return Math.max(0, balance)
})

const principalPaid = computed(() => props.loanAmount - remainingBalance.value)

const totalOwnContribution = computed(() => {
  const cumulativeNegativeCashFlow =
    props.annualCashFlowAfterTax < 0 ? -props.annualCashFlowAfterTax * props.holdingPeriod : 0
  return props.equity + cumulativeNegativeCashFlow
})

const cumulativeCashFlow = computed(() => props.annualCashFlowAfterTax * props.holdingPeriod)

const netProfitAfterSale = computed(() => {
  const saleProceeds = resalePrice.value - remainingBalance.value
  return saleProceeds + cumulativeCashFlow.value - props.equity
})
</script>

<template>
  <div class="rounded-lg bg-white p-6 shadow-md">
    <h2 class="mb-4 text-xl font-semibold text-gray-800">Results Summary (Ergebnisübersicht)</h2>

    <div class="space-y-6">
      <!-- Purchase Costs Breakdown -->
      <div>
        <h3 class="mb-2 text-lg font-medium text-gray-700">Purchase Costs (Kaufnebenkosten)</h3>
        <div class="space-y-2 rounded-md bg-gray-50 p-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Purchase Price (Kaufpreis)</span>
            <span class="font-medium">{{ formatCurrency(purchasePrice) }}</span>
          </div>
          <hr class="border-gray-200" />
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Property Transfer Tax (Grunderwerbsteuer)</span>
            <span>{{ formatCurrency(transferTax) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Notary Fees (Notarkosten)</span>
            <span>{{ formatCurrency(notaryFees) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Land Registry Fees (Grundbuchkosten)</span>
            <span>{{ formatCurrency(landRegistryFees) }}</span>
          </div>
          <div v-if="brokerFees > 0" class="flex justify-between text-sm">
            <span class="text-gray-600">Broker Fees (Maklergebühren)</span>
            <span>{{ formatCurrency(brokerFees) }}</span>
          </div>
          <hr class="border-gray-300" />
          <div class="flex justify-between font-medium">
            <span>Total Costs (Summe Nebenkosten)</span>
            <span
              >{{ formatCurrency(totalPurchaseCosts) }} ({{
                formatPercent(purchaseCostsRate)
              }})</span
            >
          </div>
          <div class="flex justify-between text-lg font-bold">
            <span>Total Investment (Gesamtinvestition)</span>
            <span class="text-blue-600">{{ formatCurrency(totalInvestment) }}</span>
          </div>
        </div>
      </div>

      <!-- Tax Benefits -->
      <div>
        <h3 class="mb-2 text-lg font-medium text-gray-700">Tax Benefits (Steuerliche Vorteile)</h3>
        <div class="space-y-2 rounded-md bg-gray-50 p-4">
          <!-- Header -->
          <div class="flex justify-between text-xs font-medium text-gray-500">
            <span></span>
            <div class="flex gap-4">
              <span class="w-20 text-right">Monthly</span>
              <span class="w-20 text-right">Annual</span>
            </div>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">+ Rental Income (Mieteinnahmen)</span>
            <div class="flex gap-4">
              <span class="w-20 text-right text-blue-600">{{
                formatCurrency(effectiveAnnualRent / 12)
              }}</span>
              <span class="w-20 text-right text-blue-600">{{
                formatCurrency(effectiveAnnualRent)
              }}</span>
            </div>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">- Depreciation (AfA)</span>
            <div class="flex gap-4">
              <span class="w-20 text-right text-green-600"
                >-{{ formatCurrency(annualDepreciation / 12) }}</span
              >
              <span class="w-20 text-right text-green-600"
                >-{{ formatCurrency(annualDepreciation) }}</span
              >
            </div>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">- Deductible Interest (Schuldzinsen)</span>
            <div class="flex gap-4">
              <span class="w-20 text-right text-green-600"
                >-{{ formatCurrency(annualDeductibleInterest / 12) }}</span
              >
              <span class="w-20 text-right text-green-600"
                >-{{ formatCurrency(annualDeductibleInterest) }}</span
              >
            </div>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">- Operating Costs (Bewirtschaftungskosten)</span>
            <div class="flex gap-4">
              <span class="w-20 text-right text-green-600"
                >-{{ formatCurrency(annualExpenses / 12) }}</span
              >
              <span class="w-20 text-right text-green-600"
                >-{{ formatCurrency(annualExpenses) }}</span
              >
            </div>
          </div>
          <hr class="border-gray-300" />
          <div class="flex justify-between font-medium">
            <span>= Taxable Rental Income (Einkünfte V+V)</span>
            <div class="flex gap-4">
              <span
                class="w-20 text-right"
                :class="taxableRentalIncome < 0 ? 'text-green-600' : 'text-red-600'"
                >{{ formatCurrency(taxableRentalIncome / 12) }}</span
              >
              <span
                class="w-20 text-right"
                :class="taxableRentalIncome < 0 ? 'text-green-600' : 'text-red-600'"
                >{{ formatCurrency(taxableRentalIncome) }}</span
              >
            </div>
          </div>
          <div
            class="-mx-4 flex justify-between rounded px-4 py-2 text-lg font-bold"
            :class="annualTaxSavings >= 0 ? 'bg-green-100' : 'bg-red-100'"
          >
            <span>{{
              annualTaxSavings >= 0 ? 'Tax Savings (Steuerersparnis)' : 'Tax Due (Steuerlast)'
            }}</span>
            <div class="flex gap-4">
              <span
                class="w-20 text-right"
                :class="annualTaxSavings >= 0 ? 'text-green-600' : 'text-red-600'"
                >{{ formatCurrency(Math.abs(annualTaxSavings / 12)) }}</span
              >
              <span
                class="w-20 text-right"
                :class="annualTaxSavings >= 0 ? 'text-green-600' : 'text-red-600'"
                >{{ formatCurrency(Math.abs(annualTaxSavings)) }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Cash Flow -->
      <div>
        <h3 class="mb-2 text-lg font-medium text-gray-700">
          Monthly Cash Flow (Monatlicher Cashflow)
        </h3>
        <div class="space-y-2 rounded-md bg-gray-50 p-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">+ Rental Income (effective)</span>
            <span class="text-green-600">{{ formatCurrency(effectiveMonthlyRent) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">- Non-recoverable Costs</span>
            <span class="text-red-600">-{{ formatCurrency(monthlyExpenses) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">- Mortgage Payment (Kreditrate)</span>
            <span class="text-red-600">-{{ formatCurrency(monthlyMortgage) }}</span>
          </div>
          <hr class="border-gray-300" />
          <div class="flex justify-between text-lg font-bold">
            <span>= Cashflow</span>
            <span :class="getCashFlowColor(monthlyCashFlow)">
              {{ formatCurrency(monthlyCashFlow) }}
            </span>
          </div>
          <div class="flex justify-between text-sm text-gray-500">
            <span>Annual</span>
            <span :class="getCashFlowColor(annualCashFlow)">
              {{ formatCurrency(annualCashFlow) }}
            </span>
          </div>
          <hr class="border-gray-200" />
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">{{
              annualTaxSavings >= 0 ? '+ Tax Savings' : '- Tax Due'
            }}</span>
            <span :class="annualTaxSavings >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ annualTaxSavings >= 0 ? '+' : '-'
              }}{{ formatCurrency(Math.abs(annualTaxSavings / 12)) }}
            </span>
          </div>
          <div class="-mx-4 flex justify-between rounded bg-green-50 px-4 py-2 text-lg font-bold">
            <span>= Cashflow (after tax)</span>
            <span :class="getCashFlowColor(monthlyCashFlowAfterTax)">
              {{ formatCurrency(monthlyCashFlowAfterTax) }}
            </span>
          </div>
          <div class="flex justify-between text-sm text-gray-500">
            <span>Annual</span>
            <span :class="getCashFlowColor(annualCashFlowAfterTax)">
              {{ formatCurrency(annualCashFlowAfterTax) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div>
        <h3 class="mb-2 text-lg font-medium text-gray-700">Key Metrics (Kennzahlen)</h3>
        <div class="grid grid-cols-2 gap-3">
          <!-- Gross Yield -->
          <div class="group relative cursor-help rounded-md bg-blue-50 p-3 text-center">
            <p class="mb-1 text-xs text-blue-600">Gross Yield (Bruttorendite)</p>
            <p class="text-xl font-bold" :class="getYieldColor(grossYield)">
              {{ formatPercent(grossYield) }}
            </p>
            <p class="text-xs text-gray-500">Annual Rent / Purchase Price</p>
            <div
              class="absolute -top-2 left-1/2 z-10 hidden w-48 -translate-x-1/2 -translate-y-full rounded bg-gray-800 p-2 text-xs text-white shadow-lg group-hover:block"
            >
              Annual rent divided by purchase price. Does not account for purchase costs or
              expenses.
            </div>
          </div>

          <!-- Net Yield -->
          <div class="group relative cursor-help rounded-md bg-blue-50 p-3 text-center">
            <p class="mb-1 text-xs text-blue-600">Net Yield (Nettorendite)</p>
            <p class="text-xl font-bold" :class="getYieldColor(netYield)">
              {{ formatPercent(netYield) }}
            </p>
            <p class="text-xs text-gray-500">NOI / Total Investment</p>
            <div
              class="absolute -top-2 left-1/2 z-10 hidden w-48 -translate-x-1/2 -translate-y-full rounded bg-gray-800 p-2 text-xs text-white shadow-lg group-hover:block"
            >
              Net operating income divided by total investment including purchase costs.
            </div>
          </div>

          <!-- Cash on Cash -->
          <div class="group relative cursor-help rounded-md bg-purple-50 p-3 text-center">
            <p class="mb-1 text-xs text-purple-600">Cash-on-Cash Return (Eigenkapitalrendite)</p>
            <p class="text-xl font-bold" :class="getCashFlowColor(cashOnCashReturn)">
              {{ formatPercent(cashOnCashReturn) }}
            </p>
            <p class="text-xs text-gray-500">Cash Flow (after tax) / Equity</p>
            <div
              class="absolute -top-2 left-1/2 z-10 hidden w-48 -translate-x-1/2 -translate-y-full rounded bg-gray-800 p-2 text-xs text-white shadow-lg group-hover:block"
            >
              Annual cash flow including tax benefits divided by equity invested. Shows actual
              return on your cash.
            </div>
          </div>

          <!-- Rent Multiplier -->
          <div class="group relative cursor-help rounded-md bg-amber-50 p-3 text-center">
            <p class="mb-1 text-xs text-amber-600">Rent Multiplier (Kaufpreisfaktor)</p>
            <p class="text-xl font-bold" :class="getRentMultiplierColor(rentMultiplier)">
              {{ rentMultiplier.toFixed(1) }}x
            </p>
            <p class="text-xs text-gray-500">Purchase Price / Annual Rent</p>
            <div
              class="absolute -top-2 left-1/2 z-10 hidden w-48 -translate-x-1/2 -translate-y-full rounded bg-gray-800 p-2 text-xs text-white shadow-lg group-hover:block"
            >
              Purchase price divided by annual rent. Lower is better. Under 20 is good, under 25 is
              acceptable.
            </div>
          </div>
        </div>
      </div>

      <!-- Resale Price -->
      <div>
        <h3 class="mb-2 text-lg font-medium text-gray-700">Resale Price (Verkaufspreis)</h3>
        <div class="mt-3 space-y-2 rounded-md bg-emerald-50 p-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Resale price in {{ holdingPeriod }} years</span>
            <span class="font-medium text-emerald-700">{{ formatCurrency(resalePrice) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Appreciation ({{ appreciationRate }}% p.a.)</span>
            <span class="text-emerald-600">+{{ formatCurrency(appreciation) }}</span>
          </div>
          <p class="text-xs text-gray-500">
            {{
              holdingPeriod >= 10
                ? 'Tax-free sale possible (Spekulationsfrist)'
                : `${10 - holdingPeriod} more years until tax-free sale`
            }}
          </p>
          <hr class="my-2 border-emerald-200" />
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Remaining loan balance at the date of selling</span>
            <span class="font-medium text-red-600">{{ formatCurrency(remainingBalance) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Principal Paid ({{ holdingPeriod }} yrs)</span>
            <span class="text-gray-700">{{ formatCurrency(principalPaid) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Cumulative Cash Flow ({{ holdingPeriod }} yrs)</span>
            <span :class="cumulativeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'">{{
              formatCurrency(cumulativeCashFlow)
            }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Total Own Contribution (Equity + Negative Cash Flow)</span>
            <span class="font-medium text-gray-700">{{
              formatCurrency(totalOwnContribution)
            }}</span>
          </div>
          <hr class="my-2 border-emerald-200" />
          <div class="flex justify-between text-lg font-bold">
            <span>Net Profit (Nettogewinn)</span>
            <span :class="netProfitAfterSale >= 0 ? 'text-emerald-700' : 'text-red-600'">{{
              formatCurrency(netProfitAfterSale)
            }}</span>
          </div>
          <p class="text-xs text-gray-500">
            Sale proceeds − equity + cumulative cash flow (tax-free after 10 years)
          </p>
        </div>
      </div>

      <!-- Legend -->
      <div class="space-y-1 text-xs text-gray-500">
        <p>
          <span class="font-medium text-green-600">Green</span>: Good values |
          <span class="font-medium text-yellow-600">Yellow</span>: Acceptable |
          <span class="font-medium text-red-600">Red</span>: Critical
        </p>
        <p>Gross Yield: &gt;5% good | Rent Multiplier: &lt;20 good, &lt;25 acceptable</p>
      </div>
    </div>
  </div>
</template>
