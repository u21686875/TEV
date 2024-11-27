import { Injectable } from '@angular/core';
import {User} from '../models/user.model'
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  register(user: User) {
    // Will connect to Supabase later
    console.log('Registering user:', user);
  }

  login(email: string, password: string) {
    // Will connect to Supabase later
    console.log("Logging in User:", email);
  }
}
