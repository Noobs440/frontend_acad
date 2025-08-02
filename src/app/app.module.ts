import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { ProfileComponent } from './components/profile/profile.component';
import { EditNameComponent } from './components/profile/edit-name.component';
import { EditEmailComponent } from './components/profile/edit-email.component';
import { EditPasswordComponent } from './components/profile/edit-password.component';
import { EditPhotoComponent } from './components/profile/edit-photo.component';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home-components/home/home.component';
import { FooterComponent } from './shared/footer/footer.component';
import { NavComponent } from './shared/nav/nav.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { RegisterComponent } from './home-components/modals/register-popup/register-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogModule } from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'
import { AboutComponent } from './home-components/about/about.component';
import { ContactComponent } from './home-components/contact/contact.component';
import { TeamComponent } from './home-components/team/team.component';
import { RecentPostComponent } from './home-components/recent-post/recent-post.component';
import { TestimonialsComponent } from './home-components/testimonials/testimonials.component';
import { StatsComponent } from './home-components/stats/stats.component';
import { FaqsComponent } from './home-components/faqs/faqs.component';
import { ClientSectionComponent } from './home-components/client-section/client-section.component';
import { HeroSectionComponent } from './home-components/hero-section/hero-section.component';
import { PopCategoryComponent } from './home-components/pop-category/pop-category.component';
import { ProjectsComponent } from './home-components/projects/projects.component';
import { ProjectDetailComponent } from './home-components/project-detail/project-detail.component';
import { PopularProjectComponent } from './home-components/popular-project/popular-project.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { DefaultComponent } from './layouts/default/default.component';
import { LoginPopupComponent } from './home-components/modals/login-popup/login-popup.component';
import { OverlayOptionsComponent } from './home-components/overlay-options/overlay-options.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { OverlayModule } from '@angular/cdk/overlay';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CounterDirective } from './home-components/stats/counter.directive';
import { SafeUrlPipe } from './safe-url.pipe';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { HelpComponent } from './user/user-components/help/help.component';




// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    NavComponent,
    RegisterComponent,
    AboutComponent,
    ContactComponent,
    TeamComponent,
    RecentPostComponent,
    TestimonialsComponent,
    StatsComponent,
    FaqsComponent,
    ClientSectionComponent,
    HeroSectionComponent,
    PopCategoryComponent,
    ProjectsComponent,
    ProjectDetailComponent,
    PopularProjectComponent,
    LoaderComponent,
    LoginPopupComponent,
    DefaultComponent,
    OverlayOptionsComponent,
    CounterDirective,
    CounterDirective,
    SafeUrlPipe,
    ConfirmDialogComponent,
    EditEmailComponent,
    
  ],
  imports: [

     ProfileComponent,
    EditNameComponent,
    
    EditPasswordComponent,
    EditPhotoComponent,
    MatIconModule,
    BrowserModule,
    BrowserAnimationsModule ,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    ScrollingModule,
    OverlayModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
