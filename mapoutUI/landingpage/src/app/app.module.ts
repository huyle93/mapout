import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes, Router}  from '@angular/router'
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ServicesComponent } from './services/services.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [{path:'', component:LoginComponent},
{path:'register',component: RegisterComponent}];


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ServicesComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
