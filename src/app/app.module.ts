import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FontPickerModule } from 'ngx-font-picker';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { CountService, FileManagerService, RichTextEditorAllModule, RichTextEditorModule } from '@syncfusion/ej2-angular-richtexteditor';
import { ToolbarService, LinkService, ImageService, PasteCleanupService, VideoService, AudioService, FormatPainterService, EmojiPickerService, TableService } from '@syncfusion/ej2-angular-richtexteditor';
import { HtmlEditorService, QuickToolbarService } from '@syncfusion/ej2-angular-richtexteditor';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MentionModule } from '@syncfusion/ej2-angular-dropdowns';
import { UploaderModule } from '@syncfusion/ej2-angular-inputs';
import {MatListModule} from '@angular/material/list';
@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatListModule,
    MatMenuModule,
    MatSelectModule,
    FontPickerModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RichTextEditorModule,
    UploaderModule,
    MentionModule,
    RichTextEditorAllModule,
    DialogModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),

  ],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, FileManagerService, EmojiPickerService, VideoService, AudioService, FormatPainterService, QuickToolbarService, PasteCleanupService, CountService],
  declarations: [AppComponent, DashboardComponent],
  bootstrap: [AppComponent],
})
export class AppModule { }
