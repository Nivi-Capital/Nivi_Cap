import { Component, OnInit } from '@angular/core';
import newsData from '../../../assets/jsonData/publication.json'
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-news',
  imports: [CommonModule],
  templateUrl: './news.html',
  styleUrl: './news.css',
})
export class News implements OnInit {


  newsList: any[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;   
  visiblePages: (number | string)[] = [];
selectedHtml = '';
selectedNews:any
constructor(private http: HttpClient) {}
  ngOnInit() {
    this.newsList = newsData;
     this.newsList.sort((a, b) => {
    return this.parseDate(b.Date).getTime() - this.parseDate(a.Date).getTime();
  });
    if(this.newsList?.length) this.totalPages = Math.floor(this.newsList.length/10);
    this.generateVisiblePages();
  }
get pagedNews() {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.newsList.slice(start, start + this.pageSize);
}

parseDate(dateStr: string): Date {
  // Converts "19-Nov-25" → "19 Nov 2025"
  const [day, month, year] = dateStr.split('-');
  return new Date(`${day} ${month} 20${year}`);
}

  generateVisiblePages() {
    const maxButtons = 5;
    this.visiblePages = [];

    if (this.totalPages <= maxButtons) {
      this.visiblePages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      return;
    }

    this.visiblePages.push(1);

    if (this.currentPage > 3) this.visiblePages.push("...");

    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let i = start; i <= end; i++) this.visiblePages.push(i);

    if (this.currentPage < this.totalPages - 2) this.visiblePages.push("...");

    this.visiblePages.push(this.totalPages);
  }

  goToPage(page: any) {
    if (page === "...") return;
    this.currentPage = page;
    this.generateVisiblePages();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.generateVisiblePages();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.generateVisiblePages();
    }
  }

  openNews1(url: string): void {
    window.open(url, '_blank');
  }




  openNews(item: any) {
    console.log(item);
    const url = `/news-details?file=${encodeURIComponent(item.htmlFile)}`;

    window.open(url, '_blank');
  }
}
