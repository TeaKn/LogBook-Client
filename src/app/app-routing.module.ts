import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AssessmentsComponent } from './components/assessments/assessments.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'assessments', component: AssessmentsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }