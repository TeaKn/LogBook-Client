import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentService } from '../../services/assessment.service';
import { SubjectService } from '../../services/subject.service';
import { Subject as RxSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssessmentCountdown, Subject as SubjectModel, StatCard, ActivityFeedItem } from '../../models/assessment.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent implements OnInit, OnDestroy {
  greeting: string = '';
  subject: SubjectModel | null = null;
  assessments: AssessmentCountdown[] = [];
  statCards: StatCard[] = [];
  activityItems: ActivityFeedItem[] = [];

  private destroy$ = new RxSubject<void>();

  constructor(
    private assessmentService: AssessmentService,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    this.setGreeting();
    this.loadSubjects();
    this.loadAssessments();
    this.initStatCards();
    this.initActivityFeed();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setGreeting(): void {
    const hour = new Date().getHours();
    let greetingText = 'Good evening';
    if (hour < 12) greetingText = 'Good morning';
    else if (hour < 17) greetingText = 'Good afternoon';
    this.greeting = `${greetingText}, Tea`;
  }

  private loadSubjects(): void {
    this.subjectService.getAllSubjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (subjects) => {
          if (subjects.length > 0) {
            this.subject = subjects[0];
          }
        },
        error: (err) => console.error('Error loading subjects:', err)
      });
  }

  private loadAssessments(): void {
    this.assessmentService.getCurrentAssessments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.assessments = data;
        },
        error: (err) => console.error('Error loading assessments:', err)
      });
  }

  private initStatCards(): void {
    this.statCards = [
      {
        label: 'Mehanika',
        value: this.subject?.name || 'N/A',
        change: '+12.5% vs last period',
        isPositive: true
      },
      {
        label: 'Aktualno',
        value: 'Optimizacija, Numerične...',
        change: '+8.2% vs last period',
        isPositive: true
      },
      {
        label: 'Domače RAČ1',
        value: '30%',
        change: '-3.1% vs last period',
        isPositive: false
      },
      {
        label: 'Message',
        value: 'Light shines brightest in dark',
        change: '+0.8% vs last period',
        isPositive: true
      }
    ];
  }

  private initActivityFeed(): void {
    this.activityItems = [
      {
        type: 'blue',
        title: 'Podatkovne baze 1',
        subtitle: 'presentation at 13:30!',
        timeAgo: '2 minutes ago'
      },
      {
        type: 'green',
        title: 'Računalništvo 1',
        subtitle: 'congratulations, you completed Vaje - Verižni seznam 10 more to go! :D',
        timeAgo: '15 minutes ago'
      },
      {
        type: 'orange',
        title: 'Računalništvo 1',
        subtitle: 'study 0/1 Nahrbtnik',
        timeAgo: '1 hour ago'
      },
      {
        type: 'blue',
        title: 'Mehanika',
        subtitle: 'you retained 10% more on Togo gibanje since yesterday, good job!',
        timeAgo: '3 hours ago'
      },
      {
        type: 'green',
        title: 'Parcialne diferencialne enačbe',
        subtitle: 'Scheduled deployment completed successfully',
        timeAgo: '5 hours ago'
      }
    ];
  }
}