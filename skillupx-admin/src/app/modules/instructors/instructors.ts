import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { InstructorService, Instructor } from './services/instructor-service';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-instructors',
  standalone: true,
  templateUrl: './instructors.html',
  styleUrls: ['./instructors.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule
  ]
})
export class Instructors implements OnInit {
  instructors: Instructor[] = [];
  displayedColumns: string[] = ['name', 'email', 'created_at', 'actions'];

  constructor(
    private instructorService: InstructorService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.instructorService.getAllInstructors().subscribe(res => {
      this.instructors = res.instructors;

      // 👇 IMPORTANT: update UI manually since Zone.js is disabled
      this.cdr.detectChanges();
    });
  }

  add() {
    this.router.navigate(['/instructors/new']);
  }

  edit(i: Instructor) {
    this.router.navigate(['/instructors', i.id, 'edit']);
  }
}
