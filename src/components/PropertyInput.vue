<script setup lang="ts">
import { germanStates, getStateByCode } from '../data/germanStates'

const purchasePrice = defineModel<number>('purchasePrice', { required: true })
const stateCode = defineModel<string>('stateCode', { required: true })
const stateTaxRate = defineModel<number>('stateTaxRate', { required: true })
const notaryRate = defineModel<number>('notaryRate', { required: true })
const landRegistryRate = defineModel<number>('landRegistryRate', { required: true })
const brokerRate = defineModel<number>('brokerRate', { required: true })
const includeBroker = defineModel<boolean>('includeBroker', { required: true })

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
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Purchase Data (Kaufdaten)</h2>

    <div class="space-y-4">
      <!-- Purchase Price -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Purchase Price (Kaufpreis)
        </label>
        <div class="relative">
          <input
            v-model.number="purchasePrice"
            type="number"
            min="0"
            step="10000"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="300000"
          />
          <span class="absolute right-3 top-2 text-gray-500"></span>
        </div>
        <p class="mt-1 text-sm text-gray-500">{{ formatCurrency(purchasePrice) }}</p>
      </div>

      <!-- State Selector -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Federal State (Bundesland)
        </label>
        <select
          v-model="stateCode"
          @change="onStateChange(stateCode)"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option v-for="state in germanStates" :key="state.code" :value="state.code">
            {{ state.name }} ({{ state.taxRate }}%)
          </option>
        </select>
      </div>

      <!-- Grunderwerbsteuer -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Property Transfer Tax (Grunderwerbsteuer)
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="stateTaxRate"
            type="number"
            min="0"
            max="10"
            step="0.5"
            class="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span class="text-gray-600">%</span>
          <span class="text-sm text-gray-500 ml-2">
            = {{ formatCurrency(purchasePrice * stateTaxRate / 100) }}
          </span>
        </div>
      </div>

      <!-- Notary Fees -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Notary Fees (Notarkosten)
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="notaryRate"
            type="number"
            min="0"
            max="5"
            step="0.1"
            class="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span class="text-gray-600">%</span>
          <span class="text-sm text-gray-500 ml-2">
            = {{ formatCurrency(purchasePrice * notaryRate / 100) }}
          </span>
        </div>
      </div>

      <!-- Land Registry -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Land Registry Fees (Grundbuchkosten)
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="landRegistryRate"
            type="number"
            min="0"
            max="2"
            step="0.1"
            class="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span class="text-gray-600">%</span>
          <span class="text-sm text-gray-500 ml-2">
            = {{ formatCurrency(purchasePrice * landRegistryRate / 100) }}
          </span>
        </div>
      </div>

      <!-- Broker Fees -->
      <div>
        <div class="flex items-center gap-2 mb-2">
          <input
            v-model="includeBroker"
            type="checkbox"
            id="includeBroker"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label for="includeBroker" class="text-sm font-medium text-gray-700">
            Broker Fees (Maklergebühren)
          </label>
        </div>
        <div v-if="includeBroker" class="flex items-center gap-2 ml-6">
          <input
            v-model.number="brokerRate"
            type="number"
            min="0"
            max="10"
            step="0.01"
            class="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span class="text-gray-600">%</span>
          <span class="text-sm text-gray-500 ml-2">
            = {{ formatCurrency(purchasePrice * brokerRate / 100) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
