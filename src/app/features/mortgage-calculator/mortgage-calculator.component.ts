import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  submitErrorMessage: string = "";
  enableSubmitErrorMessage: boolean = false;

  inputFormGroup: FormGroup;
  requiredPositiveValidator: Validators[] = [Validators.required, Validators.min(0)];

  constructor() {
    this.inputFormGroup = new FormGroup({
      mortgageAmount: new FormControl('', [Validators.required, Validators.min(0)]),
      interestRate: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100)]),
      amortPeriodYear: new FormControl('', [Validators.required, Validators.min(1)]),
      amortPeriodMonth: new FormControl('', [Validators.min(1)]),
      paymentFrequency: new FormControl('', [Validators.required, Validators.min(0)]),
      term: new FormControl('', [Validators.required]),
      prepayAmount: new FormControl('', [Validators.min(0)]),
      prepayFrequency: new FormControl(''),
      prepayStartNthPay: new FormControl('', [Validators.min(1)])
    });

    // customer the period validators
    this.inputFormGroup.get('amortPeriodYear')?.valueChanges.subscribe(val => {
      if (val > 0) {
        this.inputFormGroup.controls['term'].addValidators([Validators.max(val)]);
        this.inputFormGroup.controls['term'].updateValueAndValidity({emitEvent:false});
      }
    });

    this.inputFormGroup.get('prepayAmount')?.valueChanges.subscribe(val => {
      if (val > 0) {
        this.inputFormGroup.controls['prepayFrequency'].addValidators([Validators.required]);
        this.inputFormGroup.controls['prepayStartNthPay'].addValidators([Validators.required]);
      } else {
        this.inputFormGroup.controls['prepayFrequency'].removeValidators([Validators.required]);
        this.inputFormGroup.controls['prepayStartNthPay'].removeValidators([Validators.required]);
      }
      this.inputFormGroup.controls['prepayFrequency'].updateValueAndValidity({emitEvent:false});
      this.inputFormGroup.controls['prepayStartNthPay'].updateValueAndValidity({emitEvent:false});
    });
  }

  /**
   * Returns the value of a base expression taken to a specified power.
   * @param mortgageAmount The principle amount of the mortgage.
   * @param ratePerPay The interest rate of each pay.
   * @param numOfPays The over all num of pays.
   * @returns the value of fixed monthly payment.
   */
  public getMortgageFixedPayment(mortgageAmount: number, ratePerPay: number, numOfPays: number): number{
    const powVal = Math.pow((1 + ratePerPay),numOfPays);
    const fixPayment = mortgageAmount * ratePerPay * powVal / (powVal - 1);
    return fixPayment;
  }

/**
 * Returns the value interest payment amount the payments.
 * @param mortgageAmount The principle amount of mortgage.
 * @param mortgagePayment The fix mortgage payment of each pay.
 * @param ratePerPay The interest rate of each payment.
 * @param numOfPays The number of payments.
 * @returns the interest payment in total payments.
 */
  public getInterestPaymentInNumOfPays(mortgageAmount: number, mortgagePayment: number, ratePerPay: number, numOfPays: number): number{
    if (numOfPays <= 0){
      return 0;
    }
    const interestPayment = mortgageAmount * ratePerPay;
    const nextmortgageAmount = mortgageAmount - (mortgagePayment - interestPayment);
    return interestPayment + this.getInterestPaymentInNumOfPays(nextmortgageAmount, mortgagePayment, ratePerPay, numOfPays - 1);
  }

  /**
   * get the number of pays in the limit time period.
   * @param frequency payment frequency.
   * @param months Payment period in month.
   * @returns the number of pays in the limited time period, throw error if the frequency if not valid.
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

  /**
   * Set the mortgage result.
   * @param formFiledInput The mortgage inputs.
   */
  isInputValid(formFiledInput: FormFiledInput): boolean{
    let isValid = true;
    if(!formFiledInput) {
      throw new Error(`formFiledInput: ${formFiledInput} does not exist`);
    }
    if(!formFiledInput.mortgageAmount) {
      this.submitErrorMessage += "/n" + "Missing *Mortgage Amount*.";
      isValid = false;
    }
    if(!formFiledInput.interestRate) {
      this.submitErrorMessage += "/n" + "Missing *Interest Rate*.";
      isValid = false;
    }
    if(!formFiledInput.amortPeriodYear || !formFiledInput.amortPeriodMonth) {
      this.submitErrorMessage += "/n" + "Amortization Period*.";
      isValid = false;
    }
    if(!formFiledInput.paymentFrequency) {
      this.submitErrorMessage += "/n" + "Payment Frequency*.";
      isValid = false;
    }
    if(!formFiledInput.term) {
      this.submitErrorMessage += "/n" + "Missing *Term*.";
      isValid = false;
    }

    return isValid;
  }

/**
 * Set the mortgage result.
 * @param formFiledInput The mortgage inputs.
 */
  setMortgageResult(formFiledInput: FormFiledInput) {
    const mortgageAmount = this.inputFormGroup.value.mortgageAmount || 1000000;
    const rate = this.inputFormGroup.value.interestRate || 4;
    const frequency = this.inputFormGroup.value.paymentFrequency || "M";
    const periodYears = this.inputFormGroup.value.amortPeriodYear ||30;
    const periodMonths = this.inputFormGroup.value.amortPeriodMonth || 0;
    const terms = this.inputFormGroup.value.term || 2;
    const numOfPaysPerYear = this.getNumOfPays(frequency, 12);
    const ratePerPay = rate/numOfPaysPerYear/100;

    if(mortgageAmount && ratePerPay){
      const numberOfPaymentsInPeriod = this.getNumOfPays(frequency, periodYears * 12 + periodMonths);
      const numberOfPaymentsInTerm = this.getNumOfPays(frequency, terms * 12);
      const fixedMortgagePayment = this.getMortgageFixedPayment(mortgageAmount, ratePerPay, numberOfPaymentsInPeriod);
      const interestPaymentInTerm = this.getInterestPaymentInNumOfPays(mortgageAmount, fixedMortgagePayment, ratePerPay, numberOfPaymentsInTerm)
      const totalCostInTerm = fixedMortgagePayment * numberOfPaymentsInTerm;
      const interestPaymentInPeriod = this.getInterestPaymentInNumOfPays(mortgageAmount, fixedMortgagePayment, ratePerPay, numberOfPaymentsInPeriod)
      const totalCostInPeriod = fixedMortgagePayment * numberOfPaymentsInPeriod;

      this.mortgageResult.push({
        name: "Number of Payments",
        termValue: numberOfPaymentsInTerm.toFixed(0).toString(),
        amortPeriodValue: numberOfPaymentsInPeriod.toFixed(0).toString()
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

  onSubmit() {

    if(this.inputFormGroup.valid) {
      //reset data
      this.mortgageResult = [];

      //calculate result
      this.setMortgageResult(this.formFiledInput);
    }

    this.inputFormGroup.markAsUntouched();
  }
}
