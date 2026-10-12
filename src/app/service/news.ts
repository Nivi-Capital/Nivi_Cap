import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import {
  Observable,
  map,
  of
} from 'rxjs';

import { NewsArticle } from '../models/news.model';

@Injectable({
  providedIn: 'root'
})
export class NewsService {



  private readonly jsonUrl ='api/news.php'; //Uat

    // private readonly jsonUrl ='http://localhost:8080/news.php';
    //   //local

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // GET ALL NEWS
  // =====================================================

  //  getNews(
  //   language?: string
  // ): Observable<NewsArticle[]> {

  //   let params = new HttpParams();

  //   if (language) {
  //     params = params.set(
  //       'language',
  //       language
  //     );
  //   }

  //   return this.http.get<NewsArticle[]>(
  //     this.jsonUrl,
  //     { params }
  //   );
  // }

getNews(
  language?: string
): Observable<NewsArticle[]> {

  let params =
    new HttpParams()
      .set('type', 'text');

  if (language) {
    params = params.set(
      'language',
      language
    );
  }

  return this.http.get<NewsArticle[]>(
    this.jsonUrl,
    { params }
  );
}
  // =====================================================
  // GET ONE NEWS
  // =====================================================

 getNewsById(
    id: string
  ): Observable<NewsArticle> {

    // return this.http.get<NewsArticle>(
    //   `${this.jsonUrl}/${id}`
    // );
     const params =
      new HttpParams()
        .set(
          'id',
          id
        );

    return this.http.get<NewsArticle>(
      this.jsonUrl,
      {
        params
      }
    );
  }


  // =====================================================
  // ADD NEWS
  // =====================================================


  createNews(
    data: FormData
  ): Observable<NewsArticle> {

    // return this.http.post<NewsArticle>(
    //   this.jsonUrl,
    //   data
    // );
    const params =
      new HttpParams()
        .set(
          'action',
          'create'
        );

    return this.http.post<NewsArticle>(
      this.jsonUrl,
      data,
      {
        params
      }
    );
  }


  // =====================================================
  // READ LOCAL STORAGE
  // =====================================================

 incrementView(
  id: string
): Observable<{ views: number }> {

  // return this.http.post<{ views: number }>(
  //   `${this.jsonUrl}/${id}/view`,
  //   {}
  // );

   const params =
      new HttpParams()
        .set(
          'action',
          'view'
        )
        .set(
          'id',
          id
        );

    return this.http.post<{ views: number }>(
      this.jsonUrl,
      {},
      {
        params
      }
    );
}


incrementLike(
  id: string
): Observable<{ likes: number }> {

  // return this.http.post<{ likes: number }>(
  //   `${this.jsonUrl}/${id}/like`,
  //   {}
  // );

   const params =
      new HttpParams()
        .set(
          'action',
          'like'
        )
        .set(
          'id',
          id
        );

    return this.http.post<{ likes: number }>(
      this.jsonUrl,
      {},
      {
        params
      }
    );
}

getVideos(language?: string): Observable<NewsArticle[]> {
  let params = new HttpParams()
    .set('type', 'video');

  if (language) {
    params = params.set('language', language);
  }

  return this.http.get<NewsArticle[]>(
    this.jsonUrl,
    { params }
  );
}
  

}