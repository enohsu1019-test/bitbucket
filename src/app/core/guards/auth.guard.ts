import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, Subscriber } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authService.currentUserValue;
    const isTokenExpired = this.authService.isTokenExpired();
    console.log('[AuthGuard] current user', currentUser);
    console.log('[AuthGuard] isTokenExpired', isTokenExpired);
    if (currentUser && !isTokenExpired) {
      // logged in so return true
      return true;
    }

    //refresh token
    if (currentUser && currentUser.refreshToken && isTokenExpired) {
      this.authService.refresh();
      return true;
    }

    const url = environment['oauthUrl'] + '?redirectUrl=' + environment['loginUrl'];
    window.location.href = url;

    return false;
  }
}
