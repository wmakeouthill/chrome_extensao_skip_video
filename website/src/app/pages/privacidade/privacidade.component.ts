import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacidade',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './privacidade.component.html',
  styleUrl: './privacidade.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacidadeComponent {}

