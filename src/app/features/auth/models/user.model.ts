export interface User {
    id?: string;
    name: string;
    email: string;
    username: string;
    password: string;
    profileImage?: string;
    bio?: string;
    joinedDate: Date;
}
