import { Injectable } from '@angular/core';

interface PrintOptions {
  title?: string;
  styles?: string[];
  hideElements?: string[];
}

@Injectable({ providedIn: 'root' })
export class PrintService {
  printElement(element: HTMLElement, options?: PrintOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        reject(new Error('Popup blocked'));
        return;
      }
      
      const hideSelectors = options?.hideElements?.join(', ') || '';
      const clone = element.cloneNode(true) as HTMLElement;
      
      if (hideSelectors) {
        clone.querySelectorAll(hideSelectors).forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>${options?.title || 'Print'}</title>
            <style>
              body { margin: 20px; font-family: Arial, sans-serif; }
              @media print {
                .no-print { display: none !important; }
              }
              ${options?.styles?.join(' ') || ''}
            </style>
          </head>
          <body>${clone.innerHTML}</body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
          resolve();
        };
      };
    });
  }
  
  printHTML(html: string, title?: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head><title>${title || 'Print'}</title></head>
        <body>${html}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  }
  
  printTable(data: any[], columns: string[], title: string = 'Table'): void {
    let html = `<h2>${title}</h2><table border="1" style="width:100%">`;
    html += `<tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr>`;
    
    data.forEach(row => {
      html += `<tr>${columns.map(c => `<td>${row[c] || ''}</td>`).join('')}</tr>`;
    });
    
    html += '</table>';
    this.printHTML(html, title);
  }
}