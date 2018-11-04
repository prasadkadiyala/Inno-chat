import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../services/appServie';
import { IUser, IResponse } from '../models/model';

@Component({
    templateUrl: './register.component.html'
})

export class RegisterComponent {
    public registerForm: FormGroup;
    constructor(private fb: FormBuilder,
        private appService: AppService,
        private router: Router) {
        this.registerForm = this.fb.group({
            email: new FormControl('', [Validators.required, Validators.email]),
            name: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required, Validators.minLength(6)]),
            repassword: new FormControl('', [Validators.required, Validators.minLength(6)])
        }, { validator: this.passwordMatchValidator });
    }

    public registerUser() {
        let user: IUser = this.registerForm.value;
        this.appService.registerUser(user).subscribe((response: IResponse) => {
            if (response.status === "SUCCESS") {
                this.router.navigate(['\login']);
            } else {
                alert(response.message);
            }
        }, (error) => {
            console.log("Unable to create user")
        })
    }

    private passwordMatchValidator(group: FormGroup) {
        return group.controls['password'].value === group.controls['repassword'].value ? null : { 'mismatch': true };
    }
}
