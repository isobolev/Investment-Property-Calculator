<script setup lang="ts">
import { ref, computed } from 'vue';
import PaymentScheduleModal from './PaymentScheduleModal.vue';

const equity = defineModel<number>('equity', { required: true });
const interestRate = defineModel<number>('interestRate', { required: true });
const repaymentRate = defineModel<number>('repaymentRate', { required: true });

const props = defineProps<{
  totalInvestment: number;
  loanAmount: number;
  loanToValue: number;
  monthlyMortgage: number;
}>();

const isExpanded = ref(false);
const showPaymentSchedule = ref(false);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const equityPercent = computed(() =>
  props.totalInvestment > 0 ? ((equity.value / props.totalInvestment) * 100).toFixed(1) : '0'
);

const monthlyInterest = computed(() => (props.loanAmount * (interestRate.value / 100)) / 12);

const monthlyRepayment = computed(() => (props.loanAmount * (repaymentRate.value / 100)) / 12);

// Calculate total loan term (time to fully pay off the loan)
const loanTermMonths = computed(() => {
  if (props.loanAmount <= 0 || props.monthlyMortgage <= 0) return 0;

  const monthlyRate = interestRate.value / 100 / 12;

  if (monthlyRate === 0) {
    // No interest: simple division
    return Math.ceil(props.loanAmount / props.monthlyMortgage);
  }

  // Formula: n = -log(1 - (P * r / PMT)) / log(1 + r)
  const ratio = (props.loanAmount * monthlyRate) / props.monthlyMortgage;

  // If payment doesn't cover interest, loan will never be paid off
  if (ratio >= 1) return Infinity;

  return Math.ceil(-Math.log(1 - ratio) / Math.log(1 + monthlyRate));
});

const loanTermYears = computed(() => Math.floor(loanTermMonths.value / 12));
const loanTermRemainingMonths = computed(() => loanTermMonths.value % 12);
</script>

<template>
  <div class="overflow-hidden rounded-lg bg-white shadow-md">
    <!-- Header -->
    <button
      @click="isExpanded = !isExpanded"
      class="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50"
    >
      <h2 class="text-lg font-semibold text-gray-800">Financing (Finanzierung)</h2>
      <svg
        :class="['h-5 w-5 text-gray-500 transition-transform', isExpanded ? 'rotate-180' : '']"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Summary (visible when collapsed) -->
    <div v-if="!isExpanded" class="-mt-2 px-4 pb-4">
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span class="text-gray-600"
          >Equity: <span class="font-medium text-gray-900">{{ formatCurrency(equity) }}</span></span
        >
        <span class="text-gray-600"
          >Loan:
          <span class="font-medium text-gray-900">{{ formatCurrency(loanAmount) }}</span></span
        >
        <span class="text-gray-600"
          >Rate:
          <span class="font-medium text-amber-600"
            >{{ formatCurrency(monthlyMortgage) }}/mo</span
          ></span
        >
        <span class="text-gray-600"
          >Term: <span class="font-medium text-gray-900">{{ loanTermYears }} yrs</span></span
        >
      </div>
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="space-y-4 px-6 pb-6">
      <!-- Total Investment Info -->
      <div class="rounded-md bg-gray-50 p-3">
        <p class="text-sm text-gray-600">
          Total Investment (Gesamtinvestition) - Purchase Price + Costs
        </p>
        <p class="text-lg font-semibold text-gray-800">{{ formatCurrency(totalInvestment) }}</p>
      </div>

      <!-- Equity -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700"> Equity (Eigenkapital) </label>
        <div class="relative">
          <input
            v-model.number="equity"
            type="number"
            min="0"
            step="5000"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="60000"
          />
          <span class="absolute right-3 top-2 text-gray-500"></span>
        </div>
        <p class="mt-1 text-sm text-gray-500">{{ equityPercent }}% of total investment</p>
      </div>

      <!-- Loan Amount (Calculated) -->
      <div class="rounded-md bg-blue-50 p-3">
        <p class="text-sm text-blue-600">Loan Amount (Darlehensbetrag)</p>
        <p class="text-lg font-semibold text-blue-800">{{ formatCurrency(loanAmount) }}</p>
        <p class="text-xs text-blue-600">
          Loan-to-Value (Beleihungsauslauf): {{ loanToValue.toFixed(1) }}%
        </p>
      </div>

      <!-- Interest Rate -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          Interest Rate (Sollzins)
        </label>
        <div class="flex items-center gap-4">
          <input
            v-model.number="interestRate"
            type="range"
            min="0.5"
            max="8"
            step="0.1"
            class="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200"
          />
          <div class="flex w-24 items-center gap-1">
            <input
              v-model.number="interestRate"
              type="number"
              min="0.5"
              max="10"
              step="0.1"
              class="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-gray-600">%</span>
          </div>
        </div>
      </div>

      <!-- Repayment Rate (Tilgung) -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          Initial Repayment (Anfängliche Tilgung)
        </label>
        <div class="flex items-center gap-4">
          <input
            v-model.number="repaymentRate"
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            class="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200"
          />
          <div class="flex w-24 items-center gap-1">
            <input
              v-model.number="repaymentRate"
              type="number"
              min="0.5"
              max="10"
              step="0.1"
              class="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-gray-600">%</span>
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          Annuity (Annuität): {{ (interestRate + repaymentRate).toFixed(2) }}%
        </p>
      </div>

      <!-- Monthly Payment -->
      <div class="rounded-md border border-amber-200 bg-amber-50 p-3">
        <p class="text-sm text-amber-700">Monthly Payment (Monatliche Rate)</p>
        <p class="text-2xl font-bold text-amber-800">{{ formatCurrency(monthlyMortgage) }}</p>
        <div class="mt-2 flex gap-4 text-xs">
          <span class="text-amber-700"
            >Interest (Zinsen):
            <span class="font-medium">{{ formatCurrency(monthlyInterest) }}</span></span
          >
          <span class="text-amber-700"
            >Repayment (Tilgung):
            <span class="font-medium">{{ formatCurrency(monthlyRepayment) }}</span></span
          >
        </div>
      </div>

      <!-- Loan Term -->
      <div class="rounded-md bg-gray-50 p-3">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-600">Total Loan Term (Gesamtlaufzeit)</p>
          <button
            v-if="loanTermMonths !== Infinity && loanTermMonths > 0"
            @click="showPaymentSchedule = true"
            class="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200"
          >
            View Schedule
          </button>
        </div>
        <p v-if="loanTermMonths === Infinity" class="text-lg font-semibold text-red-600">
          Never (payment doesn't cover interest)
        </p>
        <p v-else class="text-lg font-semibold text-gray-800">
          {{ loanTermYears }} years {{ loanTermRemainingMonths }} months
          <span class="text-sm font-normal text-gray-500">({{ loanTermMonths }} months total)</span>
        </p>
      </div>
    </div>

    <!-- Payment Schedule Modal -->
    <Teleport to="body">
      <PaymentScheduleModal
        v-if="showPaymentSchedule"
        :loanAmount="loanAmount"
        :monthlyMortgage="monthlyMortgage"
        :interestRate="interestRate"
        @close="showPaymentSchedule = false"
      />
    </Teleport>
  </div>
</template>
