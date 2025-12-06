import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { CommonService } from '../../core/services/common.service';

@Component({
  selector: 'app-header',
  standalone: true, // <- important
  imports: [CommonModule, MatMenuModule, MatIconModule, MatToolbarModule, MatDividerModule, RouterModule, MatButtonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'], // <- fixed
})
export class Header {
  @Output() toggleSidenav = new EventEmitter<boolean>();
  isMenuOpen = false;
  isLoggedIn = true;

  constructor(private commonService: CommonService, private router: Router) {}

  ngOnInit() {
    this.commonService.$isLoggedIn.subscribe(status => {
      this.isLoggedIn = status;
    });
    console.log('header loggedIn:', this.isLoggedIn);
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  getMenuSelection(selection: string) {
    switch (selection) {
      case 'logout':
        this.commonService.logout();
        this.router.navigate(['/login']);
        break;
      case 'profile':
        this.router.navigate(['/profile']);
        break;
      default:
        break;
    }
  }

  navigate(route: string) {
    console.log('navigate called with', route);
    switch (route) {
      case 'dashboard':
        this.router.navigateByUrl('/dashboard');
        break;
      case 'courses':
        this.router.navigateByUrl('/courses');
        break;
      case 'instructors':
        this.router.navigateByUrl('/instructors');
        break;
      case 'sales':
        this.router.navigateByUrl('/sales');
        break;
      case 'enrollments':
        this.router.navigateByUrl('/enrollments');
        break;
      case 'logout':
        this.commonService.logout();
        this.router.navigateByUrl('/login');
        break;
      default:
        console.warn('unknown route', route);
    }
  }
}
