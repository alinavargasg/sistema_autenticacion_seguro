import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private canUseStorage(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    try {
      const testKey = '__test_key__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  getItem(key: string): string | null {
    if (this.canUseStorage()) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return null;
  }

  setItem(key: string, value: string): void {
    if (this.canUseStorage()) {
      try {
        window.localStorage.setItem(key, value);
      } catch {}
    }
  }

  removeItem(key: string): void {
    if (this.canUseStorage()) {
      try {
        window.localStorage.removeItem(key);
      } catch {}
    }
  }

  clear(): void {
    if (this.canUseStorage()) {
      try {
        window.localStorage.clear();
      } catch {}
    }
  }
}
