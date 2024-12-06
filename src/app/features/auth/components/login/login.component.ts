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

  loginMethods = ['email','phone','username'] as const;
  currentLoginMethod: typeof this.loginMethods[number] = 'email';

  captchaText: string = '';
  userCaptchaInput: string = '';
  showCaptcha: boolean = false;
  failedAttempts: number = 0;

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

      if(savedEmail) {
        this.currentLoginMethod = 'email';
        this.updateValidators();
      }
  }

  switchLoginMethod(method: typeof this.loginMethods[number]) {
    this.currentLoginMethod = method;
    this.updateValidators();
    
    // Clear the field when switching methods
    this.loginForm.get('loginIdentifier')?.setValue('');
    this.loginForm.get('loginIdentifier')?.markAsUntouched();
    this.errorMessage = '';
  }

private updateValidators() {
  const control = this.loginForm.get('loginIdentifier');
  if (!control) return;

  switch (this.currentLoginMethod) {
      case 'email':
          control.setValidators([
              Validators.required,
              Validators.email,
              Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
          ]);
          break;
      case 'phone':
          control.setValidators([
              Validators.required,
              // Basic phone validation - you might want to adjust this
              Validators.pattern(/^\+?[1-9]\d{1,14}$/)
          ]);
          break;
      case 'username':
          control.setValidators([
              Validators.required,
              // Username validation - adjust pattern as needed
              Validators.pattern(/^[A-Za-z0-9_]{4,15}$/)
          ]);
          break;
  }
  control.updateValueAndValidity();
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
  getErrorMessage(fieldName: 'loginIdentifier' | 'password'): string {
      const control = this.loginForm.get(fieldName);
      if (!control) return '';

      if (control.hasError('required')) {
          return `${this.getFieldLabel()} is required`;
      }

      if (fieldName === 'loginIdentifier') {
        if (this.currentLoginMethod === 'email' && 
            (control.hasError('email') || control.hasError('pattern'))) {
            return 'Please enter a valid email address';
        }
        if (this.currentLoginMethod === 'phone' && control.hasError('pattern')) {
            return 'Please enter a valid phone number';
        }
        if (this.currentLoginMethod === 'username' && control.hasError('pattern')) {
            return 'Username must be 4-15 characters and can only contain letters, numbers, and underscores';
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

  private getFieldLabel(): string {
    switch(this.currentLoginMethod) {
      case 'email': return 'Email';
      case 'phone': return 'Phone number';
      case 'username': return 'Username';
      default: return 'Login identifier';
    }
  }

  // Mark fields as touched when focused
  onFieldFocus(field: 'loginIdentifier' | 'password') {
    if (field === 'loginIdentifier') {
        this.isFieldTouched.email = true; // Reusing existing property
    } else {
        this.isFieldTouched.password = true;
    }
}

  private generateCaptcha() {
    // Simple CAPTCHA: 6 random letters/numbers
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    this.captchaText = Array(6)
      .fill(null)
      .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
      .join('');
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

    if(this.failedAttempts >= 2) {
      if(!this.showCaptcha) {
        this.showCaptcha = true;
        this.generateCaptcha();
        return;
      }

      // Verify CAPTCHA
      if(this.userCaptchaInput !== this.captchaText) {
        this.errorMessage = 'Incorrect CAPTCHA. Please try again.';
        this.generateCaptcha();
        this.userCaptchaInput = '';
        return;
      }
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