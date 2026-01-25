<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  // Purchase costs
  purchasePrice: number;
  transferTax: number;
  notaryFees: number;
  landRegistryFees: number;
  brokerFees: number;
  totalPurchaseCosts: number;
  purchaseCostsRate: number;
  totalInvestment: number;

  // Assumptions
  appreciationRate: number;
  holdingPeriod: number;
  stockReturnRate: number;

  // Financing
  equity: number;
  loanAmount: number;
  interestRate: number;
  monthlyMortgage: number;
  annualMortgage: number;

  // Cash flow
  effectiveMonthlyRent: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  annualCashFlow: number;

  // Yields
  grossYield: number;
  netYield: number;
  cashOnCashReturn: number;
  rentMultiplier: number;

  // Tax calculations
  annualDepreciation: number;
  annualDeductibleInterest: number;
  annualExpenses: number;
  totalDeductibleExpenses: number;
  effectiveAnnualRent: number;
  taxableRentalIncome: number;
  annualTaxSavings: number;
  monthlyCashFlowAfterTax: number;
  annualCashFlowAfterTax: number;
}>();

// Section expanded states
const purchaseCostsExpanded = ref(false);
const taxBenefitsExpanded = ref(false);
const cashFlowExpanded = ref(false);
const keyMetricsExpanded = ref(false);
const resaleExpanded = ref(false);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return value.toFixed(2) + '%';
}

function getCashFlowColor(value: number): string {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
}

function getYieldColor(value: number): string {
  if (value >= 4) return 'text-green-600';
  if (value >= 3) return 'text-yellow-600';
  return 'text-red-600';
}

function getRentMultiplierColor(value: number): string {
  if (value <= 20) return 'text-green-600';
  if (value <= 25) return 'text-yellow-600';
  return 'text-red-600';
}

// Resale calculations
const resalePrice = computed(
  () => props.purchasePrice * Math.pow(1 + props.appreciationRate / 100, props.holdingPeriod)
);

const appreciation = computed(() => resalePrice.value - props.purchasePrice);

// Remaining loan balance after holding period (annuity formula)
const remainingBalance = computed(() => {
  if (props.loanAmount <= 0 || props.monthlyMortgage <= 0) return 0;

  const monthlyRate = props.interestRate / 100 / 12;
  const months = props.holdingPeriod * 12;

  if (monthlyRate === 0) {
    // No interest case: simple subtraction
    return Math.max(0, props.loanAmount - props.monthlyMortgage * months);
  }

  // Remaining balance = L × (1+r)^n - P × ((1+r)^n - 1) / r
  const factor = Math.pow(1 + monthlyRate, months);
  const balance = props.loanAmount * factor - (props.monthlyMortgage * (factor - 1)) / monthlyRate;
  return Math.max(0, balance);
});

const principalPaid = computed(() => props.loanAmount - remainingBalance.value);

// Total interest paid during holding period
const totalInterestPaid = computed(() => {
  const totalPayments = props.monthlyMortgage * props.holdingPeriod * 12;
  return totalPayments - principalPaid.value;
});

const totalOwnContribution = computed(() => {
  const cumulativeNegativeCashFlow =
    props.annualCashFlowAfterTax < 0 ? -props.annualCashFlowAfterTax * props.holdingPeriod : 0;
  return props.equity + cumulativeNegativeCashFlow;
});

const cumulativeCashFlow = computed(() => props.annualCashFlowAfterTax * props.holdingPeriod);

const saleProceeds = computed(() => {
  return resalePrice.value - remainingBalance.value;
});

const netProfitAfterSale = computed(() => {
  return saleProceeds.value + cumulativeCashFlow.value - props.equity;
});

const roiOnEquity = computed(() => {
  if (totalOwnContribution.value <= 0 || props.holdingPeriod <= 0) return 0;
  // CAGR formula: ((endValue / startValue) ^ (1/years)) - 1
  const totalReturn = 1 + netProfitAfterSale.value / totalOwnContribution.value;
  if (totalReturn <= 0) return -100; // Total loss
  return (Math.pow(totalReturn, 1 / props.holdingPeriod) - 1) * 100;
});

