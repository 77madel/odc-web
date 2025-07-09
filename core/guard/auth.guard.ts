import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.currentUserValue;
    //console.log('AuthGuard - Utilisateur actuel :', currentUser);
    if (currentUser) {
      // Si l'utilisateur est connecté, il peut accéder aux routes protégées
      return true;
    }
    // Si l'utilisateur n'est pas connecté, redirection vers la page de connexion
    this.router.navigate(['/authentication/signin']);
    return false;
  }
}
