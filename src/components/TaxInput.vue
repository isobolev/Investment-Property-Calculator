<script setup lang="ts">
import { ref, computed } from 'vue';
import { marginalRatePresets, calculateMarginalRate } from '../data/germanTaxBrackets';

const props = defineProps<{
  depreciationRate: number;
  landValuePercent: number;
  taxInputMode: 'rate' | 'income';
  marginalTaxRate: number;
  taxableIncome: number;
  includeSoli: boolean;
  jointTaxDeclaration: boolean;
  // Calculated values for display
  buildingValue: number;
  landValue: number;
  annualDepreciation: number;
  effectiveMarginalRate: number;
}>();

const emit = defineEmits<{
  'update:depreciationRate': [value: number];
  'update:landValuePercent': [value: number];
  'update:taxInputMode': [value: 'rate' | 'income'];
  'update:marginalTaxRate': [value: number];
  'update:taxableIncome': [value: number];
  'update:includeSoli': [value: boolean];
  'update:jointTaxDeclaration': [value: boolean];
}>();

const isExpanded = ref(false);

const calculatedMarginalRate = computed(() => {
  const incomeForCalculation = props.jointTaxDeclaration
    ? props.taxableIncome / 2
    : props.taxableIncome;
  return calculateMarginalRate(incomeForCalculation);
});

const depreciationPresets = [
  { rate: 2, label: '2% (Standard)' },
  { rate: 2.5, label: '2.5% (Pre-1925)' },
  { rate: 3, label: '3% (New 2023+)' },
  { rate: 5, label: '5%' },
  { rate: 10, label: '10%' },
];

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
</script>

<template>
  <div class="overflow-hidden rounded-lg bg-white shadow-md">
    <!-- Header -->
    <button
      @click="isExpanded = !isExpanded"
      class="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50"
    >
      <h2 class="text-lg font-semibold text-gray-800">Tax Deductions (Steuerliche Abschreibung)</h2>
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
          >AfA: <span class="font-medium text-gray-900">{{ depreciationRate }}%</span></span
        >
        <span class="text-gray-600"
          >Tax Rate:
          <span class="font-medium text-blue-600">{{
            formatPercent(effectiveMarginalRate)
          }}</span></span
        >
        <span class="text-gray-600"
          >Depreciation:
          <span class="font-medium text-green-600"
            >{{ formatCurrency(annualDepreciation) }}/yr</span
          ></span
        >
      </div>
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="space-y-4 px-6 pb-6">
      <!-- Depreciation Rate -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          Depreciation Rate (AfA-Satz): {{ depreciationRate }}%
        </label>
        <input
          type="range"
          :value="depreciationRate"
          @input="
            emit('update:depreciationRate', Number(($event.target as HTMLInputElement).value))
          "
          min="0.5"
          max="10"
          step="0.5"
          class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
        />
        <div class="mt-1 flex justify-between text-xs text-gray-500">
          <span>0.5%</span>
          <span>10%</span>
        </div>
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="preset in depreciationPresets"
            :key="preset.rate"
            type="button"
            :class="[
              'rounded-full border px-3 py-1 text-xs',
              depreciationRate === preset.rate
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
            ]"
            @click="emit('update:depreciationRate', preset.rate)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <!-- Land Value Percentage -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          Land Value (Grundstückswert): {{ landValuePercent }}%
        </label>
        <input
          type="range"
          :value="landValuePercent"
          @input="
            emit('update:landValuePercent', Number(($event.target as HTMLInputElement).value))
          "
          min="10"
          max="50"
          step="1"
          class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
        />
        <div class="mt-1 flex justify-between text-xs text-gray-500">
          <span>10%</span>
          <span>50%</span>
        </div>
        <div class="mt-2 rounded bg-gray-50 p-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Building Value (Gebäudewert)</span>
            <span class="font-medium">{{ formatCurrency(buildingValue) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Land Value (Grundstückswert)</span>
            <span class="font-medium">{{ formatCurrency(landValue) }}</span>
          </div>
          <div class="mt-1 flex justify-between font-medium text-green-600">
            <span>Annual Depreciation (Jährliche AfA)</span>
            <span>{{ formatCurrency(annualDepreciation) }}</span>
          </div>
        </div>
      </div>

      <!-- Tax Input Mode Toggle -->
      <div>
        <label class="mb-2 block text-sm font-medium text-gray-700"> Tax Rate Input Method </label>
        <div class="flex rounded-md shadow-sm">
          <button
            type="button"
            :class="[
              'flex-1 border px-4 py-2 text-sm font-medium',
              taxInputMode === 'rate'
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
            ]"
            @click="emit('update:taxInputMode', 'rate')"
          >
            Direct Rate
          </button>
          <button
            type="button"
            :class="[
              'flex-1 border-b border-r border-t px-4 py-2 text-sm font-medium',
              taxInputMode === 'income'
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
            ]"
            @click="emit('update:taxInputMode', 'income')"
          >
            From Income
          </button>
        </div>
      </div>

      <!-- Direct Rate Input -->
      <div v-if="taxInputMode === 'rate'">
        <label class="mb-1 block text-sm font-medium text-gray-700">
          Marginal Tax Rate (Grenzsteuersatz): {{ marginalTaxRate }}%
        </label>
        <input
          type="range"
          :value="marginalTaxRate"
          @input="emit('update:marginalTaxRate', Number(($event.target as HTMLInputElement).value))"
          min="0"
          max="45"
          step="1"
          class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
        />
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="preset in marginalRatePresets"
            :key="preset.rate"
            type="button"
            :class="[
              'rounded-full border px-3 py-1 text-xs',
              marginalTaxRate === preset.rate
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
            ]"
            @click="emit('update:marginalTaxRate', preset.rate)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <!-- Income-based Rate Input -->
      <div v-else>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          Taxable Income (Zu versteuerndes Einkommen)
        </label>
        <input
          type="number"
          :value="taxableIncome"
          @input="emit('update:taxableIncome', Number(($event.target as HTMLInputElement).value))"
          min="0"
          step="1000"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p class="mt-1 text-sm text-gray-600">
          Calculated marginal rate:
          <span class="font-medium text-blue-600">{{ formatPercent(calculatedMarginalRate) }}</span>
          <span v-if="jointTaxDeclaration" class="text-gray-500">
            (based on {{ formatCurrency(taxableIncome / 2) }} each)</span
          >
        </p>

        <!-- Joint Tax Declaration Checkbox -->
        <div class="mt-3 flex items-center">
          <input
            type="checkbox"
            id="jointTaxDeclaration"
            :checked="jointTaxDeclaration"
            @change="
              emit('update:jointTaxDeclaration', ($event.target as HTMLInputElement).checked)
            "
            class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            for="jointTaxDeclaration"
            class="ml-2 block text-sm text-gray-700"
            title="For married couples filing jointly - income is split for tax calculation"
          >
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
          class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label for="includeSoli" class="ml-2 block text-sm text-gray-700">
          Include Solidaritätszuschlag (+5.5%)
        </label>
      </div>

      <!-- Effective Rate Display -->
      <div class="rounded-md bg-blue-50 p-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-blue-700">Effective Marginal Rate</span>
          <span class="text-lg font-bold text-blue-600">{{
            formatPercent(effectiveMarginalRate)
          }}</span>
        </div>
        <p class="mt-1 text-xs text-blue-600">
          {{ includeSoli ? 'Including Solidaritätszuschlag' : 'Without Solidaritätszuschlag' }}
        </p>
      </div>
    </div>
  </div>
</template>
