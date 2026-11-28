import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-profile-info',
  imports: [NgOptimizedImage],
  templateUrl: './profile-info.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileInfoComponent {
  userName = input.required<string>();
  userRole = input.required<string>();
  email = input.required<string>();
  avatarUrl = input.required<string>();
}
