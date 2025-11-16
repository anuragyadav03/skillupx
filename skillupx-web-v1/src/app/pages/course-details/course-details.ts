import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-course-details',
  imports: [],
  templateUrl: './course-details.html',
  styleUrl: './course-details.scss',
})
export class CourseDetails {
  constructor(private meta: Meta, private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle("SkillupX | Course Details – Python, AWS, DevOps & Full-Stack");
    this.meta.updateTag({
      name: 'description',
      content: 'Learn everything about SkillupX courses including Python, AWS, DevOps, MERN & MEAN full-stack development with 1-on-1 mentorship.'
    });
  }
}
