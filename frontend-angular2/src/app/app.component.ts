import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Angular Admin';
  apiBase = 'http://localhost:5000';

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
          this.adminName = me.adminName ?? 'Administrador';
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
      await this.http.post(
        `${this.apiBase}/auth/login-admin`,
        { email: this.email, password: this.password },
        { withCredentials: true }
      ).toPromise();
      // Fetch me
      const me: any = await this.http.get(`${this.apiBase}/session/me`, { withCredentials: true }).toPromise();
      this.adminName = me?.adminName ?? 'Administrador';
      this.view = 'dashboard';
    } catch {
      this.error = 'Credenciales inválidas';
    }
  }

  openUserApp() {
    window.location.href = 'http://localhost:4201';
  }

  async logout() {
    await this.http.post(`${this.apiBase}/auth/logout`, {}, { withCredentials: true }).toPromise();
    this.view = 'login';
    this.email = '';
    this.password = '';
  }
}
