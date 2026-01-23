<script setup lang="ts">
import { ref, computed } from 'vue'

const monthlyRent = defineModel<number>('monthlyRent', { required: true })
const monthlyHausgeld = defineModel<number>('monthlyHausgeld', { required: true })
const maintenanceReserve = defineModel<number>('maintenanceReserve', { required: true })
const vacancyRate = defineModel<number>('vacancyRate', { required: true })

const props = defineProps<{
  effectiveMonthlyRent: number
  annualRent: number
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

const totalMonthlyExpenses = computed(() => monthlyHausgeld.value + maintenanceReserve.value)
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Header -->
    <button
      @click="isExpanded = !isExpanded"
      class="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <h2 class="text-lg font-semibold text-gray-800">Rental Income & Expenses</h2>
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
        <span class="text-gray-600">Rent: <span class="font-medium text-green-600">{{ formatCurrency(monthlyRent) }}/mo</span></span>
        <span class="text-gray-600">Costs: <span class="font-medium text-red-600">{{ formatCurrency(totalMonthlyExpenses) }}/mo</span></span>
        <span v-if="vacancyRate > 0" class="text-gray-600">Vacancy: <span class="font-medium text-gray-900">{{ vacancyRate }}%</span></span>
      </div>
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="px-6 pb-6 space-y-4">
      <!-- Monthly Rent -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Monthly Cold Rent (Monatliche Kaltmiete)
        </label>
        <div class="relative">
          <input
            v-model.number="monthlyRent"
            type="number"
            min="0"
            step="50"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1000"
          />
          <span class="absolute right-3 top-2 text-gray-500"></span>
        </div>
        <p class="mt-1 text-sm text-gray-500">Annual Cold Rent (Jahreskaltmiete): {{ formatCurrency(annualRent) }}</p>
      </div>

      <!-- Vacancy Rate -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Vacancy Rate (Leerstandsquote)
        </label>
        <div class="flex items-center gap-4">
          <input
            v-model.number="vacancyRate"
            type="range"
            min="0"
            max="20"
            step="0.5"
            class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex items-center gap-1 w-20">
            <input
              v-model.number="vacancyRate"
              type="number"
              min="0"
              max="50"
              step="0.5"
              class="w-14 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span class="text-gray-600">%</span>
          </div>
        </div>
        <p class="mt-1 text-sm text-gray-500">
          Effective Rent (Effektive Miete): {{ formatCurrency(effectiveMonthlyRent) }}/month
        </p>
      </div>

      <hr class="border-gray-200" />

      <h3 class="text-lg font-medium text-gray-700">Non-recoverable Costs (Nicht-umlagefähige Kosten)</h3>

      <!-- Hausgeld -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Property Management Fee (Hausgeld) - non-recoverable
        </label>
        <div class="relative">
          <input
            v-model.number="monthlyHausgeld"
            type="number"
            min="0"
            step="10"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="150"
          />
          <span class="absolute right-3 top-2 text-gray-500">/Monat</span>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          e.g. administration, HOA maintenance reserve
        </p>
      </div>

      <!-- Maintenance Reserve -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Additional Maintenance Reserve (Instandhaltungsrücklage)
        </label>
        <div class="relative">
          <input
            v-model.number="maintenanceReserve"
            type="number"
            min="0"
            step="10"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="50"
          />
          <span class="absolute right-3 top-2 text-gray-500">/Monat</span>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          Recommendation: ~1€/m² for old buildings, 0.50€/m² for new
        </p>
      </div>

      <!-- Total Expenses Summary -->
      <div class="bg-red-50 rounded-md p-3 border border-red-200">
        <p class="text-sm text-red-700">Monthly Costs (excluding financing)</p>
        <p class="text-lg font-semibold text-red-800">
          {{ formatCurrency(totalMonthlyExpenses) }}
        </p>
        <p class="text-xs text-red-600">per month</p>
      </div>
    </div>
  </div>
</template>
