import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-newsdetails',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './newsdetails.html',
  styleUrl: './newsdetails.css',
})
export class Newsdetails  implements OnInit {


  selectedHtml = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      const htmlFile = params['file'];

      if (!htmlFile) return;

      this.http
        .get(htmlFile, { responseType: 'text' })
        .subscribe(html => {
          this.selectedHtml = html;
        });

    });
  }


}
