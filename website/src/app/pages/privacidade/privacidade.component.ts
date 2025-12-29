import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacidade',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacidade.component.html',
  styleUrl: './privacidade.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacidadeComponent {}

