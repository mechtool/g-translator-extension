import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {BackgroundPageComponent} from './background-page/background-page.component';
import {PopupPageComponent} from './popup-page/popup-page.component';
import {OptionsPageComponent} from './options-page/options-page.component';

const routes: Routes = [
    {path : 'background-page', component : BackgroundPageComponent},
    {path : 'options-page', component : OptionsPageComponent},
    {path : 'popup-page', component : PopupPageComponent},
    {path : '', redirectTo : 'popup-page', pathMatch : 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
