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
        this.inputFormGroup.controls['term'].clearValidators();
        this.inputFormGroup.controls['term'].setValidators([Validators.required,Validators.max(val)]);
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
   * @param eachPayRate The interest rate of each pay.
   * @param numOfPays The over all num of pays.
   * @returns the value of fixed monthly payment.
   */
  public getMortgageFixedPayment(
      mortgageAmount: number,
      eachPayRate: number,
      numOfPays: number,
    ): number{
    const powVal = Math.pow((1 + eachPayRate),numOfPays);
    const fixPayment = mortgageAmount * eachPayRate * powVal / (powVal - 1);
    return fixPayment;
  }

/**
 * Returns the value interest payment amount the payments.
 * @param mortgageAmount The principle amount of mortgage.
 * @param mortgagePayment The fix mortgage payment of each pay.
 * @param eachPayRate The interest rate of each payment.
 * @param numOfPays The number of payments.
 * @param paymentIndex The no. of the prepayment
 * @param prepayFrequency The frequency of prepayment
 * @param prepayAmount The amount of prepayment.
 * @param prepayStartInNthPay The prepayment start from nth payment.
 * @returns the mortgage payment detail.
 */
  public getMortgagePaymentInNumOfPays(
    mortgageAmount: number,
    mortgagePayment: number,
    eachPayRate: number,
    numOfPays: number,
    paymentIndex: number,
    prepayFrequency?: number,
    prepayAmount?: number,
    prepayStartInNthPay? : number
    ): any{

    if (numOfPays <=0 ){
      return {
        totalInterestPay: 0,
        totalCost: 0,
        lastMortgagePay: 0,
        actualNumOfPays: paymentIndex - 1
      };
    }

    if (mortgageAmount < 1){
      return {
              totalInterestPay: 0,
              totalCost: 0,
              lastMortgagePay: 0,
              actualNumOfPays: paymentIndex - 1
            };
    }

    const interestPayment = mortgageAmount * eachPayRate;
    if (mortgageAmount + interestPayment + 1 < mortgagePayment) {
      return {
              totalInterestPay: interestPayment,
              totalCost: mortgageAmount + interestPayment,
              lastMortgagePay: mortgageAmount + interestPayment,
              actualNumOfPays: paymentIndex
             };
    }

    let nextMortgageAmount = mortgageAmount - (mortgagePayment - interestPayment);
    let prepayValue = 0;
    if (prepayAmount && prepayFrequency && prepayStartInNthPay &&
        prepayStartInNthPay <= paymentIndex && ( // if the current pay is after trigger the first repay
        (prepayFrequency == 1 ) || // prepay each payment
        (prepayFrequency > 1 && paymentIndex % prepayFrequency == 0) || // prepay in every n times of payment
        (prepayFrequency == 0 && paymentIndex == prepayStartInNthPay) // prepay only once
      )) {
        prepayValue = prepayAmount;
    }

    const nextInterestResult = this.getMortgagePaymentInNumOfPays(
      nextMortgageAmount - prepayValue,
      mortgagePayment,
      eachPayRate,
      numOfPays - 1,
      paymentIndex + 1,
      prepayFrequency,
      prepayAmount,
      prepayStartInNthPay
    );

    return {
            totalInterestPay: nextInterestResult.totalInterestPay + interestPayment,
            totalCost: nextInterestResult.totalCost + mortgagePayment + prepayValue,
            lastMortgagePay: nextInterestResult.lastMortgagePay,
            actualNumOfPays: nextInterestResult.actualNumOfPays
            };
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
 */
  setMortgageResult() {
    const mortgageAmount = this.inputFormGroup.value.mortgageAmount || 1000000;
    const rate = this.inputFormGroup.value.interestRate || 4;
    const frequency = this.inputFormGroup.value.paymentFrequency || "M";
    const periodYears = this.inputFormGroup.value.amortPeriodYear ||30;
    const periodMonths = this.inputFormGroup.value.amortPeriodMonth || 0;
    const terms = this.inputFormGroup.value.term || 2;
    const prepayAmount = this.inputFormGroup.value.prepayAmount;
    const prepayFrequency = this.inputFormGroup.value.prepayFrequency;
    const prepayStartNthPay = this.inputFormGroup.value.prepayStartNthPay;

    const numOfPaysPerYear = this.getNumOfPays(frequency, 12);
    const eachPayRate = rate/numOfPaysPerYear/100;
    const numberOfPaymentsInPeriod = this.getNumOfPays(frequency, periodYears * 12 + periodMonths);
    const numberOfPaymentsInTerm = this.getNumOfPays(frequency, terms * 12);
    const fixedMortgagePayment = this.getMortgageFixedPayment(mortgageAmount, eachPayRate, numberOfPaymentsInPeriod);

    let prepayFrequencyNum = prepayFrequency == "Y"? 12 : prepayFrequency;

    const mortgagePaymentInTerm = this.getMortgagePaymentInNumOfPays(
      mortgageAmount,
      fixedMortgagePayment,
      eachPayRate,
      numberOfPaymentsInTerm,
      1,
      prepayFrequencyNum,
      prepayAmount,
      prepayStartNthPay
      )
    const totalCostInTerm = fixedMortgagePayment * numberOfPaymentsInTerm;
    const mortgagePaymentInPeriod = this.getMortgagePaymentInNumOfPays(
      mortgageAmount,
      fixedMortgagePayment,
      eachPayRate,
      numberOfPaymentsInPeriod,
      1,
      prepayFrequencyNum,
      prepayAmount,
      prepayStartNthPay
      )

    this.mortgageResult.push({
      name: "Number of Payments",
      termValue: numberOfPaymentsInTerm.toString(),
      amortPeriodValue: mortgagePaymentInPeriod.lastMortgagePay.toFixed(0) == 0? mortgagePaymentInPeriod.actualNumOfPays.toString(): (mortgagePaymentInPeriod.actualNumOfPays - 1).toString() + " + 1 in " + mortgagePaymentInPeriod.lastMortgagePay.toFixed(2).toString()
    });

    this.mortgageResult.push({
      name: "Mortgage Payment",
      termValue: "$" + fixedMortgagePayment.toFixed(2),
      amortPeriodValue: "$" + fixedMortgagePayment.toFixed(2)
    });

    this.mortgageResult.push({
      name: "Principal Payments",
      termValue: "$" + (mortgagePaymentInTerm.totalCost - mortgagePaymentInTerm.totalInterestPay).toFixed(2),
      amortPeriodValue: "$" + (mortgagePaymentInPeriod.totalCost - mortgagePaymentInPeriod.totalInterestPay).toFixed(2)
    });

    this.mortgageResult.push({
      name: "Interest Payments",
      termValue: "$" + mortgagePaymentInTerm.totalInterestPay.toFixed(2),
      amortPeriodValue: "$" + mortgagePaymentInPeriod.totalInterestPay.toFixed(2)
    });

    this.mortgageResult.push({
      name: "Total Cost",
      termValue: "$" + mortgagePaymentInTerm.totalCost.toFixed(2),
      amortPeriodValue: "$" + mortgagePaymentInPeriod.totalCost.toFixed(2)
    });
  }

  onSubmit() {

    if(this.inputFormGroup.valid) {
      //reset data
      this.mortgageResult = [];

      //calculate result
      this.setMortgageResult();
    }

    this.inputFormGroup.markAsUntouched();
  }
}
