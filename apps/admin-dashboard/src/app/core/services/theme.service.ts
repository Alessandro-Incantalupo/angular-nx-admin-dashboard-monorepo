// import { Injectable, signal, effect } from '@angular/core';
// import { Theme } from '../models/theme.model';

// @Injectable({
//   providedIn: 'root', // ✅ Global singleton: available app-wide
// })
// export class ThemeService {
//   // ✅ Reactive state for theme using signals
//   public theme = signal<Theme>({ mode: 'dark', color: 'base' });

//   constructor() {
//     this.loadTheme(); // ✅ Pull saved theme from localStorage on boot
//     effect(() => {
//       this.setTheme(); // ✅ Automatically update DOM + storage when theme changes
//     });
//   }

//   private loadTheme() {
//     const theme = localStorage.getItem('theme');
//     if (theme) {
//       this.theme.set(JSON.parse(theme)); // ✅ Load saved theme state
//     }
//   }

//   private setTheme() {
//     localStorage.setItem('theme', JSON.stringify(this.theme())); // ✅ Persist to localStorage
//     this.setThemeClass(); // ✅ Also update DOM class
//   }

//   public get isDark(): boolean {
//     return this.theme().mode === 'dark'; // ✅ Useful getter for UI components
//   }

//   private setThemeClass() {
//     // ✅ Applies theme mode + color to <html> tag for styling
//     document.querySelector('html')!.className = this.theme().mode;
//     document.querySelector('html')!.setAttribute('data-theme', this.theme().color);
//   }
// }
