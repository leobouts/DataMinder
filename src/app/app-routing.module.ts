import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {Timeline} from './timeline/timeline';
import {BarComponent} from './bar/bar';
import {ScatterComponent} from './scatter/scatter'

const routes: Routes = [
  { path: 'stepper', component: Timeline},
  { path: 'bars', component:BarComponent},
  { path: 'scatter', component:ScatterComponent}];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {
  static components =
    [BarComponent, Timeline,ScatterComponent];
}

