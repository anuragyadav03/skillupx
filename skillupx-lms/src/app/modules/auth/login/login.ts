import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../../core/services/common.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-login',
  imports: [CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true
})
export class Login {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private commonService: CommonService, private router: Router, private dialog: MatDialog) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      alert("Please fill form correctly!");
      return;
    }

    const { email, password } = this.loginForm.value;

    this.commonService.validateLogin(email, password).subscribe((result) => {
      console.log(result);
      if (result != null) {
        this.router.navigate(['/dashboard']);
      } else {
        this.openDialog('Wrong Email or Password', 'Please try again.', 'warning');
      }
    });
  }

  openDialog(title: string, subtext: string, type: 'confirm' | 'warning') {
      return this.dialog.open(ConfirmDialogComponent, {
        data: {
          type,
          title,
          heading: type === 'warning' ? 'Warning' : 'Confirmation',
          subtext,
          confirmText: 'OK',
          cancelText: ''
        },
        width: '400px'
      });
    }

}
