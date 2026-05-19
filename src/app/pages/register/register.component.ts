import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  username = '';
  password = '';
  loading = signal(false);
  error = signal('');
  success = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.error.set('Please fill in all fields.');
      return;
    }
    this.error.set('');
    this.loading.set(true);
    this.auth.register({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.error.set('That username is already taken. Please choose another.');
        } else {
          this.error.set('Something went wrong. Please try again later.');
        }
      },
    });
  }
}
