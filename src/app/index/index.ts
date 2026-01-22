import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, HostListener, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Main } from '../service/main';

type FormStatusType = 'form' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink],
  templateUrl: './index.html',
  styleUrls: ['./index.css'],
})

export class Index {
  isScrolled = false;
  activeSection: string = 'home';
  private observer?: IntersectionObserver;
  private timerInterval?: number;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (window.location.pathname !== '/') return;
    this.isScrolled = window.scrollY > 800;
  }

  loanAmount: string = '';
  amountError = "";

  isAgreed: boolean = false;

  showsuccess: boolean = false;
  showError: boolean = false;
  pleasecheck: boolean = true;
  status!: FormStatusType;
  msgtoshow = "";

  constructor(private http: HttpClient, public main: Main, private ngZone: NgZone, private cdr: ChangeDetectorRef) {
    this.status = 'form';
  }

  ngAfterViewInit() {
    if (window.location.pathname !== '/') return;

    const sections = document.querySelectorAll("section");
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.ngZone.run(() => {
            this.activeSection = entry.target.id;
            this.cdr.detectChanges();
          });
        }
      });
    }, {
      threshold: 0.6 // 60% of section visible → active
    });

    sections.forEach(section => this.observer?.observe(section));
  }




  // Scroll to a specific section
  scrollToSection(sectionId: string): void {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ----------------------submit form---------------


  //format amount 2000000 to 20,00,000
  formatAmount() {
    if (!this.loanAmount) return;

    let value = this.loanAmount.replace(/,/g, '');

    // block non-digit characters
    value = value.replace(/\D/g, '');

    this.loanAmount = this.formatIndian(value);
    this.validateAmount();
  }

  formatIndian(x: string): string {
    if (!x) return '';
    let lastThree = x.substring(x.length - 3);
    let otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers !== '') lastThree = ',' + lastThree;
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  }
  //loan form
  onAgreeChange(event: any) {
    this.isAgreed = event.target.checked;
    const checked = (event.target as HTMLInputElement).checked;
  // this.pleasecheck = !checked;
  }
 


  validateAmount() {
    const numericValue = Number(this.loanAmount.toString().replace(/,/g, ''));
    // this.amountError = 100000 > numericValue || numericValue > 4500000;
    if (!numericValue) {
      this.amountError = '';
      return;
    }

    if (numericValue < 100000) {
      this.amountError = 'min';
    } else if (numericValue > 10000000) {
      this.amountError = 'max';
    } else {
      this.amountError = '';
    }
  }

  submitLoanForm(data: NgForm) {
    if (this.status === 'loading') return; // prevent double submit

    this.status = 'loading';

    if (!data || data.invalid || this.amountError) return;

    const inputobj = {
      fullName: data.value.name,
      mobileNumber: data.value.phone,
      email: data.value.email,
      loanAmount: data.value.loanAmount,
      source: "WEBSITE"
    };

    this.main.submitLead(inputobj).subscribe({
      next: (res) => {
        this.status = 'success';
        this.showsuccess = true;
        this.msgtoshow = res.message;
        data.resetForm();
        setTimeout(() => {
          this.status = 'form';
          this.showsuccess = false;
        }, 10000);
      },
      error: (err) => {
        this.status = 'error';
        // this.msgtoshow = err.error.message;
        this.msgtoshow = err.error?.message || 'Something went wrong. Please try again.';

        this.showError = true;
        setTimeout(() => {
          this.showError = false;
          this.status = 'form';

        }, 5000);
      }

    });
  }





  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
    if (this.timerInterval !== undefined) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  // Helper methods for template type checking
  isLoading(): boolean {
    return this.status === 'loading';
  }

  isForm(): boolean {
    return this.status === 'form';
  }

  isSuccess(): boolean {
    return this.status === 'success';
  }

  isError(): boolean {
    return this.status === 'error';
  }
}
