import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import * as io from "socket.io-client";
import { AppService } from '../services/appServie';
import { IResponse, IUser, IMessage } from '../models/model';

@Component({
    templateUrl: './chat.component.html'
})

export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
    public socket;
    public user;
    public users: IUser[];
    public selectedUser: IUser;
    public chats: IMessage[] = [];
    public chatContent: string;
    @ViewChild('scrollDiv') private messageContainer: ElementRef;


    constructor(private appService: AppService) {

    }

    ngOnInit() {
        this.user = this.appService.user
        let hostname = window.location.hostname;
        window.onfocus = ()=>{
            for (var i=0; i<this.chats.length; i++){
                if(this.chats[i].status != 3 && this.chats[i].to_user == this.user.id){
                    this.chats[i].status = 3
                    this.socket.emit("message-status-change", this.chats[i]);
                }
            }
        }
        //socket initialize
        this.socket = io(`http://${hostname}:4000`);

        //socket Evnets
        this.socket.on('new-message', this.onNewMeaage.bind(this))

        this.socket.on('new-user-added', this.updateUsers.bind(this));

        this.socket.on('response-users', this.onUserList.bind(this));

        this.socket.on('response-chats', this.onChatHistory.bind(this));

        this.socket.emit('request-users', { userId: this.user.id });

        this.socket.on('message-status-change', this.onMessageStatus.bind(this))
    }

    ngAfterViewChecked() {
        this.scrollSetToBottom();
    }

    ngOnDestroy(){
        this.removeSocketEvents();
        this.socket.close();
    }

    

    public sendMessage() {
        if (this.chatContent.trim() != '') {
            let chatMessage: IMessage = {
                to_user: this.selectedUser.id,
                from_user: this.user.id,
                message: this.chatContent
            }
            this.socket.emit("send-message", chatMessage);
            //this.chats.push(chatMessage);
            this.chatContent = '';
            this.scrollSetToBottom();
        } else {
            this.chatContent = '';
        }
    }

    public changeUser(user: IUser) {
        this.chatContent = '';
        this.selectedUser.active = false;
        user.active = true;
        user.notification = false;
        this.selectedUser = user;
        this.getChats();
    }

    public getChats() {
        let reqObj = {
            from_user: this.user.id,
            to_user: this.selectedUser.id
        }

        this.socket.emit('request-chats', reqObj);
    }

    private onNewMeaage(data) {
        if(data.message.from_user == this.user.id){
            this.chats.push(data.message);
        }
        console.log(data)
        if (data.message.to_user == this.user.id) {
            if (data.message.from_user == this.selectedUser.id) {
                data.message.status = 3;
                this.chats.push(data.message);
            } else {
                let sender = this.users.find(obj => obj.id == data.message.from_user);
                sender.notification = true;
            }
            data.message.status = 2;
            this.socket.emit("message-status-change", data.message);
        }

        this.scrollSetToBottom();
    }

    private onMessageStatus(data){
       let message = data.message;
        let msg = this.chats.find(obj => obj.id == message.id);
        msg.status = message.status;
    }

    private updateUsers(data) {
        this.users.push(data.message);
    }

    private onUserList(data) {
        if (data.userId == this.user.id) {
            this.users = data.users;
            this.selectedUser = this.users[0];
            this.selectedUser.active = true;
            this.getChats();
        }
    }

    private onChatHistory(data) {
        if (data.userId == this.user.id) {
            if(data.chats){
                this.chats = data.chats;

               for (var i=0; i<this.chats.length; i++){
                   if(this.chats[i].status != 3 && this.chats[i].to_user == this.user.id){
                       this.chats[i].status = 3
                       this.socket.emit("message-status-change", this.chats[i]);
                   }
               }
            } 
            this.scrollSetToBottom();
        }
    }

    private removeSocketEvents(){
        this.socket.off('new-message', this.onNewMeaage.bind(this))

        this.socket.off('new-user-added', this.updateUsers.bind(this));

        this.socket.off('response-users', this.onUserList.bind(this));

        this.socket.off('response-chats', this.onChatHistory.bind(this));
    }

    private scrollSetToBottom() {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    }
}