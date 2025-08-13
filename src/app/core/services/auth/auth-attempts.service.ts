// auth-attempts.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthAttemptsService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutos
  private readonly STORAGE_KEY = 'auth_attempts_data';

  private attempts: number = 0;
  private lastAttemptTime: number | null = null;
  private locked: boolean = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
        try {
            const data = JSON.parse(saved);
            this.attempts = data.attempts || 0;
            this.lastAttemptTime = data.lastAttemptTime || null;
            this.locked = data.locked || false;

            // 🔹 Recalcular bloqueo
            if (this.locked && this.lastAttemptTime) {
            const tiempoRestante = this.getLockoutTimeLeft();
            if (tiempoRestante <= 0) {
                this.resetAttempts(); // desbloquear si ya pasó el tiempo
            }
            }
        } catch {
            this.clearStorage();
        }
        }
    }
  }
  private saveState(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify({
        attempts: this.attempts,
        lastAttemptTime: this.lastAttemptTime,
        locked: this.locked
      })
    );
  }

  private clearStorage(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.STORAGE_KEY);
    this.attempts = 0;
    this.lastAttemptTime = null;
    this.locked = false;
  }

  recordAttempt(): void {
    const now = Date.now();

    // Si ha pasado el tiempo de bloqueo, reiniciamos
    if (this.lastAttemptTime && (now - this.lastAttemptTime) > this.LOCKOUT_TIME) {
      this.resetAttempts();
    }

    this.attempts++;
    this.lastAttemptTime = now;

    if (this.attempts >= this.MAX_ATTEMPTS) {
      this.locked = true;
      this.saveState();

      // Auto-desbloqueo después del tiempo
      setTimeout(() => {
        this.resetAttempts();
      }, this.LOCKOUT_TIME);
    } else {
      this.saveState();
    }
  }

  resetAttempts(): void {
    this.attempts = 0;
    this.lastAttemptTime = null;
    this.locked = false;
    this.saveState();
  }

  isLocked(): boolean {
    return this.locked;
  }

  getRemainingAttempts(): number {
    return Math.max(0, this.MAX_ATTEMPTS - this.attempts);
  }

  getLockoutTimeLeft(): number {
    if (!this.lastAttemptTime || !this.locked) return 0;
    return Math.max(0, this.LOCKOUT_TIME - (Date.now() - this.lastAttemptTime));
  }
}
