import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GetPaymentDetails, UpdatePaymentDetails } from '../../../shared/action/payment-details.action';
import { PaymentDetailsState } from '../../../shared/state/payment-details.state';
import { PaymentDetails } from '../../../shared/interface/payment-details.interface';

@Component({
  selector: 'app-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.scss']
})
export class BankDetailsComponent {

  @Select(PaymentDetailsState.paymentDetails) paymentDetails$: Observable<PaymentDetails>;
  
  public form: FormGroup;
  public active = 'bank';

  constructor(private store: Store) {
    this.form = new FormGroup({
      bank_account_no: new FormControl('', [Validators.pattern(/^[0-9]+$/)]),
      bank_name: new FormControl('', [Validators.pattern(/^[A-Za-z\s]+$/)]),
      bank_holder_name: new FormControl('', [Validators.pattern(/^[A-Za-z\s]+$/)]),
      swift: new FormControl(),
      ifsc: new FormControl(),
      paypal_email: new FormControl('', [Validators.email]),
    });
  }

  ngOnInit(): void {
    this.store.dispatch(new GetPaymentDetails());
    this.paymentDetails$.subscribe(paymentDetails => {
      this.form.patchValue({
        bank_account_no: paymentDetails?.bank_account_no,
        bank_name: paymentDetails?.bank_name,
        bank_holder_name: paymentDetails?.bank_holder_name,
        swift:paymentDetails?.swift,
        ifsc: paymentDetails?.ifsc,
        paypal_email: paymentDetails?.paypal_email
      })
    });
  }

  submit(){    
    this.form.markAllAsTouched();
    if(this.form.valid){
      this.store.dispatch(new UpdatePaymentDetails(this.form.value))
    }
  }

  // Input restrictions
  allowOnlyDigits(event: KeyboardEvent) {
    const allowedControlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
    if (allowedControlKeys.includes(event.key)) return;
    const isValid = /^[0-9]$/.test(event.key);
    if (!isValid) {
      event.preventDefault();
    }
  }

  allowOnlyAlphabets(event: KeyboardEvent) {
    const allowedControlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
    if (allowedControlKeys.includes(event.key)) return;
    const isValid = /^[A-Za-z\s]$/.test(event.key);
    if (!isValid) {
      event.preventDefault();
    }
  }

  sanitizeDigitsInput(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^0-9]/g, '');
    if (sanitized !== input.value) {
      input.value = sanitized;
      this.form.get(controlName)?.setValue(sanitized, { emitEvent: false });
    }
  }

  sanitizeAlphaInput(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^A-Za-z\s]/g, '');
    if (sanitized !== input.value) {
      input.value = sanitized;
      this.form.get(controlName)?.setValue(sanitized, { emitEvent: false });
    }
  }

}
