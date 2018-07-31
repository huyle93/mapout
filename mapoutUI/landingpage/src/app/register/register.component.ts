import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import {Observable} from 'rxjs';
import { first, map, startWith } from 'rxjs/operators';

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
  myControl = new FormControl();
  myControlcarmodel = new FormControl();
  options: string[] = ['Toyota', 'Honda', 'Mercedes', 'Lamborghini', 'Ford', 'a', 'b', 'c', 'd']
  optionsCarmodel: string[] = ['Camry', 'Accord', 'Benz', 'Gallardo', 'F4', 'a', 'b', 'c', 'd']
//////////////////////////////////////////////////////////////////////////////////////////////////
  filteredOptions: Observable<string[]>;
  filteredOptionscarmodel :Observable<string[]>;
  constructor(public router: Router) { }
  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter(value))
    );
    this.filteredOptionscarmodel = this.myControlcarmodel.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filterCarmodel(value))
    );
  }
  //filter the list
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  private _filterCarmodel(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.optionsCarmodel.filter(optionsCarmodel => optionsCarmodel.toLowerCase().includes(filterValue));
  }

  registeruser(){

  }
  validate(){
    this.year = this.year.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  }
  
  

}
