import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent  {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  
  // Track whether fields have been touched and interacted with
  isFieldTouched = {
      email: false,
      password: false
  };

  constructor(
      private fb: FormBuilder,
      private authService: AuthService
  ) {
      // Initialize the form with validators
      this.loginForm = this.fb.group({
          email: ['', [
              Validators.required,
              Validators.email,
              // Custom validator for X's email format
              Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
          ]],
          password: ['', [
              Validators.required,
              Validators.minLength(8),
              // Ensure password has at least one number and one letter
              Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
          ]]
      });
  }

  // Helper methods to check field validity
  getErrorMessage(fieldName: 'email' | 'password'): string {
      const control = this.loginForm.get(fieldName);
      if (!control) return '';

      if (control.hasError('required')) {
          return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }

      if (fieldName === 'email') {
          if (control.hasError('email') || control.hasError('pattern')) {
              return 'Please enter a valid email address';
          }
      }

      if (fieldName === 'password') {
          if (control.hasError('minlength')) {
              return 'Password must be at least 8 characters long';
          }
          if (control.hasError('pattern')) {
              return 'Password must contain at least one letter and one number';
          }
      }

      return '';
  }

  // Mark fields as touched when focused
  onFieldFocus(field: 'email' | 'password') {
      this.isFieldTouched[field] = true;
  }

  onSubmit() {
      // Mark all fields as touched to show all validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
          const control = this.loginForm.get(key);
          control?.markAsTouched();
      });

      if (this.loginForm.invalid) {
          return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      try {
          const { email, password } = this.loginForm.value;
          this.authService.login(email, password);
          console.log('Login successful');
      } catch (error) {
          if (error instanceof Error) {
              this.errorMessage = error.message;
          } else {
              this.errorMessage = 'An unexpected error occurred';
          }
      } finally {
          this.isLoading = false;
      }
  }
}