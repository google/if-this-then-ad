import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginUrl: string = `${environment.apiUrl}/auth/google`;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {}

  login(): void {
    this.authService.login().subscribe(
      data => {
        console.log('login response', data);
      }
    )
  }

  submit(form: any): void {
    console.log(form);

    this.authService.login().subscribe(
      data => {
        console.log('login response', data);
      }
    )
  }
}
