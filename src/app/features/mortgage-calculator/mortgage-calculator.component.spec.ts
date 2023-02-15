import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MortgageCalculatorComponent as MortgageCalculatorComponent } from './mortgage-calculator.component';
import { MatButtonModule} from '@angular/material/button';
import { MatInputModule} from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule} from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';

describe('MortgageCalculatorComponent', () => {
  let component: MortgageCalculatorComponent;
  let fixture: ComponentFixture<MortgageCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MortgageCalculatorComponent ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatRippleModule,
        MatSelectModule,
        MatTableModule
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
    const numOfPays = 12*10;
    const ratePerPay = 12/12/100;
    const fixedPayment = component.getMortgageFixedPayment(mortgageAmount, ratePerPay, numOfPays);
    expect(fixedPayment).toBe(14347.094840258731);
  });

  it('should get the correct interest payment', () => {
    expect(component).toBeTruthy();
    const mortgageAmount = 1000000;
    const mortgagePayment = 14347.09484025873;
    const numOfPays = 12*10;
    const ratePerPay = 12/12/100;
    const interestPayment = component.getInterestPaymentInNumOfPays(mortgageAmount, mortgagePayment, ratePerPay, numOfPays);
    expect(interestPayment).toBe(721651.3808310498);
  });

  it('should get correct number of pays with input.', () => {

  });

  it('should throw error when frequency is not valid.', () => {

  });

  it('should trigger error message when missing required input.', () => {

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
