import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonService } from '../../core/services/common.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatProgressBarModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  ongoingCourses: any;
  userInfo!: UserInfo;

  constructor(private commonService: CommonService) {
    this.commonService.getUserInfo().subscribe(res => {
      this.userInfo = res;
    })

    this.commonService.getUserEnrollments(this.userInfo.email)
  .subscribe({
    next: (enrollments) => {
      console.log("User enrollments:", enrollments);
    },
    error: (err) => console.error(err)
  });

  }

  ngOnInit() {

  }

  continueCourse(course: any) {
    console.log('Continue course:', course.title);
    // router.navigate(...)
  }

}
