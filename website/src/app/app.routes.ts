import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'sobre',
    loadComponent: () => import('./pages/sobre/sobre.component').then(m => m.SobreComponent)
  },
  {
    path: 'privacidade',
    loadComponent: () => import('./pages/privacidade/privacidade.component').then(m => m.PrivacidadeComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

