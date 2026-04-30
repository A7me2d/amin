import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'units',
    loadComponent: () => import('./features/units/units-list/units-list.component').then(m => m.UnitsListComponent)
  },
  {
    path: 'units/:id',
    loadComponent: () => import('./features/units/unit-detail/unit-detail.component').then(m => m.UnitDetailComponent)
  },
  {
    path: 'contracts',
    loadComponent: () => import('./features/contracts/contracts-list/contracts-list.component').then(m => m.ContractsListComponent)
  },
  {
    path: 'contracts/:id',
    loadComponent: () => import('./features/contracts/contract-detail/contract-detail.component').then(m => m.ContractDetailComponent)
  },
  { path: '**', redirectTo: '' }
];
