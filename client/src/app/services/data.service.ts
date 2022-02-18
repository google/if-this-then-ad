import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {

  }

  async getUsers() {

    const endpoint = `${environment.apiUrl}/test`;
    const accessToken = 'Bearer ya29.A0ARrdaM9BzNHjouv78rOI3kHN0GTSVJUs0S-kRH1K_cnY3oWgEzotxUtPix33Ay_M-bs-6GizFpwpr4PfRAAG9MKlljEuOM-dtCP_s2Y8DR7jNhfH1fQOS9p4vMTNNdbB3q3Ls0VALVlcq5c6qndvaylWX3cBLxUhYzdW1HCSaFNaa4O3OhknTrN0xwqNJA0sgjRqUYOwtNtqi9s7KOExzKTBVq4xOrsD3Xdl';

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': accessToken,
        'Content-Type': 'application/json'
      })
    }

    this.http.get(endpoint, httpOptions).subscribe(data => {
      console.log('user data: ');
      console.log(data);
    }); 

  }
}
