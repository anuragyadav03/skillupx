import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "dashboard",
        loadChildren: () =>
          import("../modules/dashboard/dashboard-module").then(
            (m) => m.DashboardModule
          ),
      },
      {
        path: "profile",
        loadChildren: () =>
          import("../modules/profile/profile-module").then(
            (m) => m.ProfileModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeatureRoutingRoutingModule { }
