import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-chart',
  standalone: true,
  template: '<canvas #chartCanvas></canvas>',
  styles: [':host { display: block; }']
})
export class ChartComponent implements OnInit, OnChanges {
  @ViewChild('chartCanvas') canvas!: ElementRef;
  @Input() type: 'line' | 'bar' | 'pie' | 'doughnut' = 'bar';
  @Input() data: any = {};
  @Input() options: any = {};
  
  private chart: Chart | null = null;
  
  ngOnInit(): void {
    Chart.register(...registerables);
    this.createChart();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && (changes['data'] || changes['type'])) {
      this.destroyChart();
      this.createChart();
    }
  }
  
  private createChart(): void {
    if (!this.canvas) return;
    
    const ctx = this.canvas.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: this.type,
      data: this.data,
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Chart' }
        },
        ...this.options
      }
    });
  }
  
  destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
  
  exportImage(filename: string = 'chart'): void {
    if (!this.chart) return;
    
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = this.chart.toBase64Image();
    link.click();
  }
  
  getChartInstance(): Chart | null {
    return this.chart;
  }
}