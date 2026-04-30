import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  themeService = inject(ThemeService);
  themeMenuOpen = signal(false);
  sidebarOpen = signal(false);
  currentThemeName = this.themeService.currentThemeName;

  toggleThemeMenu(): void {
    this.themeMenuOpen.update(v => !v);
  }

  selectTheme(themeName: string): void {
    this.themeService.setTheme(themeName);
    this.themeMenuOpen.set(false);
  }

  openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
