import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule} from '@angular/material/button';
import { MatInputModule} from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule} from '@angular/material/select';
import { MatTableModule } from '@angular/material/table'

import { AppComponent } from './app.component';
import { MortgageCalculatorComponent } from './features/mortgage-calculator/mortgage-calculator.component';
import { MatRippleModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    MortgageCalculatorComponent,
  ],
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
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
