
  import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { NewsService } from '../../../service/news';

@Component({
  selector: 'app-newsform',
 standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './newsform.html',
  styleUrl: './newsform.css',
})
export class Newsform {

  newsForm: FormGroup;

  selectedImage?: File;
  selectedPdf?: File;

  imagePreview?: string;

  uploading = false;
  successMessage = '';
  errorMessage = '';

  languages = [
    'English',
    'Hindi',
    'Kannada',
    'Gujarati',
    'Malayalam',
    'Punjabi'
  ];

  @ViewChild('imageInput')
imageInput!: ElementRef<HTMLInputElement>;

@ViewChild('pdfInput')
pdfInput!: ElementRef<HTMLInputElement>;

imageErrorMessage = '';
pdfErrorMessage = '';
  constructor(
    private fb: FormBuilder,
    private newsService: NewsService
  ) {

    this.newsForm = this.fb.group({

      title: ['', Validators.required],

      publication: ['', Validators.required],

      date: ['', Validators.required],

      language: ['English', Validators.required],

      smallDescription: ['', Validators.required],

      largeDescription: ['', Validators.required],

      originalNewsUrl: [''],

      disclaimerPublication: [''],

      // disclaimerLink: ['']

    });
  }

onImageSelected(event: Event): void {

  const input = event.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  const file = input.files[0];

  const allowedTypes = [
    'image/png',
    'image/jpeg',
    'image/svg+xml'
  ];

  const allowedExtensions = [
    'png',
    'jpg',
    'jpeg',
    'svg'
  ];

  const extension =
    file.name
      .split('.')
      .pop()
      ?.toLowerCase() || '';

  if (
    !allowedTypes.includes(file.type) ||
    !allowedExtensions.includes(extension)
  ) {

    this.imageErrorMessage =
      'Only PNG, JPG, JPEG and SVG images are allowed.';

    this.selectedImage = undefined;
    this.imagePreview = undefined;

    // Clear selected invalid file
    input.value = '';

    // setTimeout(() => {
    //   this.imageErrorMessage = '';
    // }, 2000);

    return;
  }

  this.selectedImage = file;
  this.imageErrorMessage = '';

  const reader = new FileReader();

  reader.onload = () => {
    this.imagePreview =
      reader.result as string;
  };

  reader.readAsDataURL(file);
}


removeImage(input: HTMLInputElement): void {
  this.selectedImage = undefined;
  this.imagePreview = undefined;
  this.imageErrorMessage = '';

  // Clear file input
  input.value = '';
}

onPdfSelected(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  const file = input.files[0];

  // Allow only PDF
  if (file.type !== 'application/pdf') {
    this.pdfErrorMessage ="Only PDF files are allowed"
    input.value = ''; // Clear selected file
    this.selectedPdf = undefined;
       setTimeout(() => {
    this.pdfErrorMessage = '';
  }, 2000);
    return;
  }

  this.selectedPdf = file;
}

submit(): void {

  if (
    this.newsForm.invalid ||
    !this.selectedImage
  ) {
    this.newsForm.markAllAsTouched();

    this.errorMessage =
      'Please fill the required fields and select an image.';

    return;
  }

  const formData = new FormData();

  formData.append(
    'title',
    this.newsForm.value.title
  );

  formData.append(
    'publication',
    this.newsForm.value.publication
  );

  formData.append(
    'date',
    this.newsForm.value.date
  );

  formData.append(
    'language',
    this.newsForm.value.language
  );

  formData.append(
    'type',
    'text'
  );

  formData.append(
    'smallDescription',
    this.newsForm.value.smallDescription
  );

  formData.append(
    'largeDescription',
    this.newsForm.value.largeDescription
  );

  formData.append(
    'originalNewsUrl',
    this.newsForm.value.originalNewsUrl || ''
  );

  formData.append(
    'disclaimerPublication',
    this.newsForm.value.disclaimerPublication || ''
  );

  // formData.append(
  //   'disclaimerLink',
  //   this.newsForm.value.disclaimerLink || ''
  // );

  // Image file
  formData.append(
    'image',
    this.selectedImage,
    this.selectedImage.name
  );

  // PDF file
  if (this.selectedPdf) {
    formData.append(
      'pdf',
      this.selectedPdf,
      this.selectedPdf.name
    );
  }

  this.uploading = true;
  this.successMessage = '';
  this.errorMessage = '';

  this.newsService
    .createNews(formData)
    .subscribe({

      next: response => {

        console.log(
          'Article created:',
          response
        );

        this.uploading = false;

        this.successMessage =
          'News article added successfully.';

        this.errorMessage = '';

        this.resetForm();

          setTimeout(() => {
    this.successMessage = '';
  }, 3000);
      },

      error: error => {

        console.error(
          'Error creating article:',
          error
        );

        this.uploading = false;

        this.errorMessage =
          'Unable to add news article.';
      }

    });
}
  private resetForm(): void {

    this.newsForm.reset({
      language: 'English'
    });

    this.selectedImage = undefined;
    this.selectedPdf = undefined;
    this.imagePreview = undefined;

      if (this.imageInput) {
    this.imageInput.nativeElement.value = '';
  }

  if (this.pdfInput) {
    this.pdfInput.nativeElement.value = '';
  }
  }

}
