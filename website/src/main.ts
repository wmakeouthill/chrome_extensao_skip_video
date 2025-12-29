import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    // ✅ ZONELESS - Angular 20+
    provideZonelessChangeDetection(),
    
    // ✅ Routing
    provideRouter(routes)
  ]
}).catch(err => console.error(err));

