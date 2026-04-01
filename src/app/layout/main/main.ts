import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { RouterOutlet,Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-main',
  imports: [RouterOutlet,CommonModule,RouterLink],
  standalone:true,
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {
  
isScrolled = false;
activeSection: string = '';
isNavbarCollapsed = true;
isNavbarOpen = false;


  
constructor(private http:HttpClient,public router: Router){
    this.router.events
  .pipe(filter(event => event instanceof NavigationEnd))
  .subscribe(() => {

    // If on home page → enable smooth scroll
    if (this.router.url === '/') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }

    // Otherwise → disable smooth scroll
    else {
      document.documentElement.style.scrollBehavior = 'auto';
    }

    // Always open non-index pages at top instantly
    if (this.router.url !== '/') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  });

}
toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
  
ngAfterViewInit() {
  const sections = document.querySelectorAll("section");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.activeSection = entry.target.id;
      }
    });
  }, {
    threshold: 0.6 // 60% of section visible → active
  });

  sections.forEach(section => observer.observe(section));
}

 isContentPage() {
    return (
      this.router.url === '/testUAT/terms-condition' ||
      this.router.url === '/testUAT/privacy-policy' ||
      this.router.url === '/testUAT/news'
    );
  }

  goToSection(sectionId: string) {
  if (this.router.url === '/') {
    // already on homepage → scroll
    this.scrollToSection(sectionId);
    this.isNavbarOpen = false;
  } else {
    // navigate to homepage → then scroll
    this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        this.scrollToSection(sectionId);
      }, 50);
    });
  }
}

  // Scroll to a specific section
  scrollToSection(sectionId: string): void {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

ngOnDestroy() {
    this.isNavbarOpen = false;
  }
}


