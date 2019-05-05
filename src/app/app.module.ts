import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DataService } from './shared/DataService';
import { HttpClientModule} from '@angular/common/http';
import { MatSelectModule,MatStepperModule, MatInputModule, MatButtonModule, MatAutocompleteModule } from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressBarModule} from '@angular/material';
import {MatDialogModule} from '@angular/material';
import {NgxChartsModule} from '@swimlane/ngx-charts';



@NgModule({
  imports:[
    NgxChartsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatSelectModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatStepperModule,
    MatButtonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule],
  declarations:[
    AppComponent,
    AppRoutingModule.components],
  bootstrap:[
    AppComponent],
  providers:[
    DataService]
})
export class AppModule { }
