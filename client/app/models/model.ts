export interface IUser {
    email: string,
    name: string,
    id?: number,
    password?: string,
    active?: boolean,
    notification?: boolean
}

export interface IResponse {
    status: string,
    message?: string,
    data?: any
}

export interface ILoginCredentials {
    email: string;
    password: string;
}

export interface IMessage {
    from_user: number,
    to_user: number,
    message: string,
    id?: number;
    status?: number;
}

