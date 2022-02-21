import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})

/**
 * Header component.
 */
export class HeaderComponent implements OnInit {
  avatarUrl: string = '';

  /**
   * Constructor.
   *
   * @param {AuthService} authService
   * @param {Router} router
   */
  constructor(public authService: AuthService, private router: Router) {
    // Get user's profile picture
    this.authService.userWatch.subscribe((user) => {
      this.avatarUrl = user ? user.profilePhoto : '';
    });
  }

  // eslint-disable-next-line require-jsdoc
  ngOnInit(): void {}

  /**
   * Logout - Navigate to Login page.
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
