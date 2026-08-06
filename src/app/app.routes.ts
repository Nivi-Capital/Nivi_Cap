import { Routes } from '@angular/router';
import { Terms } from './layout/terms/terms';
import { Privacypolicy } from './layout/privacypolicy/privacypolicy';
import { Index } from './index'
import { Main } from './layout/main/main';
import { Contact } from './layout/contact/contact';
import { News } from './layout/news/news';
import { Career } from './layout/career/career';

export const routes: Routes = [
    {   path: '',
        component: Main,
        children: [
      { path: '', component: Index },
      { path: 'terms-condition', component: Terms },
      { path: 'privacy-policy', component: Privacypolicy },
       { path: 'contact', component: Contact },
       { path: 'news', component: News },
        { path: 'career', component: Career },
    
{
  path: 'news-details',
  loadComponent: () =>
    import('./layout/news/newsdetails/newsdetails')
      .then(m => m.Newsdetails)
}
    ]
    },

    

    { path: '**', redirectTo: '' }
];
