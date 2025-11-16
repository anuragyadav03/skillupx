import { Component, ViewChild } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LeadModal } from '../../shared/lead-modal/lead-modal';

@Component({
  selector: 'app-landing',
  imports: [LeadModal],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  @ViewChild(LeadModal) modal!: LeadModal;


  constructor(private title: Title, private meta: Meta) {}

  ngOnInit(): void {
    this.title.setTitle('SkillupX | 1-on-1 Mentorship & Mini Batches for Python, AWS, DevOps & Full-Stack');
    this.meta.addTags([
      { name: 'description', content: 'SkillupX offers 1-on-1 mentorship and 5-student mini batches for Python, AWS, DevOps, MERN & MEAN full-stack development with resources, LMS, slides, videos, notes, and real projects.' },
      { name: 'keywords', content: 'SkillupX, Python course, AWS training, DevOps course, MERN full stack, MEAN developer, one-on-one mentorship, mini batch learning' },
      { name: 'robots', content: 'index, follow' }
    ]);
  }


  openLeadModal() {
    console.log("heheh")
    this.modal.open();
  }

  submitLead(data: any) {
    console.log('Lead submitted: ', data);
    // call API here:
    // this.http.post('/api/lead', data).subscribe(...)
  }
}
