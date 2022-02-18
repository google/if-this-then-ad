import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  avatarUrl: string = '';

  constructor(public authService: AuthService, private router: Router, private dataService: DataService) {
    // Get user's profile picture
    this.authService.userWatch.subscribe(user => {
      this.avatarUrl = user ? user.profilePhoto : '';
    }); 
    this.dataService.getUsers(); 
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
