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
  showPassword: boolean = false;
  passwordStrength: number = 0;
  
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
      // check localStorage for any previously saved preference
      const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
      const savedEmail = savedRememberMe ? localStorage.getItem('userEmail') : '';

      this.loginForm = this.fb.group({
          email: [savedEmail, [
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
          ]],
          rememberMe: [savedRememberMe] // Initialize with saved preference
      });

      // Monitor password changes for strength indicator
      this.loginForm.get('password')?.valueChanges.subscribe(password => {
        this.updatePasswordStrength(password);
      })

      // Listen for changes to remember me checkbox
      this.loginForm.get('rememberMe')?.valueChanges.subscribe(checked => {
        if(!checked) {
          // if unchecked, clear stored credentials
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('userEmail');
        }
      });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  updatePasswordStrength(password : string): void {
    let strength = 0;

    if(!password) {
      this.passwordStrength = 0;
      return;
    }

    // Increment strength for each criteria met
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    this.passwordStrength = strength;
  }

  getPasswordStrengthColor(): string {
    if (this.passwordStrength <= 25) return '#ff4444';
    if (this.passwordStrength <= 50) return '#ffbb33';
    if (this.passwordStrength <= 75) return '#00C851';
    return '#007E33';
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
    if(this.loginForm.invalid) {
      // Mark all fields as touched to show all validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
          const control = this.loginForm.get(key);
          control?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
        const { email, password, rememberMe } = this.loginForm.value;

        // Store preferences if remember me is checked
        if(rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userEmail', email);
        } else {
          // Clear stored preferences if not checked
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('userEmail');
        }
        
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