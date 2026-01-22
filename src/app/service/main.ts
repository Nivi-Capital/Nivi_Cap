import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class Main {
  
  //  private baseUrl = "https://nivione-uat.nivicap.com/nivicapstage/api/public/leads" 
  status: string | undefined;
  //  private baseUrl = "http://192.168.5.46:8080/nivicapstage/api/public/leads"
  private baseUrl = environment.apiBaseUrl;

  constructor(public http: HttpClient) { }

  submitContact(payload: any) : Observable<any>{
    return this.http.post<any>(
      `${this.baseUrl}/contact/submit`,
      payload,
    );
  }

  submitLead(payload: any) : Observable<any>{
    return this.http.post<any>(
      `${this.baseUrl}/submit`,
      payload,
    );
  }


  restrictInput(event: Event, type: 'text' | 'number') {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    if (type === 'text') {
      // Keep only letters and spaces
      value = value.replace(/[^A-Za-z ]+/g, '');

      // Prevent multiple spaces in a row
      value = value.replace(/\s{2,}/g, ' ');

      // Prevent leading space
      value = value.replace(/^\s+/, '');
    }

    if (type === 'number') {
      // Keep only digits
      value = value.replace(/[^0-9]+/g, '');
    }

    // Update only if changed (prevents cursor jumping)
    if (value !== input.value) {
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
  }

  
}
