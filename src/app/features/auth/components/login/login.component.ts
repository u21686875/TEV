import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginData = {
    email : '',
    password: ''
  }

  // Properties to manage error states
  errorMessage : string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService) {}

  // For now we are just logging the attempt, we will add real authentication later
  onSubmit() {
    // Reset error message at the start of each attempt
    this.errorMessage = '';

    // Basic validation
    if(!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    // Show loading state
    this.isLoading = true;

    // login attempt simulation
    try{
      if(this.loginData.email === 'test@error.com') {
        throw new Error('Invalid credentials');
      }

      this.authService.login(this.loginData.email, this.loginData.password);
      console.log('Login successful');
    } catch (error) {
      if(error instanceof Error) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = 'An unexpected error occurred';
      }
    } finally {
      this.isLoading = false;
    }
  }
}
