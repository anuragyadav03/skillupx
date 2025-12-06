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
  imports: [CommonModule, MatMenuModule, MatIconModule, MatToolbarModule, MatDividerModule, RouterModule, MatButtonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Output() toggleSidenav = new EventEmitter<boolean>();
  isMenuOpen = false;
  isLoggedIn: boolean = true;


  constructor(private commonService: CommonService, private router: Router) {
  }

  ngOnInit() {
    this.commonService.$isLoggedIn.subscribe(status => {
      this.isLoggedIn = status;
    });

    console.log(this.isLoggedIn);
  }

  redirectToLogin() {
    this.router.navigate(['/login'])
  }

  getMenuSelection(selection: string) {
    switch (selection) {
      case 'logout': {
        this.commonService.logout()
        this.router.navigate(['/login']);
        break;
      }
      case 'profile': {
        this.router.navigate(['/profile']);
        break;
      }
      default: break;
    }
  }

  navigate(route: string) {
    switch (route) {
      case 'dashboard':
        this.router.navigate(['/dashboard']);
        break;
      case 'peers':
        this.router.navigate(['/peer-zone']);
        break;
      case 'courses':
        this.router.navigate(['/courses']);
        break;
      case 'profile':
        this.router.navigate(['/profile']);
        break;
      case 'logout':
        break;
    }
  }

}
