<script setup lang="ts">
import { ref } from 'vue';

const appreciationRate = defineModel<number>('appreciationRate', { required: true });
const inflationRate = defineModel<number>('inflationRate', { required: true });
const holdingPeriod = defineModel<number>('holdingPeriod', { required: true });

const isExpanded = ref(false);
</script>

<template>
  <div class="overflow-hidden rounded-lg bg-white shadow-md">
    <!-- Header -->
    <button
      @click="isExpanded = !isExpanded"
      class="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50"
    >
      <h2 class="text-lg font-semibold text-gray-800">Assumptions (Annahmen)</h2>
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
          >Appreciation:
          <span class="font-medium text-gray-900">{{ appreciationRate }}%</span></span
        >
        <span class="text-gray-600"
          >Inflation: <span class="font-medium text-gray-900">{{ inflationRate }}%</span></span
        >
        <span class="text-gray-600"
          >Holding: <span class="font-medium text-gray-900">{{ holdingPeriod }} yrs</span></span
        >
      </div>
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="space-y-4 px-6 pb-6">
      <!-- Property Appreciation Rate -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          Property Appreciation (Wertsteigerung)
        </label>
        <div class="flex items-center gap-4">
          <input
            v-model.number="appreciationRate"
            type="range"
            min="0"
            max="10"
            step="0.5"
            class="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200"
          />
          <div class="flex w-24 items-center gap-1">
            <input
              v-model.number="appreciationRate"
              type="number"
              min="0"
              max="20"
              step="0.5"
              class="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-gray-600">%</span>
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">Annual property value increase</p>
      </div>

      <!-- Inflation Rate -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          Inflation Rate (Inflationsrate)
        </label>
        <div class="flex items-center gap-4">
          <input
            v-model.number="inflationRate"
            type="range"
            min="0"
            max="10"
            step="0.5"
            class="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200"
          />
          <div class="flex w-24 items-center gap-1">
            <input
              v-model.number="inflationRate"
              type="number"
              min="0"
              max="20"
              step="0.5"
              class="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-gray-600">%</span>
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">Expected annual inflation (affects rent increases)</p>
      </div>

      <!-- Holding Period -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700">
          Holding Period (Haltedauer)
        </label>
        <div class="flex items-center gap-4">
          <input
            v-model.number="holdingPeriod"
            type="range"
            min="1"
            max="30"
            step="1"
            class="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200"
          />
          <div class="flex w-24 items-center gap-1">
            <input
              v-model.number="holdingPeriod"
              type="number"
              min="1"
              max="50"
              step="1"
              class="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-gray-600">yrs</span>
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">Investment horizon in years</p>
      </div>

      <!-- Info Box -->
      <div class="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
        <p class="mb-1 font-medium text-gray-700">Note</p>
        <p>
          These assumptions are used for long-term projections. After 10 years of ownership, capital
          gains are tax-free in Germany (Spekulationsfrist).
        </p>
      </div>
    </div>
  </div>
</template>
