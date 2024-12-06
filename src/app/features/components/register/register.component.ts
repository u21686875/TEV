import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  user: User = {
    name: '',
    email: '',
    username: '',
    password: '',
    joinedDate: new Date()
  };

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.register(this.user);
  }
}
