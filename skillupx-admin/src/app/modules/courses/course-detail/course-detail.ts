import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService, Course, Lesson, Chapter } from '../services/course-service';
import { Subject, switchMap, takeUntil } from 'rxjs';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './course-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseDetail implements OnInit, OnDestroy {
  course?: Course;
  lessons: Lesson[] = [];
  selectedLessonChapters: Record<number, Chapter[]> = {};

  loading = false;

  displayedColumns = ['lessonId', 'title', 'duration', 'created', 'actions'];
  chapterColumns = [
  'order',
  'title',
  'contentType',
  'active',
  'created',
  'updated',
  'testQuestions',
  'chActions'
];


  // keep multiple expanded
  expandedLessonIds = new Set<number>();

  // used by matRowDef "when"
  isExpanded = (index: number, row: Lesson) => {
    return !!row.id && this.expandedLessonIds.has(row.id);
  };

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private courseServce: CourseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((pm) => {
          const id = Number(pm.get('courseId'));
          this.loading = true;
          this.cdr.markForCheck();
          return this.courseServce.getCourse(id);
        }),
        switchMap((courseRes) => {
          this.course = courseRes.course;
          this.cdr.markForCheck();
          return this.courseServce.listLessonsForCourse(this.course!.id);
        })
      )
      .subscribe({
        next: (lr) => {
          this.lessons = lr.lessons;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  // 🔑 MAIN FIX: reassign Set AND lessons array
  toggleLesson(lesson: Lesson, event?: MouseEvent) {
    event?.stopPropagation();
    if (!lesson.id) return;

    // work on a new Set instance for OnPush friendliness
    const nextSet = new Set(this.expandedLessonIds);

    if (nextSet.has(lesson.id)) {
      nextSet.delete(lesson.id);
    } else {
      nextSet.add(lesson.id);
      // load chapters lazily when expanding for first time
      console.log(this.selectedLessonChapters)
      if (!this.selectedLessonChapters[lesson.id]) {
        this.loadChaptersForLesson(lesson.id);
      }
    }

    this.expandedLessonIds = nextSet;

    // 🔥 IMPORTANT: new array reference → MatTable recalculates rows
    this.lessons = [...this.lessons];

    this.cdr.markForCheck();
  }

  loadChaptersForLesson(lessonId: number) {
    this.courseServce.listChaptersForLesson(lessonId).subscribe({
      next: (res) => {
        // new object ref for OnPush
        this.selectedLessonChapters = {
          ...this.selectedLessonChapters,
          [lessonId]: [...res.chapters],
        };
        this.cdr.markForCheck();
      },
      error: (err) => console.error(err),
    });
  }

  openAddLesson() {
    if (!this.course) return;
    this.router.navigate(['/courses', this.course.id, 'lessons', 'new']);
  }

  deleteLesson(l: Lesson, event?: MouseEvent) {
    event?.stopPropagation();
    if (!l.id) return;

    if (!confirm(`Delete lesson "${l.title}"?`)) return;

    this.courseServce.deleteLesson(l.id).subscribe(() => {
      this.lessons = this.lessons.filter((x) => x.id !== l.id);

      const nextSet = new Set(this.expandedLessonIds);
      nextSet.delete(l.id);
      this.expandedLessonIds = nextSet;

      const { [l.id]: _removed, ...rest } = this.selectedLessonChapters;
      this.selectedLessonChapters = rest;

      this.cdr.detectChanges();
    });
  }

  goToAddChapter(lesson: Lesson, event?: MouseEvent) {
    event?.stopPropagation();
    this.router.navigate(['/courses', this.course!.id, 'lessons', lesson.id, 'chapter', 'new']);
  }

  goToEditChapter(ch: Chapter, lesson: Lesson, event?: MouseEvent) {
    event?.stopPropagation();
    this.router.navigate([
      '/courses',
      this.course!.id,
      'lessons',
      lesson.id,
      'chapter',
      ch.id,
      'edit',
    ]);
  }

  deleteChapter(ch: Chapter, event?: MouseEvent) {
    event?.stopPropagation();
    if (!ch.id) return;

    if (!confirm(`Delete chapter "${ch.title}"?`)) return;

    this.courseServce.deleteChapter(ch.id).subscribe(() => {
      const list = this.selectedLessonChapters[ch.lesson_id] || [];
      this.selectedLessonChapters = {
        ...this.selectedLessonChapters,
        [ch.lesson_id]: list.filter((x) => x.id !== ch.id),
      };
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
