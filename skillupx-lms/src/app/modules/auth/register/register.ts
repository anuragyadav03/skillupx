import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../../core/services/common.service';// ✅ Update path as needed
import { MatDialog } from '@angular/material/dialog';

import {
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import {
  MatFormFieldModule
} from '@angular/material/form-field';
import {
  MatInputModule
} from '@angular/material/input';
import {
  MatButtonModule
} from '@angular/material/button';
import {
  MatCardModule
} from '@angular/material/card';
import {
  MatIconModule
} from '@angular/material/icon';
import {
  RouterModule
} from '@angular/router';
import {
  CommonModule
} from '@angular/common';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm: FormGroup;
  errorMsg: string = '';
  successMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private commonService: CommonService,
    private dialog: MatDialog
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      phone: [''],
    });
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      this.openDialog('Invalid Input', 'Please fill all required fields correctly.', 'warning');
      return;
    }

    const { name, email, password, phone } = this.registerForm.value;

    this.commonService.validateSignUp(name, email, password, phone).subscribe(res => {
      if (res?.user) {
        this.openDialog('Success', 'Registration successful!', 'confirm')
          .afterClosed()
          .subscribe(() => this.router.navigate(['/login']));
      } else {
        this.openDialog('Registration Failed', 'Please try again.', 'warning');
      }
    })
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
