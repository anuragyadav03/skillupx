import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token$ = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  constructor(private http: HttpClient) {}

  login(credentials: {email: string, password: string}) {
    return this.http.post<{token: string}>('/api/auth/login', credentials).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        this.token$.next(res.token);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.token$.next(null);
  }

  getToken() { return this.token$.value; }
  isLoggedIn() { return !!this.getToken(); }
}
