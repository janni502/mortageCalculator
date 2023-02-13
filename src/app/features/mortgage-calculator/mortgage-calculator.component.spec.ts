import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MortgageCalculatorComponent as MortgageCalculatorComponent } from './mortgage-calculator.component';
import { MatButtonModule} from '@angular/material/button';
import { MatInputModule} from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule} from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('MortgageCalculatorComponent', () => {
  let component: MortgageCalculatorComponent;
  let fixture: ComponentFixture<MortgageCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MortgageCalculatorComponent ],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatRippleModule,
        MatSelectModule,
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MortgageCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have Fixed Payment calculate correctly', () => {
    expect(component).toBeTruthy();
    const mortgageAmount = 1000000;
    const numOfPays = 12*10;
    const monthlyRate = 1/100;
    const fixedPayment = component.getFixedPayment(mortgageAmount, monthlyRate, numOfPays);
    expect(fixedPayment).toBe(14347.094840258731);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
