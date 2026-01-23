<script setup lang="ts">
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

  // Financing
  equity: number
  loanAmount: number
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
  annualTaxSavings: number
  monthlyCashFlowAfterTax: number
  annualCashFlowAfterTax: number
  cashOnCashReturnAfterTax: number
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
  if (value >= 5) return 'text-green-600'
  if (value >= 3) return 'text-yellow-600'
  return 'text-red-600'
}

function getRentMultiplierColor(value: number): string {
  if (value <= 20) return 'text-green-600'
  if (value <= 25) return 'text-yellow-600'
  return 'text-red-600'
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Results Summary (Ergebnisübersicht)</h2>

    <div class="space-y-6">
      <!-- Purchase Costs Breakdown -->
      <div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">Purchase Costs (Kaufnebenkosten)</h3>
        <div class="bg-gray-50 rounded-md p-4 space-y-2">
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
            <span>{{ formatCurrency(totalPurchaseCosts) }} ({{ formatPercent(purchaseCostsRate) }})</span>
          </div>
          <div class="flex justify-between font-bold text-lg">
            <span>Total Investment (Gesamtinvestition)</span>
            <span class="text-blue-600">{{ formatCurrency(totalInvestment) }}</span>
          </div>
        </div>
      </div>

      <!-- Cash Flow -->
      <div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">Monthly Cash Flow (Monatlicher Cashflow)</h3>
        <div class="bg-gray-50 rounded-md p-4 space-y-2">
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
          <div class="flex justify-between font-bold text-lg">
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
        </div>
      </div>

      <!-- Key Metrics -->
      <div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">Key Metrics (Kennzahlen)</h3>
        <div class="grid grid-cols-2 gap-3">
          <!-- Gross Yield -->
          <div class="bg-blue-50 rounded-md p-3 text-center relative group cursor-help">
            <p class="text-xs text-blue-600 mb-1">Gross Yield (Bruttorendite)</p>
            <p class="text-xl font-bold" :class="getYieldColor(grossYield)">
              {{ formatPercent(grossYield) }}
            </p>
            <p class="text-xs text-gray-500">Annual Rent / Purchase Price</p>
            <div class="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-10 w-48 -top-2 left-1/2 -translate-x-1/2 -translate-y-full">
              Annual rent divided by purchase price. Does not account for purchase costs or expenses.
            </div>
          </div>

          <!-- Net Yield -->
          <div class="bg-blue-50 rounded-md p-3 text-center relative group cursor-help">
            <p class="text-xs text-blue-600 mb-1">Net Yield (Nettorendite)</p>
            <p class="text-xl font-bold" :class="getYieldColor(netYield)">
              {{ formatPercent(netYield) }}
            </p>
            <p class="text-xs text-gray-500">NOI / Total Investment</p>
            <div class="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-10 w-48 -top-2 left-1/2 -translate-x-1/2 -translate-y-full">
              Net operating income divided by total investment including purchase costs.
            </div>
          </div>

          <!-- Cash on Cash -->
          <div class="bg-purple-50 rounded-md p-3 text-center relative group cursor-help">
            <p class="text-xs text-purple-600 mb-1">Cash-on-Cash Return (Eigenkapitalrendite)</p>
            <p class="text-xl font-bold" :class="getCashFlowColor(cashOnCashReturn)">
              {{ formatPercent(cashOnCashReturn) }}
            </p>
            <p class="text-xs text-gray-500">Cash Flow / Equity</p>
            <div class="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-10 w-48 -top-2 left-1/2 -translate-x-1/2 -translate-y-full">
              Annual cash flow after mortgage payments divided by equity invested. Shows actual return on your cash.
            </div>
          </div>

          <!-- Rent Multiplier -->
          <div class="bg-amber-50 rounded-md p-3 text-center relative group cursor-help">
            <p class="text-xs text-amber-600 mb-1">Rent Multiplier (Kaufpreisfaktor)</p>
            <p class="text-xl font-bold" :class="getRentMultiplierColor(rentMultiplier)">
              {{ rentMultiplier.toFixed(1) }}x
            </p>
            <p class="text-xs text-gray-500">Purchase Price / Annual Rent</p>
            <div class="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-10 w-48 -top-2 left-1/2 -translate-x-1/2 -translate-y-full">
              Purchase price divided by annual rent. Lower is better. Under 20 is good, under 25 is acceptable.
            </div>
          </div>

          <!-- Tax-Adjusted Return -->
          <div class="bg-green-50 rounded-md p-3 text-center relative group cursor-help col-span-2">
            <p class="text-xs text-green-600 mb-1">Tax-Adjusted Return (Rendite nach Steuervorteil)</p>
            <p class="text-xl font-bold" :class="getCashFlowColor(cashOnCashReturnAfterTax)">
              {{ formatPercent(cashOnCashReturnAfterTax) }}
            </p>
            <p class="text-xs text-gray-500">Cash Flow + Tax Savings / Equity</p>
            <div class="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-10 w-48 -top-2 left-1/2 -translate-x-1/2 -translate-y-full">
              Annual cash flow including tax savings divided by equity invested. Shows actual return considering tax benefits.
            </div>
          </div>
        </div>
      </div>

      <!-- Tax Benefits -->
      <div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">Tax Benefits (Steuerliche Vorteile)</h3>
        <div class="bg-gray-50 rounded-md p-4 space-y-2">
          <!-- Header -->
          <div class="flex justify-between text-xs text-gray-500 font-medium">
            <span></span>
            <div class="flex gap-4">
              <span class="w-20 text-right">Monthly</span>
              <span class="w-20 text-right">Annual</span>
            </div>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Depreciation (AfA)</span>
            <div class="flex gap-4">
              <span class="w-20 text-right text-green-600">{{ formatCurrency(annualDepreciation / 12) }}</span>
              <span class="w-20 text-right text-green-600">{{ formatCurrency(annualDepreciation) }}</span>
            </div>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Deductible Interest (Schuldzinsen)</span>
            <div class="flex gap-4">
              <span class="w-20 text-right text-green-600">{{ formatCurrency(annualDeductibleInterest / 12) }}</span>
              <span class="w-20 text-right text-green-600">{{ formatCurrency(annualDeductibleInterest) }}</span>
            </div>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Operating Costs (Bewirtschaftungskosten)</span>
            <div class="flex gap-4">
              <span class="w-20 text-right text-green-600">{{ formatCurrency(annualExpenses / 12) }}</span>
              <span class="w-20 text-right text-green-600">{{ formatCurrency(annualExpenses) }}</span>
            </div>
          </div>
          <hr class="border-gray-300" />
          <div class="flex justify-between font-medium">
            <span>Total Deductible (Absetzbar gesamt)</span>
            <div class="flex gap-4">
              <span class="w-20 text-right text-green-600">{{ formatCurrency(totalDeductibleExpenses / 12) }}</span>
              <span class="w-20 text-right text-green-600">{{ formatCurrency(totalDeductibleExpenses) }}</span>
            </div>
          </div>
          <div class="flex justify-between font-bold text-lg bg-green-100 -mx-4 px-4 py-2 rounded">
            <span>Tax Savings (Steuerersparnis)</span>
            <div class="flex gap-4">
              <span class="w-20 text-right text-green-600">{{ formatCurrency(annualTaxSavings / 12) }}</span>
              <span class="w-20 text-right text-green-600">{{ formatCurrency(annualTaxSavings) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Effective Cash Flow After Tax -->
      <div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">Effective Cash Flow (After Tax Benefits)</h3>
        <div class="bg-green-50 rounded-md p-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Pre-Tax Cash Flow</span>
            <span :class="getCashFlowColor(monthlyCashFlow)">{{ formatCurrency(monthlyCashFlow) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">+ Monthly Tax Savings</span>
            <span class="text-green-600">+{{ formatCurrency(annualTaxSavings / 12) }}</span>
          </div>
          <hr class="border-green-300" />
          <div class="flex justify-between font-bold text-lg">
            <span>= Effective Monthly Cash Flow</span>
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

      <!-- Legend -->
      <div class="text-xs text-gray-500 space-y-1">
        <p><span class="text-green-600 font-medium">Green</span>: Good values |
           <span class="text-yellow-600 font-medium">Yellow</span>: Acceptable |
           <span class="text-red-600 font-medium">Red</span>: Critical</p>
        <p>Gross Yield: &gt;5% good | Rent Multiplier: &lt;20 good, &lt;25 acceptable</p>
      </div>
    </div>
  </div>
</template>
