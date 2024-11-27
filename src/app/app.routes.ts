import { Routes } from '@angular/router';
import { ExampleCompComponent } from './features/components/example-comp/example-comp.component';
import { ExamplePageComponent } from './features/pages/example-page/example-page.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
export const routes: Routes = [
    {
        path: 'exmp', component: ExampleCompComponent
    },
    {
        path: 'page', component: ExamplePageComponent
    },
    {
        path: 'register', component: RegisterComponent
    },
    {
        path:'',
        redirectTo: 'register',
        pathMatch: 'full'
    }
];
