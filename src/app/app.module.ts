import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule} from '@angular/material/button';
import { MatInputModule} from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule} from '@angular/material/select';

import { AppComponent } from './app.component';
import { MortgageCalculatorComponent } from './features/mortgage-calculator/mortgage-calculator.component';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [
    AppComponent,
    MortgageCalculatorComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatSelectModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
