import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environtment';

export interface Course {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  long_description: string;
  instructor_id: number | null;
  price: number;
  currency: string;
  is_published: boolean;
  created_at: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  slug?: string;
  summary?: string;
  order_number?: number;
  duration_seconds?: number;
  created_at: number;
}

export interface Chapter {
  id?: number;
  lesson_id: number;
  chapter_name?: string;
  title: string;
  content_type: 'VIDEO' | 'RESOURCE' | 'TEST';
  video_url?: string | null;
  resource_path?: string | null;
  test_questions?: number;
  timed?: boolean;
  active?: boolean;
}


@Injectable({ providedIn: 'root' })
export class CourseService {
  private apiUrl = environment.apiUrl;


  constructor(private http: HttpClient) {}

  // Courses
  listCourses(limit = 50, offset = 0): Observable<{ courses: Course[] }> {
    return this.http.get<{ courses: Course[] }>(`${this.apiUrl}/courses`);
  }
  getCourse(id: number) {
    return this.http.get<{ course: Course }>(`${this.apiUrl}/courses/${id}`);
  }
  createCourse(payload: Partial<Course>) {
    return this.http.post<{ course: Course }>(`${this.apiUrl}/courses`, payload);
  }
  updateCourse(id: number, patch: Partial<Course>) {
    return this.http.put<{ course: Course }>(`${this.apiUrl}/courses/${id}`, patch);
  }
  deleteCourse(id: number) {
    return this.http.delete<{ course: Course }>(`${this.apiUrl}/courses/${id}`);
  }

  // Lessons
  listLessonsForCourse(courseId: number) {
    return this.http.get<{ lessons: Lesson[] }>(`${this.apiUrl}/lessons/course/${courseId}`);
  }
  createLesson(payload: Partial<Lesson>) {
    return this.http.post<{ lesson: Lesson }>(`${this.apiUrl}/lessons`, payload);
  }
  updateLesson(id: number, patch: Partial<Lesson>) {
    return this.http.put<{ lesson: Lesson }>(`${this.apiUrl}/lessons/${id}`, patch);
  }
  deleteLesson(id: number) {
    return this.http.delete<{ lesson: Lesson }>(`${this.apiUrl}/lessons/${id}`);
  }
  
  getLesson(id: number) {
    return this.http.get(`/api/lessons/${id}`);
  }




  // Chapters
  listChaptersForLesson(lessonId: number) {
    return this.http.get<{ chapters: Chapter[] }>(`${this.apiUrl}/chapters/lesson/${lessonId}`);
  }
  createChapter(payload: Partial<Chapter>) {
    return this.http.post<{ chapter: Chapter }>(`${this.apiUrl}/chapters`, payload);
  }
  updateChapter(id: number, patch: Partial<Chapter>) {
    return this.http.put<{ chapter: Chapter }>(`${this.apiUrl}/chapters/${id}`, patch);
  }
  deleteChapter(id: number | undefined) {
    return this.http.delete<{ chapter: Chapter }>(`${this.apiUrl}/chapters/${id}`);
  }

  getChapter(id: number) {
    return this.http.get(`/api/chapters/${id}`);
  }
}
