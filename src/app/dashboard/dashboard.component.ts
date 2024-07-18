import {
  Component,
  NgZone,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GoogleFontsService } from 'src/service/googlefonts.service';
import 'html2pdf.js';
import { RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';

interface FontItem {
  text: string;
  value: string;
  command: string;
  subCommand: string;
}

interface FontFamily {
  default?: string;
  items: FontItem[];
}

interface Font {
  family: string;
  variants: string[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  noteTitle: string = '';
  note: string = '';
  savedNotes: {
    id: number;
    title: string;
    content: string;
    timestamp: Date;
    edited?: boolean;
    textDirection: boolean;
  }[] = [];
  selectedNote: {
    id: number;
    title: string;
    content: string;
    timestamp: Date;
    edited?: boolean;
    textDirection: boolean;
  } | null = null;

  isLink!: boolean;
  filteredFonts: any[] = [];
  originalFonts: any[] = [];
  searchTerm: string = '';
  loading: boolean = false;

  public tools: object = {
    type: 'Expand',
    items: [
      'Undo', 'Redo', '|',
      'Bold', 'Italic', 'Underline', 'StrikeThrough', '|',
      'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
      'SubScript', 'SuperScript', '|',
      'LowerCase', 'UpperCase', '|',
      'Formats', 'Alignments', '|', 'OrderedList', 'UnorderedList', '|',
      'Indent', 'Outdent', '|', 'CreateLink',
      'Image', 'CreateTable', '|', 'ClearFormat', '|', 'EmojiPicker', 'Print', 'SourceCode', '|', 'FullScreen']
  };

  // public fontFamily: Object = {
  //   items: [
  //     {text: "Roboto", value: "Roboto",  command: "Font", subCommand: "FontName"}, // here font is added
  //     {text: "Great vibes", value: "Great Vibes,cursive",  command: "Font", subCommand: "FontName"}, // here font is added
  //     {text: "Noto Sans", value: "Noto Sans",  command: "Font", subCommand: "FontName"},
  //   ]
  // };

  public fontFamily: FontFamily = {
    default: 'Roboto',
    items: []
  };
  fontsToLoad = ['Average Sans', 'Roboto', 'Montserrat', 'Open Sans', 'Liu Jian Mao Cao', 'Permanent Marker', 'Shadows Into Light', 'Great Vibes', 'Bungee', 'Crimson Text', 'Merriweather', 'Oswald', 'Inconsolata'];
  addFont: string = '';

  public quickTools: object = {
    image: [
      'Replace', 'Align', 'Caption', 'Remove', 'InsertLink', '-', 'Display', 'AltText', 'Dimension']
  };

  @ViewChild('noteDialogTemplate') noteDialogTemplate!: TemplateRef<any>;
  @ViewChild('noteHTMLDialogTemplate') noteHTMLDialogTemplate!: TemplateRef<any>;
  @ViewChild('viewNoteDialogTemplate')
  viewNoteDialogTemplate!: TemplateRef<any>;
  @ViewChild('editNoteDialogTemplate')
  editNoteDialogTemplate!: TemplateRef<any>;
  @ViewChild('editNormalNoteDialogTemplate')
  editNormalNoteDialogTemplate!: TemplateRef<any>;
  @ViewChild('confirmationDialogTemplate') confirmationDialogTemplate!: TemplateRef<any>;
  @ViewChild('addFontDialogTemplate') addFontDialogTemplate!: TemplateRef<any>;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
    private googleFontsService: GoogleFontsService
  ) {
    const isFonts = localStorage.getItem('Fonts');
    if (!isFonts) {
      const fontsToLoadJSON = JSON.stringify(this.fontsToLoad);
      localStorage.setItem('Fonts', fontsToLoadJSON);
    }
  }

  ngOnInit() {
    this.loadGoogleFonts();
    this.loadSavedNotes();
  }

  loadGoogleFonts(): void {
    const fontsToLoadJSON = localStorage.getItem('Fonts');
    let fontsToLoad: string[] = [];
    if (fontsToLoadJSON) {
      fontsToLoad = JSON.parse(fontsToLoadJSON);
    } else {
      fontsToLoad = this.fontsToLoad;
    }
    this.googleFontsService.getFonts().subscribe(
      (fonts: Font[]) => {
        // const fontFamilies:any = fonts.map(font => font.family);
        // this.googleFontsService.loadGoogleFonts(fontFamilies);
        this.googleFontsService.loadGoogleFonts(fontsToLoad);

        const filteredFonts: any = [];
        fonts.forEach(font => {
          if (fontsToLoad.includes(font.family)) {
            filteredFonts.push({
              text: font.family,
              value: `${font.family}`,
              command: 'Font',
              subCommand: 'FontName'
            });
            this.originalFonts = [...fonts];
          }
        });
        this.updateFontFamilyItems([...filteredFonts]);
      },
      error => {
        console.error('Error loading Google Fonts:', error);
      }
    );
  }

  get sanitizedContent(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.selectedNote?.content || '');
  }

  updateFontFamilyItems(fonts: any[]): void {
    this.ngZone.run(() => {
      this.fontFamily.items = [...fonts];
    });
  }

  openNote() {
    this.openNoteDialog();
    this.showSnackBar('Successfully switched to HTML Note');
  }

  openNoteDialog() {
    this.initializeDirection();
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(this.noteDialogTemplate);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'save') {
        this.saveNote();
      }
    });
  }

  openNormalNoteDialog() {
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(this.noteHTMLDialogTemplate);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'save') {
        this.saveNote();
      }
    });
    this.showSnackBar('Successfully switched to Normal Note');
  }

  viewNoteDialog(savedNote: {
    id: number;
    title: string;
    content: string;
    timestamp: Date;
    textDirection: boolean
  }) {
    this.selectedNote = savedNote;
    this.updateDirection(savedNote);
    this.initializeDirection(savedNote);

    const dialogRef = this.dialog.open(this.viewNoteDialogTemplate, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      panelClass: 'full-screen-dialog-container'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'edit') {
        this.editNote();
      } else if (result === 'delete') {
        this.deleteNote();
      }
    });
  }

  saveNote() {
    if (!this.note.trim()) {
      this.showSnackBar('Please enter any note to save');
      return;
    }
    if (this.note.trim()) {
      let title = this.noteTitle.trim();
      if (!title) {
        const untitledCount = this.savedNotes.filter((note) =>
          note.title.startsWith('Untitled')
        ).length;
        title = untitledCount > 0 ? `Untitled${untitledCount}` : 'Untitled';
      }
      this.savedNotes.push({
        id: this.generateUniqueId(),
        title: title,
        content: this.note.trim(),
        timestamp: new Date(),
        textDirection: false
      });
      this.saveNotesToLocalStorage();
      this.note = '';
      this.noteTitle = '';
      this.dialog.closeAll();
      this.showSnackBar(`"${title}" saved successfully`);
    }
    else {
      this.showSnackBar("Please enter any note to continue saving ");
    }
  }

  editNote() {
    this.dialog.closeAll();
    this.selectedNote ? this.selectedNote = { ...this.selectedNote } : null;
    if (this.isHtmlContent(this.selectedNote?.content)) {
      const dialogRef = this.dialog.open(this.editNoteDialogTemplate);
    } else {
      const dialogRef = this.dialog.open(this.editNormalNoteDialogTemplate);
    }
    console.log('Edit Note:', this.selectedNote);
  }

  updateNote() {
    if (!this.selectedNote || !this.selectedNote.content.trim()) {
      this.showSnackBar('Please enter any note to update');
      return;
    } if (!this.selectedNote.title.trim()) {
      this.showSnackBar('Title cannot be empty');
      return;
    }
    const index = this.savedNotes.findIndex(
      (note) => note.id === this.selectedNote?.id
    );
    if (index !== -1) {
      this.selectedNote.edited = true;
      this.selectedNote.timestamp = new Date();
      // this.selectedNote.textDirection = this.savedNote.textDirection;

      this.savedNotes[index] = { ...this.selectedNote };
      this.saveNotesToLocalStorage();
      this.dialog.closeAll();
      this.showSnackBar(`"${this.selectedNote.title}" updated successfully`);
    }
  }

  cancelNote() {
    this.dialog.closeAll();
    this.note = '';
    this.noteTitle = '';
  }

  deleteNote() {
    let deletedNoteTitle;
    if (this.selectedNote) {
      const index = this.savedNotes.findIndex(
        (note) => note.id === this.selectedNote?.id
      );
      if (index !== -1) {
        deletedNoteTitle = this.selectedNote.title;
        this.savedNotes.splice(index, 1);
        this.saveNotesToLocalStorage();
      }
      this.selectedNote = null;
    }
    this.dialog.closeAll();
    this.showSnackBar(deletedNoteTitle + ' deleted successfully');
  }

  private saveNotesToLocalStorage() {
    localStorage.setItem('savedNotes', JSON.stringify(this.savedNotes));
  }

  // exportToPDF(savedNote: any) {
  //   const title = savedNote.title.trim();
  //   const content = savedNote.content;

  //   if (this.isHtmlContent(content)) {
  //     const iframe = document.createElement('iframe');
  //     iframe.style.visibility = 'hidden';
  //     document.body.appendChild(iframe);

  //     iframe.onload = () => {
  //       const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
  //       iframeDocument?.open();
  //       iframeDocument?.write(`<h1>${title}</h1>${content}`);
  //       iframeDocument?.close();

  //       setTimeout(() => {
  //         html2canvas(iframeDocument?.body as HTMLElement, { scale: 2 }).then(canvas => {
  //           const imgData = canvas.toDataURL('image/jpeg', 1.0);

  //           const pdf = new jsPDF({ orientation: 'portrait',
  //             unit: 'pt',
  //             format: 'a4'});
  //           const width = pdf.internal.pageSize.getWidth();
  //           const height = pdf.internal.pageSize.getHeight();

  //           const imgWidth = width;
  //           const imgHeight = (canvas.height/6) * (imgWidth / (canvas.width/6));
  //           let position = 0;
  //           let totalPages = Math.ceil(canvas.height / (height * 6));

  //           for (let i = 0; i < totalPages; i++) {
  //             if (i > 0) {
  //               pdf.addPage();
  //             }

  //             pdf.addImage(imgData, 'JPEG', 0 , position , canvas.width/3, (canvas.height/3));

  //             position -= height;
  //           }

  //           pdf.save(`${savedNote.title}.pdf`);
  //           document.body.removeChild(iframe);
  //         });
  //       }, 1000);
  //     };

  //     iframe.src = 'Notifyy-app';
  //   }
  //   else if (!this.isLink) {
  //     const pdf = new jsPDF('p', 'pt', 'a4');
  //     const renderHtmlToPdf = (htmlContent: any, x: any, y: any) => {
  //       pdf.html(htmlContent, {
  //         callback: () => {
  //           pdf.save(`${savedNote.title}.pdf`);
  //           setTimeout(() => {
  //             this.showSnackBar(`"${savedNote.title}" downloaded successfully`);
  //           }, 3000);
  //         },
  //         x: x,
  //         y: y,
  //       });
  //     };
  //     const content = savedNote.content;

  //     pdf.text(savedNote.title, 10, 20);

  //     const tmpElement = document.createElement('DIV');
  //     tmpElement.innerHTML = content;

  //     const anchors = tmpElement.querySelectorAll('a');
  //     anchors.forEach(anchor => anchor.getAttribute('title'));

  //     const sanitizedContent = tmpElement.innerHTML;

  //     renderHtmlToPdf(sanitizedContent, 10, 50);
  //   }
  //   else {
  //     const doc = new jsPDF();
  //     doc.text(title, 10, 10);
  //     doc.text(content, 10, 20);
  //     doc.save(`${title}.pdf`);

  //     setTimeout(() => {
  //       this.showSnackBar(`"${savedNote.title}" downloaded successfully`);
  //     }, 3000);
  //   }
  // }

  exportToPDF(savedNote: any) {
    const title = savedNote.title.trim();
    let content = savedNote.content.trim();

    const textDirection = savedNote.textDirection;

    if(textDirection) {
      content = `<div style="direction:rtl">${content}</div>`
    }

    if (this.isHtmlContent(content)) {
      const contentElement = document.createElement('div');
      contentElement.innerHTML = content;
      document.body.appendChild(contentElement);
      this.loading = true;

      html2canvas(contentElement, { scale: 1.5 }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4'
        });
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();

        const imgWidth = width;
        let imgHeight = (canvas.height) * (imgWidth / (canvas.width));
        let position = 10;
        let totalPages = Math.ceil(canvas.height / (height * 6));

        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage();
            position = 10;
          }
          pdf.addImage(imgData, 'JPEG', position, 10, imgWidth - 20, imgHeight);
          position -= height;
        }

        pdf.save(`${savedNote.title}.pdf`);
        document.body.removeChild(contentElement);
        this.loading = false;
        this.showSnackBar(`"${savedNote.title}" downloaded successfully`);
      });
    }
    else if (!this.isLink) {
      const pdf = new jsPDF('p', 'pt', 'a4');
      this.loading = true;
      const renderHtmlToPdf = (htmlContent: any, x: any, y: any) => {
        pdf.html(htmlContent, {
          callback: () => {
            pdf.save(`${savedNote.title}.pdf`);
            this.loading = false;
            this.showSnackBar(`"${savedNote.title}" downloaded successfully`);
          },
          x: x,
          y: y,
        });
      };
      const content = savedNote.content;

      const tmpElement = document.createElement('DIV');
      tmpElement.innerHTML = content;

      const anchors = tmpElement.querySelectorAll('a');
      anchors.forEach(anchor => anchor.getAttribute('title'));

      const sanitizedContent = tmpElement.innerHTML;

      renderHtmlToPdf(sanitizedContent, 10, 40);
    }
    else {
      const doc = new jsPDF();
      this.loading = true;

      const maxWidth = 180;
      let fontSize = 12;
      doc.setFontSize(fontSize);

      let textLines = doc.splitTextToSize(content, maxWidth);

      let pageWidth = doc.internal.pageSize.width;
      let pageHeight = doc.internal.pageSize.height;

      let y = 10;

      function addNewPage() {
        doc.addPage();
        y = 10;
      }

      textLines.forEach((line: any, index: any) => {
        let remainingPageSpace = pageHeight - y;

        if (doc.getTextDimensions(line).h > remainingPageSpace) {
          addNewPage();
        }

        doc.text(line, 10, y);
        y += doc.getTextDimensions(line).h + 2;
      });
      doc.save(`${title}.pdf`);

      this.loading = false;
      this.showSnackBar(`"${savedNote.title}" downloaded successfully`);
    }
  }

  isHtmlContent(content: string | undefined): boolean {
    if (!content) return false;
    const trimmedContent = content.trim().toLowerCase();
    if (trimmedContent.includes('<p><a ')) {
      return this.isLink = false;
    } else {
      this.isLink = true;
    }
    const htmlTagsWithStyles = [
      '<html>', '<!doctype html>', '<div>', '<p>', '<span>', '<h1', '<h2', '<h3', '<h4', '<h5', '<h6', '<table>',
      '<table class=', '<tbody><tr><td class=', '<td class=', '<td style=', '<ul>', '<ol>', '<li>', '<blockquote>', '<pre>', '<code>', '<img>', '<a ', '<strong>',
      '<em>', '<style>', '<h1 style=', '<h2 style=', '<h3 style=', '<h4 style=', '<h5 style=', '<h6 style=',
      '<p style=', '<div style=', '<span style=', '<table style=', '<p style=', '<em style=', '<strong style=',
      '<a style=', '<pre style=', '<html style=', '<p><img src=', '<div style=', '<br>', '<div'
    ];
    return htmlTagsWithStyles.some(tag => trimmedContent.startsWith(tag));
  }

  deleteAll() {
    const dialogRef = this.dialog.open(this.confirmationDialogTemplate);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performDeleteAll();
      }
    });
  }

  confirmDelete() {
    this.performDeleteAll();
  }

  openFontDialog() {
    const dialogRef = this.dialog.open(this.addFontDialogTemplate, {
      width: '90%',
      height: '300px'
    });
  }

  addCustomFont(font: string): void {
    if (font && !this.fontsToLoad.includes(font)) {
      this.fontsToLoad.push(font);
      localStorage.setItem('Fonts', JSON.stringify(this.fontsToLoad));
      this.loadGoogleFonts();
      setTimeout(() => {
        this.showSnackBar(`${font} font is successfully added.Please reopen the editor.`);
      }, 3000)
    } else {
      this.showSnackBar('Please enter a valid font name');
    }
    this.searchTerm = '';
    this.dialog.closeAll();
  }

  toggleDirection(note?: any) {
    // This method is only applicable for edit note since we need an object to perform that action where create note doesn't contain that object in localstorage
    if (note) {
      note.textDirection = !note.textDirection;
      this.updateDirection(note);
      note.textDirection ? this.showSnackBar('Text will be right to left') : this.showSnackBar('Text will be left to right');
    }
  }

  initializeDirection(note?: any) {
    if (note?.textDirection) {
      const root = document.documentElement;
      root.style.setProperty('--direction', 'rtl');
    } else {
      const root = document.documentElement;
      root.style.setProperty('--direction', 'ltr');
    }
  }

  updateDirection(note: any) {
    const root = document.documentElement;
    root.style.setProperty('--direction', note.textDirection ? 'rtl' : 'ltr');
  }

  filterFonts(): void {
    if (this.searchTerm.trim() !== '') {
      const filtered = this.originalFonts.filter(font =>
        font.family.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      this.filteredFonts = [...filtered];
    } else {
      this.filteredFonts = [...this.originalFonts];
    }
  }

  selectFont(font: any): void {
    this.addFont = font.family;
    this.searchTerm = font.family;
    this.filteredFonts = [];
  }

  private performDeleteAll() {
    this.savedNotes = [];
    this.saveNotesToLocalStorage();
    this.showSnackBar('All notes deleted successfully');
    this.dialog.closeAll();
  }


  private loadSavedNotes() {
    const savedNotesJson = localStorage.getItem('savedNotes');
    if (savedNotesJson) {
      this.savedNotes = JSON.parse(savedNotesJson);
    }
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 900,
    });
  }

  padStart(
    input: string,
    targetLength: number,
    padString: string = '0'
  ): string {
    while (input.length < targetLength) {
      input = padString + input;
    }
    return input;
  }

  private generateUniqueId(): number {
    return new Date().getTime();
  }

}
