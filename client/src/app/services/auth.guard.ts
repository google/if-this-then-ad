import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root',
})

/**
 * Auth guard to protect routes.
 */
export class AuthGuard implements CanActivate {
  /**
   * Constructor.
   *
   * @param {AuthService} authService
   * @param {Router} router
   */
  constructor(public authService: AuthService, public router: Router) {}

  /**
   * Evaluate if can access the page.
   *
   * @param {ActivatedRouteSnapshot} next
   * @param {RouterStateSnapshot} state
   * @returns {Observable<boolean | UrlTree>|Promise<boolean | UrlTree>|booleanUrlTree}
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.authService.isLoggedIn) {
      return true;
    }

    // Redirect to login page, preserving last route
    this.router.navigate(['/login'], { queryParams: { returnTo: state.url } });

    return false;
  }
}
