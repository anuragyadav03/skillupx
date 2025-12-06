import { Routes } from '@angular/router';
import { Register } from './modules/auth/register/register';
import { Enrollments } from './modules/enrollments/enrollments';
import { AddEditEnrollment } from './modules/enrollments/add-edit-enrollment/add-edit-enrollment';
import { AddLesson } from './modules/courses/add-lesson/add-lesson';
import { CourseDetail } from './modules/courses/course-detail/course-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login/login').then(m => m.Login)
  },
  { path: 'register', component: Register },
  {
    path: 'sales',
    loadComponent: () =>
      import('./modules/sales/sales').then(m => m.Sales)
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./modules/courses/courses').then(m => m.CoursesComponent)
  },

  {
    path: 'courses/new',
    loadComponent: () =>
      import('./modules/courses/add-edit-course/add-edit-course')
        .then(m => m.AddEditCourse)
  },

  {
    path: 'courses/:id/edit',
    loadComponent: () =>
      import('./modules/courses/add-edit-course/add-edit-course')
        .then(m => m.AddEditCourse)
  },

  {
    path: 'courses/:courseId',
    component: CourseDetail
  },
  { path: 'courses/:courseId/lesson/new', component: AddLesson },      // new add-lesson page

  {
    path: 'courses/:courseId/lessons/:lessonId/chapter/new',
    loadComponent: () =>
      import('./modules/courses/add-chapter/add-chapter').then(m => m.AddChapter)
  },
  {
    path: 'courses/:courseId/lessons/:lessonId/chapter/:chapterId/edit',
    loadComponent: () =>
      import('./modules/courses/add-chapter/add-chapter').then(m => m.AddChapter)
  },


  {
    path: 'instructors',
    loadComponent: () =>
      import('./modules/instructors/instructors')
        .then(m => m.Instructors)
  },

  {
    path: 'instructors/new',
    loadComponent: () =>
      import('./modules/instructors/add-edit-instructor/add-edit-instructor')
        .then(m => m.AddEditInstructor)
  },

  {
    path: 'instructors/:id/edit',
    loadComponent: () =>
      import('./modules/instructors/add-edit-instructor/add-edit-instructor')
        .then(m => m.AddEditInstructor)
  },
  { path: 'enrollments', component: Enrollments },
  { path: 'enrollments/new', component: AddEditEnrollment },
  { path: 'enrollments/:id/edit', component: AddEditEnrollment },

];
