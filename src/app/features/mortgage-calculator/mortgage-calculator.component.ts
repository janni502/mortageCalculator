import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-mortgage-calculator',
  templateUrl: './mortgage-calculator.component.html',
  styleUrls: ['./mortgage-calculator.component.css']
})
export class MortgageCalculatorComponent {
  selected = 'option2';
  monthsOptions = Array.from(Array(12),(x,i)=>i+1);
  yearsOptions = Array.from(Array(30),(x,i)=>i+1);
  termsOptions = Array.from(Array(10),(x,i)=>i+1);


  getMortgageResult(amount: number, rate: number, frequency: number, periodYears: number, periodMonths: number, terms: number ) {

  }

  public getFixedPayment(amount: number, monthlyRate: number, numOfPays: number): number{
    const powVal = Math.pow((1 + monthlyRate),numOfPays);
    const fixPayment = amount * monthlyRate * powVal / (powVal - 1);
    return fixPayment;
  }

}
