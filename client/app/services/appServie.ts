import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { IUser, ILoginCredentials } from '../models/model'

@Injectable({
    providedIn: 'root'
})

export class AppService {
    public user: IUser = null;
    constructor(private http: HttpClient) {
        this.user = this.getUser();
    }

    public registerUser(user: IUser): Observable<Object> {
        return this.http.post('user/register', user);
    }

    public login(creds: ILoginCredentials): Observable<Object> {
        return this.http.post('user/login', creds);
    }

    public getFriends(): Observable<Object> {
        let reqObj = {
            userId: this.user.id
        }
        return this.http.post('user/list', reqObj);
    }

    public getChats(usersObj): Observable<Object> {
        return this.http.post('user/chats', usersObj);
    }

    public getUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    public setUser(user: IUser) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    }

    public removeUser() {
        this.user = null;
        return localStorage.removeItem('user');
    }

    public isAuthenticated(): Boolean {
        return (this.user) ? true : false;
    }
}