// Alternative investment (stocks/ETF) comparison
// Simulates: invest equity initially, then add monthly contributions only if RE cash flow is negative
// (positive RE cash flow is income you wouldn't have with stocks, so no withdrawal)
const alternativeInvestmentValue = computed(() => {
  const monthlyRate = props.stockReturnRate / 100 / 12;
  const months = props.holdingPeriod * 12;
  // Only contribute when RE cash flow is negative (money you'd save by not owning RE)
  const monthlyContribution = Math.max(0, -props.monthlyCashFlowAfterTax);

  if (monthlyRate === 0) {
    // No return case: simple sum
    return props.equity + monthlyContribution * months;
  }

  // Future Value = PV * (1+r)^n + PMT * ((1+r)^n - 1) / r
  // PV = initial equity
  // PMT = monthly contribution (only if RE has negative cash flow)
  const compoundFactor = Math.pow(1 + monthlyRate, months);
  const fvLumpSum = props.equity * compoundFactor;
  const fvAnnuity = monthlyContribution * ((compoundFactor - 1) / monthlyRate);

  return fvLumpSum + fvAnnuity;
});

// Total contributions to alternative investment = equity + monthly contributions (only if negative CF)
const alternativeTotalContribution = computed(() => {
  const monthlyContribution = Math.max(0, -props.monthlyCashFlowAfterTax);
  const months = props.holdingPeriod * 12;
  return props.equity + monthlyContribution * months;
});

const alternativeInvestmentProfit = computed(() => {
  return alternativeInvestmentValue.value - alternativeTotalContribution.value;
});

// German capital gains tax: 25% + 5.5% Soli = 26.375%
const capitalGainsTaxRate = 0.26375;
const alternativeCapitalGainsTax = computed(() => {
  if (alternativeInvestmentProfit.value <= 0) return 0;
  return alternativeInvestmentProfit.value * capitalGainsTaxRate;
});

const alternativeNetProfitAfterTax = computed(() => {
  return alternativeInvestmentProfit.value - alternativeCapitalGainsTax.value;
});

const alternativeRoiAfterTax = computed(() => {
  if (alternativeTotalContribution.value <= 0 || props.holdingPeriod <= 0) return 0;
  // CAGR formula: ((endValue / startValue) ^ (1/years)) - 1
  const totalReturn = 1 + alternativeNetProfitAfterTax.value / alternativeTotalContribution.value;
  if (totalReturn <= 0) return -100;
  return (Math.pow(totalReturn, 1 / props.holdingPeriod) - 1) * 100;
});

const realEstateAdvantage = computed(() => {
  return netProfitAfterSale.value - alternativeNetProfitAfterTax.value;
});
</script>

