import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstructorService } from '../services/instructor-service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-instructor-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,],
  templateUrl: './add-edit-instructor.html',
  styleUrls: ['./add-edit-instructor.scss']
})
export class AddEditInstructor implements OnInit {
  form!: FormGroup;
  id?: number;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private svc: InstructorService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      contact_email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]],
      password: [''],                 // required for create only
      bio: [''],                      // optional field mapped to DB
      avatar_url: ['']                // optional field mapped to DB
    });

    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'new') {
      this.id = Number(id);
      this.loadInstructor(this.id);
    } else {
      // new instructor => password required
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  loadInstructor(id: number) {
    this.loading = true;

    this.svc.get(id).subscribe({
      next: (res) => {
        const instr = res.instructor;

        this.form.patchValue({
          name: instr.name,
          contact_email: instr.contact_email,
          phone: instr.metadata?.phone || '',
          bio: instr.bio || '',
          avatar_url: instr.avatar_url || ''
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load instructor', err);
        this.loading = false;
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    const raw = this.form.value;

    // Build final payload matching DB structure
    const payload: any = {
      name: raw.name,
      contact_email: raw.contact_email,
      bio: raw.bio || null,
      avatar_url: raw.avatar_url || null,
      metadata: {
        phone: raw.phone || null
      }
    };

    // Handle password rules
    if (!this.id) {
      // New instructor → password required
      payload.password = raw.password;
    } else if (raw.password && raw.password.trim().length > 0) {
      // Editing and password changed → include
      payload.password = raw.password;
    }

    const req = this.id
      ? this.svc.update(this.id, payload)
      : this.svc.create(payload);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/instructors']);
      },
      error: (err) => {
        console.error('Save instructor failed', err);
        this.saving = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/instructors']);
  }

  // Template getters
  get name() { return this.form.get('name'); }
  get contact_email() { return this.form.get('contact_email'); }
  get phone() { return this.form.get('phone'); }
  get password() { return this.form.get('password'); }
  get bio() { return this.form.get('bio'); }
  get avatar_url() { return this.form.get('avatar_url'); }
}
