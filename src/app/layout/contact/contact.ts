import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Main } from '../../service/main';

@Component({
  selector: 'app-contact',
  imports: [CommonModule,HttpClientModule,FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  isSubmitting :boolean= false;
  showsuccessbox:boolean=false;
  msgsuccess:any;

  constructor(private http:HttpClient,private main:Main){}

submitForm(form: NgForm) {
    if (!form.valid) {
      alert("Please fill all required fields!");
      return;
    }

    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('email', form.value.email);
    formData.append('phone', form.value.phone);
    formData.append('query', form.value.query);
    formData.append('subject', form.value.subject);
    formData.append('message', form.value.message);

    // Note: Ensure your backend (send-mail.php) validates CSRF tokens
    // and implements proper security measures for form submission
    this.http.post(
      "https://nivicap.com/nivicap/send-mail.php",
      formData,
      { responseType: 'text' }
    )
    .subscribe({
      next: (res) => {
        alert("Your inquiry has been sent successfully!");
        form.reset();
      },
      error: () => {
        alert("Failed to send email.");
      }
    });
  }


  submitcontactForm(data: NgForm) {
    if (this.isSubmitting || data.invalid) {
    return;
  }

  this.isSubmitting = true; 

    const inputobj = {
      fullName: data.value.name,
      mobileNumber: data.value.phone,
      email: data.value.email,
      query: data.value.query,
      subject: data.value.subject,
      Message: data.value.message,
      source:"WEBSITE"
    };

    this.main.submitContact(inputobj).subscribe({
      next: (res) => {
        this.msgsuccess = res.message;
        this.showsuccessbox = true;
       
         data.resetForm();
        setTimeout(() => {
          this.showsuccessbox = false;
           this.isSubmitting = false;
        }, 2000);
        
        
      },
      error: (err) => {console.error('submit lead error', err),
        this.isSubmitting = false; }
    });
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
}}


