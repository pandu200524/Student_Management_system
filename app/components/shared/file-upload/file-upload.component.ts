import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-upload">
      <input type="file" [multiple]="multiple" [accept]="accept" 
             (change)="onFileSelected($event)" #fileInput hidden>
      
      <div class="drop-zone" (click)="fileInput.click()" 
           (dragover)="onDragOver($event)" (drop)="onDrop($event)">
        <div class="upload-icon">📁</div>
        <p>{{ placeholder }}</p>
        <small>Max size: {{ maxSize / 1024 / 1024 }}MB</small>
      </div>
      
      <div class="file-list" *ngIf="files.length > 0">
        <div class="file-item" *ngFor="let file of files; let i = index">
          <span>{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
          <button (click)="removeFile(i)">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .file-upload { border: 2px dashed #ccc; padding: 20px; border-radius: 8px; }
    .drop-zone { text-align: center; cursor: pointer; padding: 30px; }
    .upload-icon { font-size: 48px; margin-bottom: 10px; }
    .file-list { margin-top: 20px; }
    .file-item { display: flex; justify-content: space-between; 
                align-items: center; padding: 8px; border-bottom: 1px solid #eee; }
    .file-size { color: #666; font-size: 12px; }
    button { background: #f44336; color: white; border: none; 
            border-radius: 50%; width: 24px; height: 24px; cursor: pointer; }
  `]
})
export class FileUploadComponent {
  @Input() multiple = false;
  @Input() accept = '*/*';
  @Input() maxSize = 10 * 1024 * 1024; // 10MB
  @Input() placeholder = 'Click or drag files here';
  @Output() filesSelected = new EventEmitter<File[]>();
  
  files: File[] = [];
  
  onFileSelected(event: any): void {
    const selectedFiles = Array.from(event.target.files) as File[];
    this.processFiles(selectedFiles);
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.add('dragover');
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.remove('dragover');
    
    const files = Array.from(event.dataTransfer?.files || []);
    this.processFiles(files);
  }
  
  private processFiles(selectedFiles: File[]): void {
    const validFiles: File[] = [];
    
    selectedFiles.forEach(file => {
      if (file.size <= this.maxSize) {
        validFiles.push(file);
      }
    });
    
    if (this.multiple) {
      this.files.push(...validFiles);
    } else {
      this.files = validFiles.slice(0, 1);
    }
    
    this.filesSelected.emit(this.files);
  }
  
  removeFile(index: number): void {
    this.files.splice(index, 1);
    this.filesSelected.emit(this.files);
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  clearFiles(): void {
    this.files = [];
    this.filesSelected.emit([]);
  }
}