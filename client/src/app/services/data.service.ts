import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    observe: 'response' as const
  }

  constructor(private http: HttpClient) {

  }
  /**
   * Refreshes accessToken on expiry
   * @returns accessToken
   */
  async refreshToken() {

    const rawUser = localStorage.getItem('user');
    if (!rawUser) {
      return;
    }
    const user = User.fromJSON(rawUser);
    const accessToken = user.token.access;

    const data = {
      userId: user.profileId,
      token: accessToken
    }
    this.http.post(ENDPOINT.REFRESH_TOKEN, data)
        .subscribe(token => {
          console.log(token); 
        }); 
  }

  async getUsers() {

    this.http.get(ENDPOINT.USERS, this.httpOptions).subscribe(res => {

       // TODO: deal with 401
    });

  }
}

const ENDPOINT = {
  USERS: environment.apiUrl + '/accounts',
  RULES: environment.apiUrl + '/rules',
  JOBS: environment.apiUrl + '/jobs',
  EXECUTE_JOBS: environment.apiUrl + '/jobs/execute',
  REFRESH_TOKEN: environment.apiUrl + '/auth/refresh',
  LOGOUT: environment.apiUrl + '/auth/logout',

}

