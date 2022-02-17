import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  avatarUrl: string = '';

  constructor(public authService: AuthService, private router: Router) {
    // Get user's profile picture
    this.authService.userWatch.subscribe(user => {
      this.avatarUrl = user.profilePhoto;
    })
  }

  ngOnInit(): void {}

  /**
   * Logout - Navigate to Login page.
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
