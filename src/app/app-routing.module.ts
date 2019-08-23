import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { PolicyPageComponent } from './pages/policy/policy.component';
import { TermsPageComponent } from './pages/terms/terms.component';
import { ContactsPageComponent } from './pages/contacts/contacts.component';

const routes: Routes = [
  { path: 'fretboard', component: MainPageComponent },
  { path: 'privacy-policy', component: PolicyPageComponent },
  { path: 'terms-of-use', component: TermsPageComponent },
  { path: 'contacts', component: ContactsPageComponent },
  { path: 'not-found', loadChildren: './pages/not-found/not-found.module#NotFoundModule'},
  { path: '**', redirectTo: 'not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
