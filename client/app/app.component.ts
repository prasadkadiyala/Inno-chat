import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from './services/appServie';
import { IUser } from './models/model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(private appService: AppService, private router: Router) {

  }

  public logout() {

    this.appService.removeUser();
    this.router.navigate(['login'])


  }
}
