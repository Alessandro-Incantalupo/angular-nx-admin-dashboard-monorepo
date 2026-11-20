import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Bootstraps the standalone app using modern Angular API (no AppModule needed)
bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
