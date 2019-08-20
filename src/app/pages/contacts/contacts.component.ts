import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-contacts',
  templateUrl: 'contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})

export class ContactsPageComponent implements OnInit {
  formGroup: FormGroup;

  constructor(private emailService: EmailService, private snackBar: MatSnackBar) {
    this.formGroup = new FormGroup({
      'name': new FormControl(''),
      'email': new FormControl(''),
      'message': new FormControl('', [ Validators.required])
    });
  }

  ngOnInit() {}

  submit() {
    this.emailService.sendEmail(this.formGroup.value)
      .subscribe(() => {
        this.snackBar.open('Your email has been sent successfully', '', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }, () => {
        this.snackBar.open('An error occurred, try again later.', '', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      });

    this.formGroup.reset();
    this.formGroup.clearValidators();
  }
}
