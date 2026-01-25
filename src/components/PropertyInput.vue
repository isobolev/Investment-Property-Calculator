<script setup lang="ts">
import { ref, computed } from 'vue'
import { germanStates, getStateByCode } from '../data/germanStates'

const purchasePrice = defineModel<number>('purchasePrice', { required: true })
const stateCode = defineModel<string>('stateCode', { required: true })
const stateTaxRate = defineModel<number>('stateTaxRate', { required: true })
const notaryRate = defineModel<number>('notaryRate', { required: true })
const landRegistryRate = defineModel<number>('landRegistryRate', { required: true })
const brokerRate = defineModel<number>('brokerRate', { required: true })
const includeBroker = defineModel<boolean>('includeBroker', { required: true })

const isExpanded = ref(false)

function onStateChange(code: string) {
  const state = getStateByCode(code)
  if (state) {
    stateTaxRate.value = state.taxRate
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const totalCostsRate = computed(() => {
  let rate = stateTaxRate.value + notaryRate.value + landRegistryRate.value
  if (includeBroker.value) rate += brokerRate.value
  return rate
})

const totalCosts = computed(() => (purchasePrice.value * totalCostsRate.value) / 100)
</script>

<template>
  <div class="overflow-hidden rounded-lg bg-white shadow-md">
    <!-- Header -->
    <button
      @click="isExpanded = !isExpanded"
      class="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50"
    >
      <h2 class="text-lg font-semibold text-gray-800">Purchase Data (Kaufdaten)</h2>
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
          >Price:
          <span class="font-medium text-gray-900">{{ formatCurrency(purchasePrice) }}</span></span
        >
        <span class="text-gray-600"
          >Costs:
          <span class="font-medium text-gray-900">{{ totalCostsRate.toFixed(1) }}%</span></span
        >
        <span class="text-gray-600"
          >Total:
          <span class="font-medium text-blue-600">{{
            formatCurrency(purchasePrice + totalCosts)
          }}</span></span
        >
      </div>
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="space-y-4 px-6 pb-6">
      <!-- Purchase Price -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          Purchase Price (Kaufpreis)
        </label>
        <div class="relative">
          <input
            v-model.number="purchasePrice"
            type="number"
            min="0"
            step="10000"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="300000"
          />
          <span class="absolute right-3 top-2 text-gray-500"></span>
        </div>
        <p class="mt-1 text-sm text-gray-500">{{ formatCurrency(purchasePrice) }}</p>
      </div>

      <!-- State Selector -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          Federal State (Bundesland)
        </label>
        <select
          v-model="stateCode"
          @change="onStateChange(stateCode)"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="state in germanStates" :key="state.code" :value="state.code">
            {{ state.name }} ({{ state.taxRate }}%)
          </option>
        </select>
      </div>

      <!-- Grunderwerbsteuer -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          Property Transfer Tax (Grunderwerbsteuer)
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="stateTaxRate"
            type="number"
            min="0"
            max="10"
            step="0.5"
            class="w-24 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <span class="text-gray-600">%</span>
          <span class="ml-2 text-sm text-gray-500">
            = {{ formatCurrency((purchasePrice * stateTaxRate) / 100) }}
          </span>
        </div>
      </div>

      <!-- Notary Fees -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          Notary Fees (Notarkosten)
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="notaryRate"
            type="number"
            min="0"
            max="5"
            step="0.1"
            class="w-24 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <span class="text-gray-600">%</span>
          <span class="ml-2 text-sm text-gray-500">
            = {{ formatCurrency((purchasePrice * notaryRate) / 100) }}
          </span>
        </div>
      </div>

      <!-- Land Registry -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          Land Registry Fees (Grundbuchkosten)
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="landRegistryRate"
            type="number"
            min="0"
            max="2"
            step="0.1"
            class="w-24 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <span class="text-gray-600">%</span>
          <span class="ml-2 text-sm text-gray-500">
            = {{ formatCurrency((purchasePrice * landRegistryRate) / 100) }}
          </span>
        </div>
      </div>

      <!-- Broker Fees -->
      <div>
        <div class="mb-2 flex items-center gap-2">
          <input
            v-model="includeBroker"
            type="checkbox"
            id="includeBroker"
            class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label for="includeBroker" class="text-sm font-medium text-gray-700">
            Broker Fees (Maklergebühren)
          </label>
        </div>
        <div v-if="includeBroker" class="ml-6 flex items-center gap-2">
          <input
            v-model.number="brokerRate"
            type="number"
            min="0"
            max="10"
            step="0.01"
            class="w-24 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <span class="text-gray-600">%</span>
          <span class="ml-2 text-sm text-gray-500">
            = {{ formatCurrency((purchasePrice * brokerRate) / 100) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
