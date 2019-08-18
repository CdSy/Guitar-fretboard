import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-contacts',
  templateUrl: 'contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})

export class ContactsPageComponent implements OnInit {
  formGroup: FormGroup;

  constructor() {
    this.formGroup = new FormGroup({
      'userName': new FormControl(''),
      'email': new FormControl(''),
      'message': new FormControl('', [ Validators.required])
    });
  }

  ngOnInit() {}

  submit() {
    console.log(this.formGroup);
  }
}
