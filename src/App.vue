<script setup lang="ts">
import { ref } from 'vue';
import PropertyInput from './components/PropertyInput.vue';
import FinancingInput from './components/FinancingInput.vue';
import RentalInput from './components/RentalInput.vue';
import TaxInput from './components/TaxInput.vue';
import AssumptionsInput from './components/AssumptionsInput.vue';
import ResultsSummary from './components/ResultsSummary.vue';
import { useCalculations } from './composables/useCalculations';

// Property inputs
const purchasePrice = ref(300000);
const garagePurchasePrice = ref(0);
const stateCode = ref('BY');
const stateTaxRate = ref(3.5);
const notaryRate = ref(1.5);
const landRegistryRate = ref(0.5);
const brokerRate = ref(3.57);
const includeBroker = ref(false);

// Financing inputs
const equity = ref(50000);
const interestRate = ref(3.8);
const repaymentRate = ref(1.5);

// Rental inputs
const monthlyRent = ref(1000);
const monthlyHausgeld = ref(150);
const maintenanceReserve = ref(50);
const vacancyRate = ref(0);

// Tax inputs
const depreciationRate = ref(2);
const landValuePercent = ref(20);
const marginalTaxRate = ref(42);
const includeSoli = ref(true);

// Assumptions
const appreciationRate = ref(2);
const inflationRate = ref(2);
const holdingPeriod = ref(10);
const stockReturnRate = ref(7);

// Calculate everything
const calculations = useCalculations(
  {
    purchasePrice,
    garagePurchasePrice,
    stateCode,
    stateTaxRate,
    notaryRate,
    landRegistryRate,
    brokerRate,
    includeBroker,
  },
  {
    equity,
    interestRate,
    repaymentRate,
  },
  {
    monthlyRent,
    monthlyHausgeld,
    maintenanceReserve,
    vacancyRate,
  },
  {
    depreciationRate,
    landValuePercent,
    marginalTaxRate,
    includeSoli,
  }
);
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900">
          Investment Property Calculator (Immobilien Renditerechner)
        </h1>
        <p class="mt-2 text-gray-600">
          Calculate purchase costs, financing, and returns for your investment property
        </p>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Left Column: Inputs -->
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-700">
            Investment Parameters (Investitionsparameter)
          </h2>
          <PropertyInput
            v-model:purchasePrice="purchasePrice"
            v-model:garagePurchasePrice="garagePurchasePrice"
            v-model:stateCode="stateCode"
            v-model:stateTaxRate="stateTaxRate"
            v-model:notaryRate="notaryRate"
            v-model:landRegistryRate="landRegistryRate"
            v-model:brokerRate="brokerRate"
            v-model:includeBroker="includeBroker"
          />

          <FinancingInput
            v-model:equity="equity"
            v-model:interestRate="interestRate"
            v-model:repaymentRate="repaymentRate"
            :totalInvestment="calculations.totalInvestment.value"
            :loanAmount="calculations.loanAmount.value"
            :loanToValue="calculations.loanToValue.value"
            :monthlyMortgage="calculations.monthlyMortgage.value"
          />

          <RentalInput
            v-model:monthlyRent="monthlyRent"
            v-model:monthlyHausgeld="monthlyHausgeld"
            v-model:maintenanceReserve="maintenanceReserve"
            v-model:vacancyRate="vacancyRate"
            :effectiveMonthlyRent="calculations.effectiveMonthlyRent.value"
            :annualRent="calculations.annualRent.value"
          />

          <TaxInput
            v-model:depreciationRate="depreciationRate"
            v-model:landValuePercent="landValuePercent"
            v-model:marginalTaxRate="marginalTaxRate"
            v-model:includeSoli="includeSoli"
            :buildingValue="calculations.buildingValue.value"
            :landValue="calculations.landValue.value"
            :annualDepreciation="calculations.annualDepreciation.value"
            :effectiveMarginalRate="calculations.effectiveMarginalRate.value"
          />

          <AssumptionsInput
            v-model:appreciationRate="appreciationRate"
            v-model:holdingPeriod="holdingPeriod"
            v-model:stockReturnRate="stockReturnRate"
          />
        </div>

        <!-- Right Column: Results -->
        <div class="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <h2 class="text-xl font-semibold text-gray-700">
            Analysis & Results (Analyse & Ergebnisse)
          </h2>
          <ResultsSummary
            :purchasePrice="purchasePrice"
            :garagePurchasePrice="garagePurchasePrice"
            :transferTax="calculations.transferTax.value"
            :notaryFees="calculations.notaryFees.value"
            :landRegistryFees="calculations.landRegistryFees.value"
            :brokerFees="calculations.brokerFees.value"
            :totalPurchaseCosts="calculations.totalPurchaseCosts.value"
            :purchaseCostsRate="calculations.purchaseCostsRate.value"
            :totalInvestment="calculations.totalInvestment.value"
            :appreciationRate="appreciationRate"
            :holdingPeriod="holdingPeriod"
            :equity="equity"
            :loanAmount="calculations.loanAmount.value"
            :interestRate="interestRate"
            :monthlyMortgage="calculations.monthlyMortgage.value"
            :annualMortgage="calculations.annualMortgage.value"
            :effectiveMonthlyRent="calculations.effectiveMonthlyRent.value"
            :monthlyExpenses="calculations.monthlyExpenses.value"
            :monthlyCashFlow="calculations.monthlyCashFlow.value"
            :annualCashFlow="calculations.annualCashFlow.value"
            :grossYield="calculations.grossYield.value"
            :netYield="calculations.netYield.value"
            :cashOnCashReturn="calculations.cashOnCashReturn.value"
            :rentMultiplier="calculations.rentMultiplier.value"
            :annualDepreciation="calculations.annualDepreciation.value"
            :annualDeductibleInterest="calculations.annualDeductibleInterest.value"
            :annualExpenses="calculations.annualExpenses.value"
            :totalDeductibleExpenses="calculations.totalDeductibleExpenses.value"
            :effectiveAnnualRent="calculations.effectiveAnnualRent.value"
            :taxableRentalIncome="calculations.taxableRentalIncome.value"
            :annualTaxSavings="calculations.annualTaxSavings.value"
            :monthlyCashFlowAfterTax="calculations.monthlyCashFlowAfterTax.value"
            :annualCashFlowAfterTax="calculations.annualCashFlowAfterTax.value"
            :stockReturnRate="stockReturnRate"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-sm text-gray-500">
        <!-- Legend -->
        <div class="space-y-1 px-2 text-xs text-gray-500">
          <p>
            <span class="font-medium text-green-600">Green</span>: Good values |
            <span class="font-medium text-yellow-600">Yellow</span>: Acceptable |
            <span class="font-medium text-red-600">Red</span>: Critical
          </p>
        </div>
        <p class="mt-2">
          This calculation is for informational purposes only and does not replace professional
          advice.
        </p>
        <p class="mt-1">All information without guarantee.</p>
      </div>
    </div>
  </div>
</template>
