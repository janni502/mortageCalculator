export interface MortgageDetails {
  name: string;
  numberOfPayments: number;
  payment: string;
  principalPayment: string;
  interestPayment: string;
  totalCost: string;
}

export interface MortgageDetail {
  name: string;
  termValue: string;
  amortPeriodValue: string;
}

export interface FormFiledInput {
  mortgageAmount: number;
  interestRate: number;
  amortPeriodYear: number;
  amortPeriodMonth?: number;
  paymentFrequency: string;
  term: number;
  prepayAmount?: number;
  prepayFrequency?: string;
  prepayStartNthPay?: number;
}