<template>
  <div class="space-y-6">
    <!-- Purchase Costs Breakdown -->
    <div class="overflow-hidden rounded-lg bg-white shadow-md">
      <button
        @click="purchaseCostsExpanded = !purchaseCostsExpanded"
        class="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50"
      >
        <h3 class="text-lg font-semibold text-gray-800">Purchase Costs (Kaufnebenkosten)</h3>
        <svg
          :class="[
            'h-5 w-5 text-gray-500 transition-transform',
            purchaseCostsExpanded ? 'rotate-180' : '',
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- Summary -->
      <div v-if="!purchaseCostsExpanded" class="-mt-2 px-4 pb-4">
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span class="text-gray-600"
            >Price:
            <span class="font-medium text-gray-900">{{ formatCurrency(purchasePrice) }}</span></span
          >
          <span class="text-gray-600">
            Costs:
            <span class="font-medium text-gray-900">
              {{ formatCurrency(totalPurchaseCosts) }}
            </span>
          </span>
          <span class="text-gray-600"
            >Total:
            <span class="font-medium text-blue-600">{{
              formatCurrency(totalInvestment)
            }}</span></span
          >
        </div>
      </div>

      <!-- Expanded Content -->
      <div v-if="purchaseCostsExpanded" class="space-y-2 px-6 pb-6">
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
    </div>

    <!-- Tax Benefits -->
    <div class="overflow-hidden rounded-lg bg-white shadow-md">
      <button
        @click="taxBenefitsExpanded = !taxBenefitsExpanded"
        class="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50"
      >
        <h3 class="text-lg font-semibold text-gray-800">Tax Benefits (Steuerliche Vorteile)</h3>
        <svg
          :class="[
            'h-5 w-5 text-gray-500 transition-transform',
            taxBenefitsExpanded ? 'rotate-180' : '',
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- Summary -->
      <div v-if="!taxBenefitsExpanded" class="-mt-2 px-4 pb-4">
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span class="text-gray-600"
            >Taxable Income:
            <span
              class="font-medium"
              :class="taxableRentalIncome < 0 ? 'text-green-600' : 'text-red-600'"
              >{{ formatCurrency(taxableRentalIncome) }}/yr</span
            ></span
          >
          <span class="text-gray-600"
            >{{ annualTaxSavings >= 0 ? 'Tax Savings' : 'Tax Due' }}:
            <span
              class="font-medium"
              :class="annualTaxSavings >= 0 ? 'text-green-600' : 'text-red-600'"
              >{{ formatCurrency(Math.abs(annualTaxSavings)) }}/yr</span
            ></span
          >
        </div>
      </div>

      <!-- Expanded Content -->
      <div v-if="taxBenefitsExpanded" class="space-y-2 px-6 pb-6">
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
    </div>

    <!-- Cash Flow -->
    <div class="overflow-hidden rounded-lg bg-white shadow-md">
      <button
        @click="cashFlowExpanded = !cashFlowExpanded"
        class="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50"
      >
        <h3 class="text-lg font-semibold text-gray-800">Cash Flow (Monatlicher Cashflow)</h3>
        <svg
          :class="[
            'h-5 w-5 text-gray-500 transition-transform',
            cashFlowExpanded ? 'rotate-180' : '',
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- Summary -->
      <div v-if="!cashFlowExpanded" class="-mt-2 px-4 pb-4">
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span class="text-gray-600"
            >Before Tax:
            <span class="font-medium" :class="getCashFlowColor(monthlyCashFlow)">{{
              formatCurrency(monthlyCashFlow)
            }}</span
            >/mo</span
          >
          <span class="text-gray-600"
            >After Tax:
            <span class="font-medium" :class="getCashFlowColor(monthlyCashFlowAfterTax)">{{
              formatCurrency(monthlyCashFlowAfterTax)
            }}</span
            >/mo</span
          >
        </div>
      </div>

      <!-- Expanded Content -->
      <div v-if="cashFlowExpanded" class="space-y-2 px-6 pb-6">
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
    </div>

    <!-- Key Metrics -->
    <div class="overflow-hidden rounded-lg bg-white shadow-md">
      <button
        @click="keyMetricsExpanded = !keyMetricsExpanded"
        class="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50"
      >
        <h3 class="text-lg font-semibold text-gray-800">Key Metrics (Kennzahlen)</h3>
        <svg
          :class="[
            'h-5 w-5 text-gray-500 transition-transform',
            keyMetricsExpanded ? 'rotate-180' : '',
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- Summary -->
      <div v-if="!keyMetricsExpanded" class="-mt-2 px-4 pb-4">
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span class="text-gray-600"
            >Gross:
            <span class="font-medium" :class="getYieldColor(grossYield)">{{
              formatPercent(grossYield)
            }}</span></span
          >
          <span class="text-gray-600"
            >Net:
            <span class="font-medium" :class="getYieldColor(netYield)">{{
              formatPercent(netYield)
            }}</span></span
          >
          <span class="text-gray-600"
            >CoC:
            <span class="font-medium" :class="getCashFlowColor(cashOnCashReturn)">{{
              formatPercent(cashOnCashReturn)
            }}</span></span
          >
          <span class="text-gray-600"
            >Factor:
            <span class="font-medium" :class="getRentMultiplierColor(rentMultiplier)"
              >{{ rentMultiplier.toFixed(1) }}x</span
            ></span
          >
        </div>
      </div>

      <!-- Expanded Content -->
      <div v-if="keyMetricsExpanded" class="px-6 pb-6">
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
        <div class="space-y-1 px-2 pt-4 text-xs text-gray-500">
          <p>Gross Yield: &gt;4% good | Rent Multiplier: &lt;20 good, &lt;25 acceptable</p>
        </div>
      </div>
    </div>

    <!-- Resale Price -->
    <div class="overflow-hidden rounded-lg bg-white shadow-md">
      <button
        @click="resaleExpanded = !resaleExpanded"
        class="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50"
      >
        <h3 class="text-lg font-semibold text-gray-800">
          Net profit and ROI in {{ holdingPeriod }} yrs
        </h3>
        <svg
          :class="[
            'h-5 w-5 text-gray-500 transition-transform',
            resaleExpanded ? 'rotate-180' : '',
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <!-- Summary -->
      <div v-if="!resaleExpanded" class="-mt-2 px-4 pb-4">
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span class="text-gray-600"
            >Net Profit:
            <span
              class="font-medium"
              :class="netProfitAfterSale >= 0 ? 'text-emerald-600' : 'text-red-600'"
              >{{ formatCurrency(netProfitAfterSale) }}</span
            ></span
          >
          <span class="text-gray-600"
            >ROI p.a.:
            <span
              class="font-medium"
              :class="roiOnEquity >= 0 ? 'text-emerald-600' : 'text-red-600'"
              >{{ formatPercent(roiOnEquity) }}</span
            ></span
          >
        </div>
      </div>

      <!-- Expanded Content -->
      <div v-if="resaleExpanded" class="space-y-2 px-6 pb-6">
        <div class="space-y-2 rounded-md bg-emerald-50 p-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Resale price in {{ holdingPeriod }} years</span>
            <span class="font-medium text-emerald-700">{{ formatCurrency(resalePrice) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Remaining loan balance at the date of selling</span>
            <span class="font-medium text-red-600">{{ formatCurrency(remainingBalance) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Sale proceeds</span>
            <span class="font-medium text-emerald-600">{{ formatCurrency(saleProceeds) }}</span>
          </div>
          <hr class="my-2 border-emerald-200" />
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Appreciation ({{ appreciationRate }}% p.a.)</span>
            <span class="text-emerald-600">+{{ formatCurrency(appreciation) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Principal Paid ({{ holdingPeriod }} yrs)</span>
            <span class="text-gray-700">{{ formatCurrency(principalPaid) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Interest Paid ({{ holdingPeriod }} yrs)</span>
            <span class="text-red-600">{{ formatCurrency(totalInterestPaid) }}</span>
          </div>
          <hr class="my-2 border-emerald-200" />
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
          <p class="text-xs text-gray-500">Sale proceeds + Cumulative Cash Flow − Equity</p>
          <div class="flex justify-between text-lg font-bold">
            <span>ROI on Equity p.a. (Eigenkapitalrendite)</span>
            <span :class="roiOnEquity >= 0 ? 'text-emerald-700' : 'text-red-600'">{{
              formatPercent(roiOnEquity)
            }}</span>
          </div>
          <p class="text-xs text-gray-500">CAGR: Compound annual growth rate on your investment</p>
        </div>

        <!-- Alternative Investment Comparison -->
        <div class="mt-4 space-y-2 rounded-md bg-blue-50 p-4">
          <p class="text-sm font-medium text-blue-800">
            Alternative: Stocks/ETF ({{ stockReturnRate }}% p.a.)
          </p>
          <p class="text-xs text-gray-500">
            Equity + monthly contributions invested in stocks (if RE cash flow after tax is
            negative)
          </p>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Total contributions</span>
            <span class="text-gray-700">{{ formatCurrency(alternativeTotalContribution) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Portfolio value after {{ holdingPeriod }} yrs</span>
            <span class="font-medium text-blue-700">{{
              formatCurrency(alternativeInvestmentValue)
            }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Gross profit from stocks/ETF</span>
            <span class="text-blue-600">{{ formatCurrency(alternativeInvestmentProfit) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">- Capital gains tax (26.375%)</span>
            <span class="text-red-600">-{{ formatCurrency(alternativeCapitalGainsTax) }}</span>
          </div>
          <div class="flex justify-between text-sm font-medium">
            <span class="text-gray-700">Net profit after tax</span>
            <span class="text-blue-700">{{ formatCurrency(alternativeNetProfitAfterTax) }}</span>
          </div>
          <div class="flex justify-between text-sm font-medium">
            <span class="text-gray-700">ROI p.a. after tax (CAGR)</span>
            <span class="text-blue-700">{{ formatPercent(alternativeRoiAfterTax) }}</span>
          </div>
          <hr class="border-blue-200" />
          <div class="flex justify-between text-lg font-bold">
            <span>Real Estate vs. Stocks/ETF</span>
            <span :class="realEstateAdvantage >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ realEstateAdvantage >= 0 ? '+' : '' }}{{ formatCurrency(realEstateAdvantage) }}
            </span>
          </div>
          <p class="text-xs text-gray-500">
            {{ realEstateAdvantage >= 0 ? 'Real estate outperforms' : 'Stocks/ETF outperforms' }} by
            {{ formatCurrency(Math.abs(realEstateAdvantage)) }} (RE is tax-free after 10 yrs)
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
