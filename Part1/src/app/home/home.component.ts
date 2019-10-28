import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { User } from '../models/user.model';
import { UserService, AuthenticationService } from '../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentUser: User;
  users = [];
  editForm: FormGroup;
  //current user being edited
  edited:Number = null;
  constructor(
      private authenticationService: AuthenticationService,
      private userService: UserService,
      private formBuilder: FormBuilder,
  ) {
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    this.loadAllUsers();
    this.editForm = this.formBuilder.group({
      userName: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  deleteUser(id: number) {
    this.userService.delete(id)
        .pipe(first())
        .subscribe(() => this.loadAllUsers());
  }

  private loadAllUsers() {
    this.userService.getAll()
        .pipe(first())
        .subscribe(users => this.users = users);
  }

  editUserName(index:number){
    this.editForm.reset();    
    this.edited = index;
  }

  cancelEdit(){
    this.edited = null;
  }

  onSubmit(user){
    this.userService.editUserName(this.editForm.get('userName').value, user)
    .subscribe(newName => newName)
    this.edited = null;
  } 

}
