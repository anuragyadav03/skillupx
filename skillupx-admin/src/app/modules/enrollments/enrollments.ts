import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnrollmentService } from './services/enrollment-service';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-enrollments',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTableModule, MatButtonModule, MatIcon],
  templateUrl: './enrollments.html',
  styleUrls: ['./enrollments.scss']
})
export class Enrollments implements OnInit {
  enrollments: any[] = [];
  loading = false;
  limit = 50;
  offset = 0;
  displayedColumns = ['student', 'email', 'course', 'instructor', 'type', 'enrolled', 'actions'];


  constructor(private enrollmentService: EnrollmentService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.enrollmentService.list(this.limit, this.offset).subscribe({
      next: r => { 
        console.log(r)
        this.enrollments = r.enrollments; 
        this.loading = false; 
        this.cdr.detectChanges()
      },
      error: e => { console.error(e); this.loading = false; }
    });
  }

  add() {
    this.router.navigate(['/enrollments/new']);
  }

  delete(e: any) {
    if (!confirm('Delete enrollment?')) return;
    this.enrollmentService.delete(e.id).subscribe({ next: () => this.load(), error: console.error });
  }

  view(e: any) {
    this.router.navigate(['/enrollments', e.id]);
  }
}
