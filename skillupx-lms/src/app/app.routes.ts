import { Routes } from '@angular/router';
import { App } from './app';
import { Login } from './modules/auth/login/login';
import { Dashboard } from './modules/dashboard/dashboard';
import { Profile } from './modules/profile/profile';
import { PeerZone } from './modules/peer-zone/peer-zone';
import { AuthGuard } from './core/guards/auth-guard';
import { Register } from './modules/auth/register/register';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register},
  { path: 'dashboard', component: Dashboard },
  { path: 'profile', component: Profile },
  { path: 'peer-zone', component: PeerZone},
  { path: '**', redirectTo: 'dashboard' }
];
