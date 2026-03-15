import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzInputModule,
    NzButtonModule,
    NzAvatarModule,
  ],
  templateUrl: './my-profile.component.html',
})
export class MyProfileComponent {
  fb = inject(FormBuilder);
  profileForm = this.fb.group({
    fullName: ['Sarah Smith', Validators.required],
    email: ['sarah.smith@company.com', [Validators.required, Validators.email]],
    phone: ['+1234-567-8901'],
    position: ['Marketing Lead'],
  });

  save() {
    console.log('Profile saved:', this.profileForm.value);
    // Call service to update later
  }
}
