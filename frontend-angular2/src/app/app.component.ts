import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Angular Admin';
  apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : '/api';

  email = '';
  password = '';
  error: string | null = null;
  adminName: string | null = null;
  view: 'login' | 'dashboard' = 'login';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get(`${this.apiBase}/session/me`, { withCredentials: true }).subscribe({
      next: (me: any) => {
        if (me?.role === 'admin') {
          this.adminName = me.adminName ?? 'Admin';
          this.view = 'dashboard';
        }
      },
      error: () => { this.view = 'login'; }
    });
  }

  async login(e: Event) {
    e.preventDefault();
    this.error = null;
    try {
      await firstValueFrom(this.http.post(
        `${this.apiBase}/auth/login-admin`,
        { email: this.email, password: this.password },
        { withCredentials: true }
      ));
      // Fetch me
      const me: any = await firstValueFrom(this.http.get(`${this.apiBase}/session/me`, { withCredentials: true }));
      this.adminName = me?.adminName ?? 'Admin';
      this.view = 'dashboard';
    } catch {
      this.error = 'Credenciales inválidas';
    }
  }

  openUserApp() {
    const isLocal = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    window.location.href = isLocal ? 'http://localhost:4201' : '/user';
  }

  openNextApp() {
    const isLocal = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    window.location.href = isLocal ? 'http://localhost:3000/home' : '/home';
  }

  async logout() {
    await firstValueFrom(this.http.post(`${this.apiBase}/auth/logout`, {}, { withCredentials: true }));
    this.view = 'login';
    this.email = '';
    this.password = '';
  }
}
