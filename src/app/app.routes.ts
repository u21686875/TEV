import { Routes } from '@angular/router';
import { ExampleCompComponent } from './features/components/example-comp/example-comp.component';
import { ExamplePageComponent } from './features/pages/example-page/example-page.component';
export const routes: Routes = [
    {
        path: 'exmp', component: ExampleCompComponent
    },
    {
        path: 'page', component: ExamplePageComponent
    }
];
