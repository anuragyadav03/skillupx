import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  constructor(private meta: Meta, private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle("SkillupX | Contact Us – Book Demo & Ask Queries");
    this.meta.updateTag({
      name: 'description',
      content: 'Contact SkillupX for demo classes, training information, one-on-one mentorship and career guidance.'
    });
  }
}
