import { Injectable } from '@angular/core';
import { User } from '../../features/shared/models/user.model';

interface PhoneNumber {
  countryCode: string;
  number: string;
}

interface LoginCredentials {
  type: 'email' | 'phone' | 'username';
  identifier: string | PhoneNumber;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private readonly countryConfigs = {
    'US': {
        code: '+1',
        pattern: /^\d{10}$/,
        format: (num: string) => `(${num.slice(0,3)}) ${num.slice(3,6)}-${num.slice(6)}`
    },
    'UK': {
        code: '+44',
        pattern: /^\d{10}$/,
        format: (num: string) => `${num.slice(0,4)} ${num.slice(4,7)} ${num.slice(7)}`
    }
  };

  constructor() { }

  register(user: User) {
    // Will connect to Supabase later
    console.log('Registering user:', user);
  }

    async login(credentials: LoginCredentials) {
      // This structure will make it easier to integrate with Supabase later
      console.log('Login attempt with:', credentials.type);

      try {
          switch (credentials.type) {
              case 'email':
                  // For now, simulate email login
                  console.log('Email login:', credentials.identifier);
                  break;

              case 'phone':
                  // Handle phone login
                  const phoneNumber = credentials.identifier as PhoneNumber;
                  const formattedPhone = this.formatPhoneNumber(
                      phoneNumber.countryCode,
                      phoneNumber.number
                  );
                  console.log('Phone login:', formattedPhone);
                  break;

              case 'username':
                  // Handle username login
                  console.log('Username login:', credentials.identifier);
                  break;

              default:
                  throw new Error('Unsupported login method');
          }

          // This structure will help when we add Supabase
          return {
              success: true,
              user: {
                  id: '1',
                  email: credentials.type === 'email' ? credentials.identifier : undefined,
                  username: credentials.type === 'username' ? credentials.identifier : undefined,
                  phone: credentials.type === 'phone' ? credentials.identifier : undefined
              }
          };

      } catch (error) {
          console.error('Login error:', error);
          throw error;
      }
  }

  formatPhoneNumber(countryCode: string, number: string): string {
    const country = Object.entries(this.countryConfigs)
        .find(([_, config]) => config.code === countryCode);
    
    if (!country) {
        return `${countryCode} ${number}`; // Basic formatting if country not found
    }

    return `${countryCode} ${country[1].format(number)}`;
}

// Helper method to validate phone numbers
validatePhoneNumber(countryCode: string, number: string): boolean {
    const country = Object.entries(this.countryConfigs)
        .find(([_, config]) => config.code === countryCode);
    
    if (!country) return false;
    return country[1].pattern.test(number);
}

// Will be useful when adding Supabase
private handleLoginError(error: any): never {
    // This will help standardize error handling when we add Supabase
    let message = 'An unexpected error occurred';
    
    if (error instanceof Error) {
        message = error.message;
    }
    
    throw new Error(message);
}
}
