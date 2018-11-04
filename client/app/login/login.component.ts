import { Component } from "@angular/core";
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AppService } from '../services/appServie';
import { IResponse } from '../models/model';


@Component({
    templateUrl: './login.component.html'
})

export class LoginComponent {

    public loginForm: FormGroup;
    constructor(private router: Router,
        private fb: FormBuilder,
        private appServie: AppService) {
        this.loginForm = this.fb.group({
            email: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required])
        })
    }

    public register() {
        this.router.navigate(['/register'])
    }

    public doLogin() {
        this.appServie.login(this.loginForm.value).subscribe((response: IResponse) => {
            if (response.status === "SUCCESS") {
                this.appServie.setUser(response.data);
                this.router.navigate(['/chat']);
            } else {
                alert(response.message);
            }
        }, (error) => {
            console.log("Unable to login")
        });
    }
}