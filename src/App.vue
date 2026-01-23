<script setup lang="ts">
import { ref } from 'vue'
import PropertyInput from './components/PropertyInput.vue'
import FinancingInput from './components/FinancingInput.vue'
import RentalInput from './components/RentalInput.vue'
import TaxInput from './components/TaxInput.vue'
import ResultsSummary from './components/ResultsSummary.vue'
import { useCalculations } from './composables/useCalculations'

// Property inputs
const purchasePrice = ref(300000)
const stateCode = ref('BY')
const stateTaxRate = ref(3.5)
const notaryRate = ref(1.5)
const landRegistryRate = ref(0.5)
const brokerRate = ref(3.57)
const includeBroker = ref(false)

// Financing inputs
const equity = ref(60000)
const interestRate = ref(3.5)
const repaymentRate = ref(2.0)

// Rental inputs
const monthlyRent = ref(1000)
const monthlyHausgeld = ref(150)
const maintenanceReserve = ref(50)
const vacancyRate = ref(3)

// Tax inputs
const depreciationRate = ref(2)
const landValuePercent = ref(20)
const taxInputMode = ref<'rate' | 'income'>('rate')
const marginalTaxRate = ref(42)
const taxableIncome = ref(60000)
const includeSoli = ref(true)
const jointTaxDeclaration = ref(false)

// Calculate everything
const calculations = useCalculations(
  {
    purchasePrice,
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
    taxInputMode,
    marginalTaxRate,
    taxableIncome,
    includeSoli,
    jointTaxDeclaration,
  }
)
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Investment Property Calculator (Immobilien Renditerechner)</h1>
        <p class="mt-2 text-gray-600">Calculate purchase costs, financing, and returns for your investment property</p>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column: Inputs -->
        <div class="space-y-6">
          <PropertyInput
            v-model:purchasePrice="purchasePrice"
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
            v-model:taxInputMode="taxInputMode"
            v-model:marginalTaxRate="marginalTaxRate"
            v-model:taxableIncome="taxableIncome"
            v-model:includeSoli="includeSoli"
            v-model:jointTaxDeclaration="jointTaxDeclaration"
            :buildingValue="calculations.buildingValue.value"
            :landValue="calculations.landValue.value"
            :annualDepreciation="calculations.annualDepreciation.value"
            :effectiveMarginalRate="calculations.effectiveMarginalRate.value"
          />
        </div>

        <!-- Right Column: Results -->
        <div class="lg:sticky lg:top-8 lg:self-start">
          <ResultsSummary
            :purchasePrice="purchasePrice"
            :transferTax="calculations.transferTax.value"
            :notaryFees="calculations.notaryFees.value"
            :landRegistryFees="calculations.landRegistryFees.value"
            :brokerFees="calculations.brokerFees.value"
            :totalPurchaseCosts="calculations.totalPurchaseCosts.value"
            :purchaseCostsRate="calculations.purchaseCostsRate.value"
            :totalInvestment="calculations.totalInvestment.value"
            :equity="equity"
            :loanAmount="calculations.loanAmount.value"
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
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-sm text-gray-500">
        <p>This calculation is for informational purposes only and does not replace professional advice.</p>
        <p class="mt-1">All information without guarantee.</p>
      </div>
    </div>
  </div>
</template>
