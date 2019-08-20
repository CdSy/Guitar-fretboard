import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class EmailService {
  apiServer = environment.api_server;
  endpoint = '/api/email';

  constructor(private http: HttpClient) { }

  sendEmail(data) {
    return this.http.post(`${this.apiServer}${this.endpoint}`, data);
  }
}
