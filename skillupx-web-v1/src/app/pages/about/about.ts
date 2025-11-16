import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  constructor(private meta: Meta, private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle("SkillupX | About Us – Our Vision & Mission");
    this.meta.updateTag({
      name: 'description',
      content: 'SkillupX is dedicated to providing personalized 1-on-1 mentorship and industry-level training.'
    });
  }
}
