import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { content } from './shared/routes/routes';

import { LayoutComponent } from './layout/layout.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { ScrollPositionGuard } from './core/guard/scroll.guard';

const routes: Routes = [
  {
    path: "maintenance",
    component: MaintenanceComponent
  },
  {
    path: "",
    component: LayoutComponent,
    children: content,
    canActivate: [ScrollPositionGuard],
  },
  { path: 'contact-us', loadChildren: () => import('./pages/contact-us/contact-us.module').then(m => m.ContactUsModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
