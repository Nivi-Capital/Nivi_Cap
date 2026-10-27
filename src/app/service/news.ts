import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import {
  Observable,map,of} from 'rxjs';

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


getNews(
  language?: string
): Observable<NewsArticle[]> {

  let params =
    new HttpParams()
      .set('type', 'onlinemedia');

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
  // News Slug
  // =====================================================
getNewsBySlug(
  language: string,
  type: string,
  slug: string
): Observable<NewsArticle> {

  const params = new HttpParams()
   .set('language', language)
    .set('type', type)
    .set('slug', slug);

  return this.http.get<NewsArticle>(
    this.jsonUrl,
    {
      params
    }
  );
}
  // =====================================================
  // READ LOCAL STORAGE
  // =====================================================

 incrementView(
  id: string,language: string,
  type: string
): Observable<{ views: number; type: string }> {

 const normalizedType =
    type === 'video'
      ? 'video'
      : 'onlinemedia';

   const params = new HttpParams()
    .set('action', 'view')
    .set('id', id)
    .set(
      'language',
      language.trim().toLowerCase()
    )
    .set(
      'type',
      normalizedType
    );

    return this.http.post<{ views: number;type: string; }>(
      this.jsonUrl,
      {},
      {
        params
      }
    );
}


incrementLike(
  id: string,language: string,
  type: string
): Observable<{ likes: number;type: string; }> {

   const normalizedType =
    type === 'video'
      ? 'video'
      : 'onlinemedia';
      
   const params =
      new HttpParams()
        .set('action', 'like'
        )
        .set( 'id', id
        )
          .set(
      'language',
      language.trim().toLowerCase()
    )
    .set(
      'type',
      normalizedType
    );

    return this.http.post<{ likes: number;type: string; }>(
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