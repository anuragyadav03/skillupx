import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LoadingScreen } from "../loading-screen/loading-screen";

@Component({
  selector: 'app-lead-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule, LoadingScreen],
  templateUrl: './lead-modal.html',
  styleUrl: './lead-modal.scss',
})
export class LeadModal {
  constructor(private http: HttpClient) {}

  loading = signal(false);
  visible = signal(false);
  success = signal(false);

  name = signal('');
  email = signal('');
  phone = signal('');
  subjects = signal<string[]>([]);

  // SkillupX subjects (You can expand anytime)
  availableSubjects = [
    'Python',
    'AWS',
    'DevOps',
    'MERN',
    'MEAN',
    'Linux',
    'Cloud Computing',
    'Data Structures'
  ];

  @Output() submitted = new EventEmitter<any>();

  open() {
    this.visible.set(true);
  }

  close() {
    this.visible.set(false);
  }

  toggleSubject(subject: string) {
    const selected = this.subjects();
    if (selected.includes(subject)) {
      this.subjects.set(selected.filter(s => s !== subject));
    } else {
      this.subjects.set([...selected, subject]);
    }
  }

  submit() {
    this.loading.set(true);
    const payload = {
      name: this.name(),
      email: this.email(),
      phone: this.phone(),
      subjects: this.subjects().join(', ') || 'None',
      source: 'Website Lead'
    };

    // this.http.post('https://skillupx-makeshift-server.vercel.app/lead', payload).subscribe({
    this.http.post('http://localhost:4000/lead', payload).subscribe({
      next: () => {
        console.log('Lead Saved:', payload);

        this.submitted.emit(payload);

        this.name.set('');
        this.email.set('');
        this.phone.set('');
        this.subjects.set([]);

        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.close(), 3000);
      },
      error: (err) => {
        console.error('Lead Save Failed:', err);
        alert('Something went wrong while saving lead.');
      }
    });
  }
}
