import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environtment';

export interface Instructor {
  id?: number;
  user_id?: number | null;
  name: string;
  bio?: string;
  avatar_url?: string;
  contact_email?: string;
  metadata?: any;
  created_at? :any;
}

@Injectable({ providedIn: 'root' })
export class InstructorService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllInstructors(limit = 50, offset = 0): Observable<{ instructors: Instructor[] }> {
    return this.http.get<{ instructors: Instructor[] }>(`${this.apiUrl}/instructors`);
  }

  get(id: number) {
    return this.http.get<{ instructor: Instructor }>(`${this.apiUrl}/instructors/${id}`);
  }

  create(payload: Partial<Instructor>) {
    return this.http.post<{ instructor: Instructor }>(`${this.apiUrl}/instructors`, payload);
  }

  update(id: number, patch: Partial<Instructor>) {
    return this.http.put<{ instructor: Instructor }>(`${this.apiUrl}/instructors/${id}`, patch);
  }
}
