import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend-angular1';
  apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : '/api';
  me: { authenticated: boolean; role: 'user' | 'admin'; userName?: string; adminName?: string } | null = null;
  error: string | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get(`${this.apiBase}/session/me`, { withCredentials: true }).subscribe({
      next: (data: any) => {
        this.me = data;
      },
      error: () => {
        this.error = 'Not authenticated. Go to Home.';
      }
    });
  }

  goHome() {
    window.location.href = 'http://localhost:3000/home';
  }

  backToAdmin() {
    window.location.href = 'http://localhost:4202';
  }
}

