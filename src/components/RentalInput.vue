<script setup lang="ts">
const monthlyRent = defineModel<number>('monthlyRent', { required: true })
const monthlyHausgeld = defineModel<number>('monthlyHausgeld', { required: true })
const maintenanceReserve = defineModel<number>('maintenanceReserve', { required: true })
const vacancyRate = defineModel<number>('vacancyRate', { required: true })

const props = defineProps<{
  effectiveMonthlyRent: number
  annualRent: number
}>()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Rental Income & Expenses (Mieteinnahmen & Kosten)</h2>

    <div class="space-y-4">
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
          {{ formatCurrency(monthlyHausgeld + maintenanceReserve) }}
        </p>
        <p class="text-xs text-red-600">per month</p>
      </div>
    </div>
  </div>
</template>
