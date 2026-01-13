import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class Main {
  
   private baseUrl = "https://nivione-uat.nivicap.com/nivicapstage/api/public/leads" 
  //  private baseUrl = "http://192.168.5.46:8081/nivicapstage/api/public/leads"

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


  restrictInput(event: KeyboardEvent, type: 'text' | 'number') {
  const key = event.key;

  // Allow control keys
  const allowedKeys = [
    'Backspace',
    'Tab',
    'ArrowLeft',
    'ArrowRight',
    'Delete'
  ];

  if (allowedKeys.includes(key)) {
    return;
  }

  if (type === 'text') {
    // Allow alphabets and space only
    if (!/^[A-Za-z ]$/.test(key)) {
      event.preventDefault();
    }
  }

  if (type === 'number') {
    // Allow digits only
    if (!/^[0-9]$/.test(key)) {
      event.preventDefault();
    }
  }
}
}
