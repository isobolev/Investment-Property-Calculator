<script setup lang="ts">
import { ref, computed } from 'vue'

const equity = defineModel<number>('equity', { required: true })
const interestRate = defineModel<number>('interestRate', { required: true })
const repaymentRate = defineModel<number>('repaymentRate', { required: true })

const props = defineProps<{
  totalInvestment: number
  loanAmount: number
  loanToValue: number
  monthlyMortgage: number
}>()

const isExpanded = ref(false)

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const equityPercent = computed(() =>
  props.totalInvestment > 0
    ? (equity.value / props.totalInvestment * 100).toFixed(1)
    : '0'
)
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Header -->
    <button
      @click="isExpanded = !isExpanded"
      class="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <h2 class="text-lg font-semibold text-gray-800">Financing (Finanzierung)</h2>
      <svg
        :class="['w-5 h-5 text-gray-500 transition-transform', isExpanded ? 'rotate-180' : '']"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Summary (visible when collapsed) -->
    <div v-if="!isExpanded" class="px-4 pb-4 -mt-2">
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span class="text-gray-600">Equity: <span class="font-medium text-gray-900">{{ formatCurrency(equity) }}</span></span>
        <span class="text-gray-600">Loan: <span class="font-medium text-gray-900">{{ formatCurrency(loanAmount) }}</span></span>
        <span class="text-gray-600">Rate: <span class="font-medium text-amber-600">{{ formatCurrency(monthlyMortgage) }}/mo</span></span>
      </div>
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="px-6 pb-6 space-y-4">
      <!-- Total Investment Info -->
      <div class="bg-gray-50 rounded-md p-3">
        <p class="text-sm text-gray-600">Total Investment (Gesamtinvestition) - Purchase Price + Costs</p>
        <p class="text-lg font-semibold text-gray-800">{{ formatCurrency(totalInvestment) }}</p>
      </div>

      <!-- Equity -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Equity (Eigenkapital)
        </label>
        <div class="relative">
          <input
            v-model.number="equity"
            type="number"
            min="0"
            step="5000"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="60000"
          />
          <span class="absolute right-3 top-2 text-gray-500"></span>
        </div>
        <p class="mt-1 text-sm text-gray-500">{{ equityPercent }}% of total investment</p>
      </div>

      <!-- Loan Amount (Calculated) -->
      <div class="bg-blue-50 rounded-md p-3">
        <p class="text-sm text-blue-600">Loan Amount (Darlehensbetrag)</p>
        <p class="text-lg font-semibold text-blue-800">{{ formatCurrency(loanAmount) }}</p>
        <p class="text-xs text-blue-600">Loan-to-Value (Beleihungsauslauf): {{ loanToValue.toFixed(1) }}%</p>
      </div>

      <!-- Interest Rate -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Interest Rate (Sollzins)
        </label>
        <div class="flex items-center gap-4">
          <input
            v-model.number="interestRate"
            type="range"
            min="0.5"
            max="8"
            step="0.1"
            class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex items-center gap-1 w-24">
            <input
              v-model.number="interestRate"
              type="number"
              min="0.5"
              max="10"
              step="0.1"
              class="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span class="text-gray-600">%</span>
          </div>
        </div>
      </div>

      <!-- Repayment Rate (Tilgung) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Initial Repayment (Anfängliche Tilgung)
        </label>
        <div class="flex items-center gap-4">
          <input
            v-model.number="repaymentRate"
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex items-center gap-1 w-24">
            <input
              v-model.number="repaymentRate"
              type="number"
              min="0.5"
              max="10"
              step="0.1"
              class="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span class="text-gray-600">%</span>
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          Annuity (Annuität): {{ (interestRate + repaymentRate).toFixed(2) }}%
        </p>
      </div>

      <!-- Monthly Payment -->
      <div class="bg-amber-50 rounded-md p-3 border border-amber-200">
        <p class="text-sm text-amber-700">Monthly Payment (Monatliche Rate)</p>
        <p class="text-2xl font-bold text-amber-800">{{ formatCurrency(monthlyMortgage) }}</p>
        <p class="text-xs text-amber-600">per month</p>
      </div>
    </div>
  </div>
</template>
