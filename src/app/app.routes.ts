import { Routes } from '@angular/router';
import { ExampleCompComponent } from './features/components/example-comp/example-comp.component';
import { LoginComponent } from './features/components/login/login.component';
import { RegisterComponent } from './features/components/register/register.component';
import { ExamplePageComponent } from './features/pages/example-page/example-page.component';
import { LandingComponent } from './features/pages/landing/landing.component';
export const routes: Routes = [
    {
        path: 'exmp', component: ExampleCompComponent
    },
    {
        path: 'page', component: ExamplePageComponent
    },
    {
        path: 'landing', component: LandingComponent
    },
    {
        path: 'register', component: RegisterComponent
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path:'',
        redirectTo: 'register',
        pathMatch: 'full'
    }
];
