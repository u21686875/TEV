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

  constructor(private authService: AuthService) {

  }

  // For now we are just logging the attempt, we will add real authentication later
  onSubmit() {
    console.log("Login Attempt: ", this.loginData);
    this.authService.login(this.loginData.email, this.loginData.password);
  }
}
