import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

/**
 * Login component.
 */
export class LoginComponent implements OnInit {
  /**
   * Constructor.
   *
   * @param {AuthService} authService
   */
  constructor(public authService: AuthService) {}

  // eslint-disable-next-line require-jsdoc
  ngOnInit(): void {}
}
