<script setup lang="ts">
import { computed } from 'vue'
import { marginalRatePresets, calculateMarginalRate } from '../data/germanTaxBrackets'

const props = defineProps<{
  depreciationRate: number
  landValuePercent: number
  taxInputMode: 'rate' | 'income'
  marginalTaxRate: number
  taxableIncome: number
  includeSoli: boolean
  jointTaxDeclaration: boolean
  // Calculated values for display
  buildingValue: number
  landValue: number
  annualDepreciation: number
  effectiveMarginalRate: number
}>()

const emit = defineEmits<{
  'update:depreciationRate': [value: number]
  'update:landValuePercent': [value: number]
  'update:taxInputMode': [value: 'rate' | 'income']
  'update:marginalTaxRate': [value: number]
  'update:taxableIncome': [value: number]
  'update:includeSoli': [value: boolean]
  'update:jointTaxDeclaration': [value: boolean]
}>()

const calculatedMarginalRate = computed(() => {
  const incomeForCalculation = props.jointTaxDeclaration
    ? props.taxableIncome / 2
    : props.taxableIncome
  return calculateMarginalRate(incomeForCalculation)
})

const depreciationPresets = [
  { rate: 2, label: '2% (Standard)' },
  { rate: 2.5, label: '2.5% (Pre-1925)' },
  { rate: 3, label: '3% (New 2023+)' },
]

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
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Tax Deductions (Steuerliche Abschreibung)</h2>

    <div class="space-y-4">
      <!-- Depreciation Rate -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Depreciation Rate (AfA-Satz): {{ depreciationRate }}%
        </label>
        <input
          type="range"
          :value="depreciationRate"
          @input="emit('update:depreciationRate', Number(($event.target as HTMLInputElement).value))"
          min="0.5"
          max="3"
          step="0.1"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.5%</span>
          <span>3%</span>
        </div>
        <div class="flex flex-wrap gap-2 mt-2">
          <button
            v-for="preset in depreciationPresets"
            :key="preset.rate"
            type="button"
            :class="[
              'px-3 py-1 text-xs rounded-full border',
              depreciationRate === preset.rate
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
            @click="emit('update:depreciationRate', preset.rate)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <!-- Land Value Percentage -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Land Value (Grundstückswert): {{ landValuePercent }}%
        </label>
        <input
          type="range"
          :value="landValuePercent"
          @input="emit('update:landValuePercent', Number(($event.target as HTMLInputElement).value))"
          min="10"
          max="50"
          step="1"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>10%</span>
          <span>50%</span>
        </div>
        <div class="mt-2 p-2 bg-gray-50 rounded text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Building Value (Gebäudewert)</span>
            <span class="font-medium">{{ formatCurrency(buildingValue) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Land Value (Grundstückswert)</span>
            <span class="font-medium">{{ formatCurrency(landValue) }}</span>
          </div>
          <div class="flex justify-between text-green-600 font-medium mt-1">
            <span>Annual Depreciation (Jährliche AfA)</span>
            <span>{{ formatCurrency(annualDepreciation) }}</span>
          </div>
        </div>
      </div>

      <!-- Tax Input Mode Toggle -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Tax Rate Input Method
        </label>
        <div class="flex rounded-md shadow-sm">
          <button
            type="button"
            :class="[
              'flex-1 px-4 py-2 text-sm font-medium border',
              taxInputMode === 'rate'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
            @click="emit('update:taxInputMode', 'rate')"
          >
            Direct Rate
          </button>
          <button
            type="button"
            :class="[
              'flex-1 px-4 py-2 text-sm font-medium border-t border-b border-r',
              taxInputMode === 'income'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
            @click="emit('update:taxInputMode', 'income')"
          >
            From Income
          </button>
        </div>
      </div>

      <!-- Direct Rate Input -->
      <div v-if="taxInputMode === 'rate'">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Marginal Tax Rate (Grenzsteuersatz): {{ marginalTaxRate }}%
        </label>
        <input
          type="range"
          :value="marginalTaxRate"
          @input="emit('update:marginalTaxRate', Number(($event.target as HTMLInputElement).value))"
          min="0"
          max="45"
          step="1"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div class="flex flex-wrap gap-2 mt-2">
          <button
            v-for="preset in marginalRatePresets"
            :key="preset.rate"
            type="button"
            :class="[
              'px-3 py-1 text-xs rounded-full border',
              marginalTaxRate === preset.rate
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
            @click="emit('update:marginalTaxRate', preset.rate)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <!-- Income-based Rate Input -->
      <div v-else>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Taxable Income (Zu versteuerndes Einkommen)
        </label>
        <input
          type="number"
          :value="taxableIncome"
          @input="emit('update:taxableIncome', Number(($event.target as HTMLInputElement).value))"
          min="0"
          step="1000"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p class="mt-1 text-sm text-gray-600">
          Calculated marginal rate: <span class="font-medium text-blue-600">{{ formatPercent(calculatedMarginalRate) }}</span>
          <span v-if="jointTaxDeclaration" class="text-gray-500"> (based on {{ formatCurrency(taxableIncome / 2) }} each)</span>
        </p>

        <!-- Joint Tax Declaration Checkbox -->
        <div class="flex items-center mt-3">
          <input
            type="checkbox"
            id="jointTaxDeclaration"
            :checked="jointTaxDeclaration"
            @change="emit('update:jointTaxDeclaration', ($event.target as HTMLInputElement).checked)"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="jointTaxDeclaration" class="ml-2 block text-sm text-gray-700" title="For married couples filing jointly - income is split for tax calculation">
            Joint tax declaration (Zusammenveranlagung)
          </label>
        </div>
      </div>

      <!-- Include Soli Checkbox -->
      <div class="flex items-center">
        <input
          type="checkbox"
          id="includeSoli"
          :checked="includeSoli"
          @change="emit('update:includeSoli', ($event.target as HTMLInputElement).checked)"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="includeSoli" class="ml-2 block text-sm text-gray-700">
          Include Solidaritätszuschlag (+5.5%)
        </label>
      </div>

      <!-- Effective Rate Display -->
      <div class="p-3 bg-blue-50 rounded-md">
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-blue-700">Effective Marginal Rate</span>
          <span class="text-lg font-bold text-blue-600">{{ formatPercent(effectiveMarginalRate) }}</span>
        </div>
        <p class="text-xs text-blue-600 mt-1">
          {{ includeSoli ? 'Including Solidaritätszuschlag' : 'Without Solidaritätszuschlag' }}
        </p>
      </div>
    </div>
  </div>
</template>
