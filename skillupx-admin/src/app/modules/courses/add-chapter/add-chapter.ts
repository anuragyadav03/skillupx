import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { CourseService } from '../services/course-service';

@Component({
  selector: 'app-add-chapter',
  standalone: true,
  templateUrl: './add-chapter.html',
  styleUrls: ['./add-chapter.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule
  ]
})
export class AddChapter {

  form!: FormGroup;
  saving = false;

  courseId!: number;
  lessonId!: number;
  chapterId?: number;

  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private cs: CourseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {

    this.form = this.fb.group({
      chapter_name: [''],
      title: ['', Validators.required],
      content_type: ['VIDEO', Validators.required],

      video_url: [''],
      resource_path: [''],
      test_questions: [0],

      timed: [false],
      active: [true]
    });

    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    this.lessonId = Number(this.route.snapshot.paramMap.get('lessonId'));
    this.chapterId = Number(this.route.snapshot.paramMap.get('chapterId'));

    if (this.chapterId) {
      this.isEdit = true;
      this.loadChapter();
    }
  }

  onTypeChange() {
    const type = this.form.value.content_type;

    if (type === 'VIDEO') {
      this.form.patchValue({
        resource_path: null,
        test_questions: 0
      });
    }

    if (type === 'RESOURCE') {
      this.form.patchValue({
        video_url: null,
        test_questions: 0
      });
    }

    if (type === 'TEST') {
      this.form.patchValue({
        video_url: null,
        resource_path: null
      });
    }
  }

  loadChapter() {
    this.cs.getChapter(this.chapterId!).subscribe({
      next: (res: any) => {
        this.form.patchValue(res.chapter);
      },
      error: () => alert('Failed to load chapter')
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    const payload = {
      ...this.form.value,
      lesson_id: this.lessonId
    };

    const req$ = this.isEdit
      ? this.cs.updateChapter(this.chapterId!, payload)
      : this.cs.createChapter(payload);

    req$.subscribe({
      next: () => {
        this.router.navigate(['/courses', this.courseId], {
          queryParams: { refresh: '1' }
        });
      },
      error: () => {
        alert('Failed to save chapter');
        this.saving = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/courses', this.courseId]);
  }
}
