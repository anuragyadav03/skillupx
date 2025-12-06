import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonService } from '../../core/services/common.service';
import { Router } from '@angular/router';
import { CommonModule, JsonPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  imgurl = 'https://uploads.dailydot.com/2023/12/crying-cat-meme.jpg?auto=compress&fm=pjpg';
  userProfile?: UserInfo;
  username: string = '';
  profileForm: FormGroup;
  editing: boolean = false;
  loading: boolean = false;

  constructor(
    private commonService: CommonService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.profileForm = this.fb.group({
      profile: [''],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    const fallbackUsername = localStorage.getItem('username') || '';
    this.commonService.$username.subscribe((msg) => {
      this.username = msg || fallbackUsername;
      this.loadUserProfile();
    });
    this.profileForm.get('email')?.disable();
  }

  private loadUserProfile() {
    this.loading = true;
    this.commonService.getProfile(this.username).then((profile) => {
      this.userProfile = profile;
      if (profile) {
        this.profileForm.patchValue({
          email: profile.email,
        });
      }
      this.loading = false;
      this.cdr.markForCheck();
    }).catch(() => {
      this.loading = false;
    });
  }

  setEditing() {
    this.editing = !this.editing;
    if (this.editing) {
      this.profileForm.patchValue({
        email: this.userProfile?.email || ''
      });
    } else {
      this.profileForm.reset();
    }
  }

updateProfile() {
  if (this.profileForm.invalid) {
    this.openDialog('Invalid Input', 'Please correct the highlighted fields.', 'warning');
    return;
  }

  const updatedData = this.profileForm.value;

  this.commonService.updateProfile({...updatedData, originalUsername:this.username}).then((message) => {
    this.commonService.$username.next(updatedData.username);
    this.openDialog('Update Successful', message, 'confirm');
    this.editing = false;
    this.loadUserProfile();
  }).catch((err) => {
    this.openDialog('Update Failed', 'Username may be taken or image url is bad', 'warning');
  });
}
openDialog(title: string, subtext: string, type: 'confirm' | 'warning' = 'confirm') {
  return this.dialog.open(ConfirmDialogComponent, {
    width: '400px',
    data: {
      type,
      title,
      heading: type === 'warning' ? 'Warning' : 'Confirmation',
      subtext,
      confirmText: 'OK',
      cancelText: ''
    }
  });
}


  goBack() {
    this.editing = false;
    this.profileForm.reset();
  }
}
