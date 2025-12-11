import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notes-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notes-editor">
      <div class="editor-header">
        <h3>{{ title }}</h3>
        <div class="toolbar">
          <button (click)="toggleView()">{{ showPreview ? 'Edit' : 'Preview' }}</button>
          <button (click)="save()" [disabled]="!notes">Save</button>
          <button (click)="clear()">Clear</button>
        </div>
      </div>
      
      <div class="editor-body">
        <textarea *ngIf="!showPreview" [(ngModel)]="notes" 
                  placeholder="Type your notes here..."></textarea>
        
        <div *ngIf="showPreview" class="preview" [innerHTML]="formatNotes(notes)"></div>
      </div>
      
      <div class="editor-footer">
        <small>Characters: {{ getCharacterCount() }}</small>
        <small>Last saved: {{ lastSaved | date:'short' }}</small>
      </div>
    </div>
  `,
  styles: [`
    .notes-editor { border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
    .editor-header { display: flex; justify-content: space-between; margin-bottom: 16px; }
    .toolbar button { margin-left: 8px; padding: 6px 12px; }
    textarea { width: 100%; height: 200px; padding: 12px; border: 1px solid #ccc; }
    .preview { padding: 12px; border: 1px solid #ccc; min-height: 200px; }
    .editor-footer { display: flex; justify-content: space-between; margin-top: 12px; color: #666; }
  `]
})
export class NotesEditorComponent implements OnInit {
  @Input() title = 'Notes';
  @Input() initialNotes = '';
  @Output() onSave = new EventEmitter<string>();
  
  notes = '';
  showPreview = false;
  lastSaved = new Date();
  
  ngOnInit(): void {
    this.notes = this.initialNotes;
  }
  
  getCharacterCount(): number {
    return this.notes ? this.notes.length : 0;
  }
  
  save(): void {
    this.lastSaved = new Date();
    this.onSave.emit(this.notes);
  }
  
  clear(): void {
    if (confirm('Clear all notes?')) {
      this.notes = '';
    }
  }
  
  toggleView(): void {
    this.showPreview = !this.showPreview;
  }
  
  formatNotes(text: string): string {
    if (!text) return '';
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }
}