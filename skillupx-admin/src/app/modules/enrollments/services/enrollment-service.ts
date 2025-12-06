import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environtment';

export interface EnrollmentApiResponse {
  enrollments: Enrollment[];
}

export interface Enrollment {
  id: number;
  course_id: number;
  instructor_id: number | null;
  student_id: number;
  enrolled_at: string;                // ISO datetime
  enrollment_duration: EnrollmentDuration;
  enrollment_type: string;
  metadata: any | null;
  created_at: string;                 // ISO datetime
  updated_at: string;                 // ISO datetime
  student_name: string;
  student_email: string | null;
  student_phone: string | null;
  course_title: string;
  instructor_name: string | null;
}

export interface EnrollmentDuration {
  days?: number;
  weeks?: number;
  months?: number;
  [key: string]: number | undefined;
}


@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  list(limit = 50, offset = 0) {
    return this.http.get<{ enrollments: any[] }>(`${this.apiUrl}/enrollments?limit=${limit}&offset=${offset}`);
  }

  get(id: number) {
    return this.http.get<{ enrollment: Enrollment }>(`${this.apiUrl}/enrollments${id}`);
  }

  create(payload: Partial<Enrollment & { student_email?:string, student_phone?:string, student_name?:string }>) {
    return this.http.post<{ enrollment: Enrollment }>(`${this.apiUrl}/enrollments`, payload);
  }

  update(id: number, patch: Partial<Enrollment>) {
    return this.http.put<{ enrollment: Enrollment }>(`${this.apiUrl}/enrollments${id}`, patch);
  }

  delete(id: number) {
    return this.http.delete<{ enrollment: Enrollment }>(`${this.apiUrl}/enrollments${id}`);
  }

  searchUser(q: string) {
    return this.http.get<{ users: any[] }>(`${this.apiUrl}/search/user?q=${encodeURIComponent(q)}`);
  }
}
