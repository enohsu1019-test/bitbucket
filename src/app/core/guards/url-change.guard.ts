import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UrlChangeGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const nav = this.router.getCurrentNavigation();
    const segments = state.url.split('/');
    // console.log('[UrlChangeGuard] info...', this.data, segments, nav);
    if (nav && ((nav.extras && nav.extras.state && nav.extras.state['route'].internal) ||
      (nav.trigger === 'popstate'))) {
      return true;
    } else {
      const routeTo = '/' + segments[1] + '/' + segments[2];
      console.error('[UrlChangeGuard] manually change url! Go back to: ' + routeTo);
      return of(true).pipe(tap(() => this.router.navigate([routeTo], { state: { route: { internal: true } } })));
    }
  }

}
