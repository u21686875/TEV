import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RegisterComponent } from '../../components/register/register.component';
import { LoginComponent } from '../../components/login/login.component';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, MatDialogModule],
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  constructor(private dialog: MatDialog) {}

  openRegisterDialog(): void {
    this.dialog.open(RegisterComponent, {
      width: '600px',
      maxWidth: '100vw',
      panelClass: ['bg-black', 'text-white'],
      disableClose: false
    });
  }

  openLoginDialog(): void {
    this.dialog.open(LoginComponent, {
      width: '600px',
      maxWidth: '100vw',
      panelClass: ['bg-black', 'text-white'],
      disableClose: false
    });
  }
}
