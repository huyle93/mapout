import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { first } from 'rxjs/operators';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username;
  password;
  constructor(public router: Router
   ) { }

  ngOnInit() {
  }
  
  loginuser(){
    console.log(this.username)
    console.log(this.password)
    if(this.username == "admin" && this.password == "password")
    {
      alert("succesful login")
      this.router.navigateByUrl('register')
    }
  else{
    alert("unsuccesful login")
  }

  }

}
