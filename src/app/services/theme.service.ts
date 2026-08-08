import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

type Theme = 'snow' | 'carbon';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('snow');
  public theme$: Observable<Theme> = this.themeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('daynight-theme');
    if (savedTheme === 'carbon') {
      this.setTheme('carbon');
    } else {
      this.setTheme('snow');
    }
  }

  setTheme(theme: Theme): void {
    if (theme === 'carbon') {
      document.documentElement.classList.add('carbon');
      document.body.classList.add('carbon');
      localStorage.setItem('daynight-theme', 'carbon');
    } else {
      document.documentElement.classList.remove('carbon');
      document.body.classList.remove('carbon');
      localStorage.setItem('daynight-theme', 'snow');
    }
    this.themeSubject.next(theme);
  }

  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  toggleTheme(): void {
    const current = this.getCurrentTheme();
    this.setTheme(current === 'snow' ? 'carbon' : 'snow');
  }
}