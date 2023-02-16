import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MortgageCalculatorComponent as MortgageCalculatorComponent } from './mortgage-calculator.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';

describe('MortgageCalculatorComponent', () => {
  let component: MortgageCalculatorComponent;
  let fixture: ComponentFixture<MortgageCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MortgageCalculatorComponent],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatRippleModule,
        MatSelectModule,
        MatTableModule,
        ReactiveFormsModule
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(MortgageCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should get the correct fixed payment', () => {
    expect(component).toBeTruthy();
    const mortgageAmount = 1000000;
    const numOfPays = 12 * 10;
    const ratePerPay = 12 / 12 / 100;
    const fixedPayment = component.getMortgageFixedPayment(mortgageAmount, ratePerPay, numOfPays);
    expect(fixedPayment).toBe(14347.094840258731);
  });

  it('should get the correct mortgage payment without prepayment', () => {
    expect(component).toBeTruthy();
    const mortgageAmount = 1000000;
    const mortgagePayment = 14347.09484025873;
    const numOfPays = 12 * 10;
    const ratePerPay = 12 / 12 / 100;
    const interestPayment = component.getMortgagePaymentInNumOfPays(mortgageAmount, mortgagePayment, ratePerPay, numOfPays, 1);
    expect(interestPayment).toEqual({ totalInterestPay: 721651.3808310498, totalCost: 1721651.380831051, lastMortgagePay: 0, actualNumOfPays: 120 });
  });

  it('should get the correct mortgage payment with prepayment', () => {
    expect(component).toBeTruthy();
    const mortgageAmount = 1000000;
    const mortgagePayment = 14347.09484025873;
    const numOfPays = 12 * 10;
    const ratePerPay = 12 / 12 / 100;
    const prepayFrequency = 1;
    const prepayAmount = 900;
    const prepayStart = 1;
    const interestPayment = component.getMortgagePaymentInNumOfPays(mortgageAmount, mortgagePayment, ratePerPay, numOfPays, 1, prepayFrequency, prepayAmount, prepayStart);
    expect(interestPayment).toEqual({ totalInterestPay: 634560.5853546682, totalCost: 1634560.5853546706, lastMortgagePay: 3121.4374469839013, actualNumOfPays: 108 });
  });

  it('should get correct number of pays with input.', () => {
    expect(component).toBeTruthy();
    const payFrequency = "W";
    const payPeriodMonths = 120;
    const paysInPeriod = component.getNumOfPays(payFrequency, payPeriodMonths);
    expect(paysInPeriod).toBe(520);
  });

  it('should throw error when frequency is not valid.', () => {
    expect(component).toBeTruthy();
    const payFrequency = "invalid";
    const payPeriodMonths = 120;
    try {
      component.getNumOfPays(payFrequency, payPeriodMonths)
      fail('should thrown Error')
    } catch (error) {
      expect(error).toEqual(Error(`Frequency (${payFrequency}) is not valid`));
    }
  });

  it('should create mortgage calculator component', () => {
    expect(component).toBeTruthy();
  });

  // element rendering tests
  it('should render the labels', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('form h1')?.textContent).toContain('Payment Plan');
  });

  it('should have mortgage amount input box work as expected', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const element = compiled.querySelector('mat-form-field#amount') as HTMLElement;
    expect(element).toBeDefined();
    expect(element?.querySelector('mat-label')?.textContent).toContain('Mortgage Amount');
    component?.inputFormGroup.controls['mortgageAmount']?.setValue(-1);
    expect(component.inputFormGroup.controls['mortgageAmount'].valid).toBeFalsy();
    component?.inputFormGroup.controls['mortgageAmount']?.setValue(3);
    component?.inputFormGroup.controls['mortgageAmount']?.updateValueAndValidity;
    expect(component.inputFormGroup.controls['mortgageAmount'].valid).toBeTrue();
  });
});
