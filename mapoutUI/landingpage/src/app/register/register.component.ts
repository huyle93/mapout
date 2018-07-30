import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  firstname
  lastname
  carmake
  carmodel
  year
  username
  password

  constructor(public router: Router) { }

  ngOnInit() {
  }
  registeruser(){

  }

}
