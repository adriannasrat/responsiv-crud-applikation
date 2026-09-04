import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.service';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'bocker' },
  {
    path: 'logga-in',
    title: 'Logga in · Bokrum',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth.page').then((m) => m.AuthPage),
  },
  {
    path: 'registrera',
    title: 'Skapa konto · Bokrum',
    data: { register: true },
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth.page').then((m) => m.AuthPage),
  },
  {
    path: 'bocker',
    title: 'Mina böcker · Bokrum',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/books.page').then((m) => m.BooksPage),
  },
  {
    path: 'bocker/ny',
    title: 'Lägg till bok · Bokrum',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/editor.page').then((m) => m.EditorPage),
  },
  {
    path: 'bocker/:id/redigera',
    title: 'Redigera bok · Bokrum',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/editor.page').then((m) => m.EditorPage),
  },
  {
    path: 'citat',
    title: 'Mina citat · Bokrum',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/quotes.page').then((m) => m.QuotesPage),
  },
  {
    path: 'citat/ny',
    title: 'Lägg till citat · Bokrum',
    data: { quote: true },
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/editor.page').then((m) => m.EditorPage),
  },
  {
    path: 'citat/:id/redigera',
    title: 'Redigera citat · Bokrum',
    data: { quote: true },
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/editor.page').then((m) => m.EditorPage),
  },
  { path: '**', redirectTo: 'bocker' },
];
