import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  avatarUrl: string = '';

  constructor(public authService: AuthService) {
    // Get user's profile picture
    this.avatarUrl = this.authService.user?.profilePhoto || '';
  }

  ngOnInit(): void {}
}
