import { Route } from "@angular/router";
import { Page404Component } from "../authentication/page404/page404.component";
// import { Dashboard2Component } from "./dashboard2/dashboard2.component";
import { MainComponent } from "./main/main.component";

export const DASHBOARD_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
  {
    path: 'main',
    component: MainComponent,
  },
  // {
  //   path: 'dashboard2',
  //   component: Dashboard2Component,
  // },
  { path: "**", component: Page404Component },
];

