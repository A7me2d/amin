import { Injectable, signal, computed, effect } from '@angular/core';

export interface Theme {
  name: string;
  label: string;
  primaryColor: string;
  bgColor: string;
  bgColorSecondary: string;
  textColor: string;
  textColorSecondary: string;
  borderColor: string;
  accentColor: string;
}

const themes: Theme[] = [
  {
    name: 'dark-amber',
    label: 'Dark Amber',
    primaryColor: '#f59e0b',
    bgColor: '#0f172a',
    bgColorSecondary: '#1e293b',
    textColor: '#ffffff',
    textColorSecondary: '#94a3b8',
    borderColor: '#334155',
    accentColor: '#fbbf24'
  },
  {
    name: 'dark-emerald',
    label: 'Dark Emerald',
    primaryColor: '#10b981',
    bgColor: '#0f172a',
    bgColorSecondary: '#1e293b',
    textColor: '#ffffff',
    textColorSecondary: '#94a3b8',
    borderColor: '#334155',
    accentColor: '#34d399'
  },
  {
    name: 'dark-blue',
    label: 'Dark Blue',
    primaryColor: '#3b82f6',
    bgColor: '#0f172a',
    bgColorSecondary: '#1e293b',
    textColor: '#ffffff',
    textColorSecondary: '#94a3b8',
    borderColor: '#334155',
    accentColor: '#60a5fa'
  },
  {
    name: 'dark-purple',
    label: 'Dark Purple',
    primaryColor: '#a855f7',
    bgColor: '#0f172a',
    bgColorSecondary: '#1e293b',
    textColor: '#ffffff',
    textColorSecondary: '#94a3b8',
    borderColor: '#334155',
    accentColor: '#c084fc'
  },
  {
    name: 'dark-rose',
    label: 'Dark Rose',
    primaryColor: '#f43f5e',
    bgColor: '#0f172a',
    bgColorSecondary: '#1e293b',
    textColor: '#ffffff',
    textColorSecondary: '#94a3b8',
    borderColor: '#334155',
    accentColor: '#fb7185'
  },
  {
    name: 'light-amber',
    label: 'Light Amber',
    primaryColor: '#d97706',
    bgColor: '#f8fafc',
    bgColorSecondary: '#e2e8f0',
    textColor: '#1e293b',
    textColorSecondary: '#475569',
    borderColor: '#cbd5e1',
    accentColor: '#f59e0b'
  },
  {
    name: 'light-emerald',
    label: 'Light Emerald',
    primaryColor: '#059669',
    bgColor: '#f8fafc',
    bgColorSecondary: '#e2e8f0',
    textColor: '#1e293b',
    textColorSecondary: '#475569',
    borderColor: '#cbd5e1',
    accentColor: '#10b981'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = signal<string>(this.getStoredTheme());
  
  themes = themes;
  currentThemeName = this.currentTheme;
  
  currentThemeData = computed(() => {
    return this.themes.find(t => t.name === this.currentTheme()) || this.themes[0];
  });

  constructor() {
    effect(() => {
      this.applyTheme(this.currentThemeData());
    });
  }

  private getStoredTheme(): string {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('theme') || 'dark-amber';
    }
    return 'dark-amber';
  }

  setTheme(themeName: string): void {
    this.currentTheme.set(themeName);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', themeName);
    }
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-bg', theme.bgColor);
    root.style.setProperty('--color-bg-secondary', theme.bgColorSecondary);
    root.style.setProperty('--color-text', theme.textColor);
    root.style.setProperty('--color-text-secondary', theme.textColorSecondary);
    root.style.setProperty('--color-border', theme.borderColor);
    root.style.setProperty('--color-accent', theme.accentColor);
    
    // Set data attribute for theme-specific Tailwind overrides
    root.setAttribute('data-theme', theme.name);
  }
}
