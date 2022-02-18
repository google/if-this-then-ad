import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-logged-in',
  templateUrl: './logged-in.component.html',
  styleUrls: ['./logged-in.component.scss']
})
export class LoggedInComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {
    // Extract user
    const userString = this.route.snapshot.queryParamMap.get('user') || '""';
    this.authService.user = new User().deserialize(JSON.parse(userString));

    // Redirect user to where they came from
    const returnTo = this.route.snapshot.queryParamMap.get('returnTo') || '';
    this.router.navigate([returnTo]);
  }

  ngOnInit(): void {}
}
