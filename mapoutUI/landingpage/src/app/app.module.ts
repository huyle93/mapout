import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes, Router}  from '@angular/router'
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MatInputModule, MatGridListModule, MatCardModule, MatMenuModule, MatIconModule, MatButtonModule, MatAutocompleteModule} from '@angular/material';
/* import { MaterialDashboardComponent } from './material-dashboard/material-dashboard.component'; */
import { LayoutModule } from '@angular/cdk/layout';
import { UserProfileComponent } from './user-profile/user-profile.component'
const registerRoutes: Routes = [{
    path: '',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  }
];
const loginRoutes: Routes = [{
    path: '',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  }
];



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent, 
    UserProfileComponent
    /* MaterialDashboardComponent */,    
  ],

  imports: [
    BrowserModule,
    FormsModule,
    MatInputModule,
    RouterModule.forRoot(registerRoutes),
    RouterModule.forChild(loginRoutes),
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    
    
    
  ],
  exports:[

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
