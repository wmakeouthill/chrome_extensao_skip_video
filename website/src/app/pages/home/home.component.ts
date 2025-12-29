import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly plataformas = signal([
    'YouTube Shorts',
    'TikTok',
    'Instagram Reels',
    'Kwai',
    'Pinterest Watch',
    'Reddit',
    'X/Twitter',
    '9GAG',
    'Imgur',
    'Twitch Clips',
    'Tumblr',
    'Likee'
  ]);
}

