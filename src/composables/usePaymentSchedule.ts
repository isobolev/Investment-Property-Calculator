import { computed, type Ref } from 'vue';

export interface PaymentScheduleEntry {
  month: number;
  date: Date;
  interestPayment: number;
  principalPayment: number;
  sondertilgung: number;
  totalPayment: number;
  remainingBalance: number;
}

export interface PaymentScheduleSummary {
  totalMonths: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  totalSondertilgungPaid: number;
  cappedAtMaxMonths: boolean;
}

const MAX_MONTHS = 600; // 50 years cap

export function usePaymentSchedule(
  loanAmount: Ref<number>,
  monthlyMortgage: Ref<number>,
  interestRate: Ref<number>,
  monthlySondertilgung: Ref<number> = { value: 0 } as Ref<number>
) {
  const schedule = computed<PaymentScheduleEntry[]>(() => {
    if (loanAmount.value <= 0 || monthlyMortgage.value <= 0) {
      return [];
    }

    let balance = loanAmount.value;
    const entries: PaymentScheduleEntry[] = [];
    const startDate = new Date();
    const monthlyRate = interestRate.value / 100 / 12;

    while (balance > 0.01 && entries.length < MAX_MONTHS) {
      const interest = balance * monthlyRate;
      let principal = monthlyMortgage.value - interest;

      // If payment doesn't cover interest, loan will never be paid off
      if (principal <= 0) {
        break;
      }

      const sonder = monthlySondertilgung.value;

      // Don't overpay - cap the total reduction at the remaining balance
      const potentialReduction = principal + sonder;
      const actualReduction = Math.min(potentialReduction, balance);

      // Adjust principal and sondertilgung proportionally if we're overpaying
      let actualPrincipal = principal;
      let actualSonder = sonder;
      if (potentialReduction > balance) {
        const ratio = balance / potentialReduction;
        actualPrincipal = principal * ratio;
        actualSonder = sonder * ratio;
      }

      balance -= actualReduction;

      entries.push({
        month: entries.length + 1,
        date: new Date(startDate.getFullYear(), startDate.getMonth() + entries.length, 1),
        interestPayment: interest,
        principalPayment: actualPrincipal,
        sondertilgung: actualSonder,
        totalPayment: interest + actualReduction,
        remainingBalance: Math.max(0, balance),
      });
    }

    return entries;
  });

  const summary = computed<PaymentScheduleSummary>(() => {
    const entries = schedule.value;

    if (entries.length === 0) {
      return {
        totalMonths: 0,
        totalInterestPaid: 0,
        totalPrincipalPaid: 0,
        totalSondertilgungPaid: 0,
        cappedAtMaxMonths: false,
      };
    }

    const totalInterestPaid = entries.reduce((sum, e) => sum + e.interestPayment, 0);
    const totalPrincipalPaid = entries.reduce((sum, e) => sum + e.principalPayment, 0);
    const totalSondertilgungPaid = entries.reduce((sum, e) => sum + e.sondertilgung, 0);
    const lastEntry = entries[entries.length - 1];
    const cappedAtMaxMonths = entries.length >= MAX_MONTHS && lastEntry.remainingBalance > 0.01;

    return {
      totalMonths: entries.length,
      totalInterestPaid,
      totalPrincipalPaid,
      totalSondertilgungPaid,
      cappedAtMaxMonths,
    };
  });

  return { schedule, summary };
}
