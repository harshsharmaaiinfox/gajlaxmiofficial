import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss'],
  imports: [CommonModule, ReactiveFormsModule] // Ensure ReactiveFormsModule is imported
})
export class ContactUsComponent {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      query: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  submitForm() {
    console.log("Submit button clicked"); // Debugging line
    if (this.contactForm.valid) {
      console.log('Form Submitted Successfully:', this.contactForm.value);
      alert("Form submitted successfully!");
      this.contactForm.reset(); // Reset the form after successful submission
    } else {
      console.log("Form validation failed", this.contactForm.errors);
      this.contactForm.markAllAsTouched(); // Highlights errors
    }
  }
}
