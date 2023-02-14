import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MortgageDetail, FormFiledInput} from './mortgage-calculator.models';

@Component({
  selector: 'app-mortgage-calculator',
  templateUrl: './mortgage-calculator.component.html',
  styleUrls: ['./mortgage-calculator.component.css']
})
export class MortgageCalculatorComponent {
  monthsOptions = Array.from(Array(12),(x,i)=>i+1);
  yearsOptions = Array.from(Array(30),(x,i)=>i+1);
  termsOptions = Array.from(Array(10),(x,i)=>i+1);
  displayedColumns: string[] = ['col-name', 'col-term', 'col-period'];  // displayedColumns = ["name"];
  mortgageInTerm: MortgageDetail = {} as MortgageDetail;
  mortgageInAmortPeriod: MortgageDetail = {} as MortgageDetail;
  mortgageResult: MortgageDetail[] = [];
  formFiledInput: FormFiledInput = {} as FormFiledInput;
  integerControl = new FormControl('', [Validators.required, Validators.min(0)]);
  rateControl = new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]);

  setMortgageResult(principleAmount: number, rate: number, frequency: string, periodYears: number, periodMonths: number, terms: number ) {
    if(!principleAmount || !rate || !frequency || !periodYears || !terms){
      principleAmount = 1000000;
      rate = 4;
      frequency = "M";
      periodYears = 30;
      terms = 2;
      // throw console.error("Missing required value to calculate mortgage.");
    }
    periodMonths = periodMonths? periodMonths: 0;
    const numOfPaysPerYear = this.getNumOfPays(frequency, 12);
    const ratePerPay = rate/numOfPaysPerYear/100;

    if(principleAmount && ratePerPay){
      const numberOfPaymentsInPeriod = this.getNumOfPays(frequency, periodYears * 12 + periodMonths);
      const numberOfPaymentsInTerm = this.getNumOfPays(frequency, terms * 12);
      const fixedMortgagePayment = this.getMortgageFixedPayment(principleAmount, ratePerPay, numberOfPaymentsInPeriod);
      const interestPaymentInTerm = this.getInterestPaymentInNumOfPays(principleAmount, fixedMortgagePayment, ratePerPay, numberOfPaymentsInTerm)
      const totalCostInTerm = fixedMortgagePayment * numberOfPaymentsInTerm;

      const interestPaymentInPeriod = this.getInterestPaymentInNumOfPays(principleAmount, fixedMortgagePayment, ratePerPay, numberOfPaymentsInPeriod)
      const totalCostInPeriod = fixedMortgagePayment * numberOfPaymentsInPeriod;
      const rowToDisplay = ["Category", "Number of Payments", "Mortgage Payment","Principal Payments", "Interest Payments","Total Cost"];

      this.mortgageResult.push({
        name: "Number of Payments",
        termValue: numberOfPaymentsInTerm.toString(),
        amortPeriodValue: numberOfPaymentsInPeriod.toString()
      });

      this.mortgageResult.push({
        name: "Mortgage Payment",
        termValue: "$" + fixedMortgagePayment.toFixed(2),
        amortPeriodValue: "$" + fixedMortgagePayment.toFixed(2)
      });

      this.mortgageResult.push({
        name: "Principal Payments",
        termValue: "$" + (totalCostInTerm - interestPaymentInTerm).toFixed(2),
        amortPeriodValue: "$" + (totalCostInPeriod - interestPaymentInPeriod).toFixed(2)
      });

      this.mortgageResult.push({
        name: "Interest Payments",
        termValue: "$" + interestPaymentInTerm.toFixed(2),
        amortPeriodValue: "$" + interestPaymentInPeriod.toFixed(2)
      });

      this.mortgageResult.push({
        name: "Total Cost",
        termValue: "$" + totalCostInTerm.toFixed(2),
        amortPeriodValue: "$" + totalCostInPeriod.toFixed(2)
      });

    }
  }

  /**
   * Returns the value of a base expression taken to a specified power.
   * @param principleAmount The principle amount of the mortgage.
   * @param ratePerPay The interest rate of each pay.
   * @param numOfPays The over all num of pays.
   * @returns the value of fixed monthly payment.
   */
  public getMortgageFixedPayment(principleAmount: number, ratePerPay: number, numOfPays: number): number{
    const powVal = Math.pow((1 + ratePerPay),numOfPays);
    const fixPayment = principleAmount * ratePerPay * powVal / (powVal - 1);
    return fixPayment;
  }

/**
 * Returns the value interest payment amount the payments.
 * @param principleAmount The principle amount of mortgage.
 * @param mortgagePayment The fix mortgage payment of each pay.
 * @param ratePerPay The interest rate of each payment.
 * @param numOfPays The number of payments.
 * @returns the interest payment in total payments.
 */
  public getInterestPaymentInNumOfPays(principleAmount: number, mortgagePayment: number, ratePerPay: number, numOfPays: number): number{
    if (numOfPays <= 0){
      return 0;
    }
    const interestPayment = principleAmount * ratePerPay;
    const nextPrincipleAmount = principleAmount - (mortgagePayment - interestPayment);
    return interestPayment + this.getInterestPaymentInNumOfPays(nextPrincipleAmount, mortgagePayment, ratePerPay, numOfPays - 1);
  }

    /**
   * Returns the value of a base expression taken to a specified power.
   * @param frequency The principle amount of the mortgage.
   * @param months The interest rate of each pay.
   * @returns the number of pays in the a limited of time, return undefined if the frequency if not valid.
   */
  public getNumOfPays(frequency: string, months: number): number {
        // "AccW"--> Accelerated Weekly
        // "W"--> Weekly
        // "AccBiW"--> Accelerated Bi-weekly
        // "BiW"--> Bi-Weekly (every 2 weeks)
        // "SemiM"--> Semi-monthly (24x per year)
        // "M"--> Monthly (12x per year)
    switch (frequency) {
      case "AccW":
        return 52*months/12;
      case "W":
        return 52*months/12;
      case "AccBiW":
        return 52*months/12/2;
      case "BiW":
        return 52*months/12/2;
      case "SemiM":
        return 2*months;
      case "M":
        return months;
      default:
        throw new Error(`Frequency: ${frequency} is not valid`);
    }
  }

  submit() {
    //verify the inputs
    this.mortgageResult = [];
    //calculate result
    this.setMortgageResult(this.formFiledInput.mortgageAmount, this.formFiledInput.interestRate, this.formFiledInput.paymentFrequency, this.formFiledInput.amortPeriodYear, this.formFiledInput.amortPeriodMonth, this.formFiledInput.term);
  }

  getErrorMessage() {
    // if (this.email.hasError('required')) {
    //   return 'You must enter a value';
    // }

    // return this.email.hasError('email') ? 'Not a valid email' : '';
  }
}
