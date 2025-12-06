import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Course, CourseService } from './services/course-service';
import { FormsModule } from '@angular/forms';
import { R } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './courses.html',
  styleUrls: ['./courses.scss']
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  loading = signal(false);
  limit = 50;
  offset = 0;

  constructor(private courseService: CourseService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.courseService.listCourses(this.limit, this.offset).subscribe(res => {
      console.log(res);
      this.loading.set(false);
      this.courses = res.courses;
      this.cdr.detectChanges();
    });
  }

  addCourse() {
    this.router.navigate(['/courses/new']);
  }

  edit(course: Course) {
    this.router.navigate(['/courses', course.id, 'edit']);
  }

  view(course: Course) {
    console.log(course);
    this.router.navigate(['/courses', course.id]);
  }

  deleteCourse(course: Course) {
    if (!confirm(`Delete course "${course.title}" ?`)) return;
    this.courseService.deleteCourse(course.id!).subscribe({
      next: () => this.load(),
      error: (err) => console.error(err)
    });
  }
}
