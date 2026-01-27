<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRef } from 'vue';
import { usePaymentSchedule } from '../composables/usePaymentSchedule';

const props = defineProps<{
  loanAmount: number;
  monthlyMortgage: number;
  interestRate: number;
  monthlySondertilgung?: number;
}>();

const emit = defineEmits<{
  close: [];
}>();

// Convert props to refs for the composable
const loanAmountRef = toRef(props, 'loanAmount');
const monthlyMortgageRef = toRef(props, 'monthlyMortgage');
const interestRateRef = toRef(props, 'interestRate');
const monthlySondertilgungRef = computed(() => props.monthlySondertilgung ?? 0);

const { schedule, summary } = usePaymentSchedule(
  loanAmountRef,
  monthlyMortgageRef,
  interestRateRef,
  monthlySondertilgungRef as any
);

const hasSondertilgung = computed(() => summary.value.totalSondertilgungPaid > 0);

// Check if this month starts a new 5-year period
function isYearDivider(month: number): boolean {
  return month > 1 && (month - 1) % 60 === 0;
}

function getYearLabel(month: number): string {
  const years = Math.floor((month - 1) / 12);
  return `Year ${years}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    month: 'short',
    year: '2-digit',
  }).format(date);
}

function formatYearsMonths(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} months`;
  if (months === 0) return `${years} years`;
  return `${years} yrs ${months} mo`;
}

// Handle escape key
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close');
  }
}

// Handle backdrop click
const modalPanel = ref<HTMLElement | null>(null);
function handleBackdropClick(event: MouseEvent) {
  if (modalPanel.value && !modalPanel.value.contains(event.target as Node)) {
    emit('close');
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 sm:p-8"
    @click="handleBackdropClick"
  >
    <div
      ref="modalPanel"
      class="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-gray-200 px-8 py-5">
        <h2 class="text-xl font-semibold text-gray-800">Payment Schedule (Tilgungsplan)</h2>
        <button
          @click="emit('close')"
          class="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Summary -->
      <div class="border-b border-gray-200 bg-gray-50 px-8 py-5">
        <div class="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <span class="text-gray-500">Loan:</span>
            <span class="ml-1 font-semibold text-gray-800">{{ formatCurrency(loanAmount) }}</span>
          </div>
          <div>
            <span class="text-gray-500">Term:</span>
            <span class="ml-1 font-semibold text-gray-800">{{
              formatYearsMonths(summary.totalMonths)
            }}</span>
            <span v-if="summary.cappedAtMaxMonths" class="ml-1 text-amber-600">(capped)</span>
          </div>
          <div>
            <span class="text-gray-500">Total Interest:</span>
            <span class="ml-1 font-semibold text-red-600">{{
              formatCurrency(summary.totalInterestPaid)
            }}</span>
          </div>
          <div v-if="hasSondertilgung">
            <span class="text-gray-500">Total Sondertilgung:</span>
            <span class="ml-1 font-semibold text-blue-600">{{
              formatCurrency(summary.totalSondertilgungPaid)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-y-auto">
        <table class="w-full">
          <thead class="sticky top-0 bg-gray-100">
            <tr class="text-left text-sm font-medium text-gray-600">
              <th class="px-6 py-3">Month</th>
              <th class="px-6 py-3 text-right">Interest</th>
              <th class="px-6 py-3 text-right">Principal</th>
              <th v-if="hasSondertilgung" class="px-6 py-3 text-right">Sondertilgung</th>
              <th class="px-6 py-3 text-right">Total</th>
              <th class="px-6 py-3 text-right">Remaining</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="entry in schedule" :key="entry.month">
              <!-- Year divider row (every 5 years) -->
              <tr v-if="isYearDivider(entry.month)" class="bg-blue-50">
                <td
                  :colspan="hasSondertilgung ? 6 : 5"
                  class="px-6 py-2 text-xs font-semibold text-blue-700"
                >
                  {{ getYearLabel(entry.month) }}
                </td>
              </tr>
              <!-- Regular data row -->
              <tr
                class="border-b border-gray-100 text-sm hover:bg-gray-50"
                :class="{ 'bg-green-50': entry.remainingBalance < 0.01 }"
              >
                <td class="whitespace-nowrap px-6 py-2.5 text-gray-700">
                  {{ formatDate(entry.date) }}
                </td>
                <td class="px-6 py-2.5 text-right font-mono text-red-600">
                  {{ formatCurrency(entry.interestPayment) }}
                </td>
                <td class="px-6 py-2.5 text-right font-mono text-green-600">
                  {{ formatCurrency(entry.principalPayment) }}
                </td>
                <td v-if="hasSondertilgung" class="px-6 py-2.5 text-right font-mono text-blue-600">
                  {{ formatCurrency(entry.sondertilgung) }}
                </td>
                <td class="px-6 py-2.5 text-right font-mono text-gray-800">
                  {{ formatCurrency(entry.totalPayment) }}
                </td>
                <td class="px-6 py-2.5 text-right font-mono text-gray-600">
                  {{ formatCurrency(entry.remainingBalance) }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- Empty state -->
        <div v-if="schedule.length === 0" class="px-8 py-16 text-center text-gray-500">
          <p>No payment schedule available.</p>
          <p class="mt-2 text-sm">Check that loan amount and monthly payment are valid.</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-gray-200 px-8 py-4">
        <p class="text-xs text-gray-500">
          <span class="text-red-600">Interest</span> = Cost |
          <span class="text-green-600">Principal</span> = Equity Building
          <span v-if="hasSondertilgung">
            | <span class="text-blue-600">Sondertilgung</span> = Extra Payment
          </span>
        </p>
      </div>
    </div>
  </div>
</template>
