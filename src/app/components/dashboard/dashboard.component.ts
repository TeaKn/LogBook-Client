import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentService } from '../../services/assessment.service';
import { SubjectService } from '../../services/subject.service';
import { Subject as RxSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssessmentCountdown, Subject as SubjectModel, StatCard, Assessment } from '../../models/assessment.model';
import { AssessmentAggregate, CreateLogRequest, FeedItem, Log } from 'src/app/models/dashboard.models';
import { FormsModule } from '@angular/forms';
import { LogService } from 'src/app/services/log.service';
import { NgChartsModule } from 'ng2-charts';
import { StatisticsService } from 'src/app/services/statistics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent implements OnInit, OnDestroy {
  greeting: string = '';
  subject: SubjectModel | null = null;
  assessmentsCountdown: AssessmentCountdown[] = [];
  assessments: Assessment[] = [];
  statCards: StatCard[] = [];
  activityItems: FeedItem[] = [];
  totalHoursStudiedBarChartData: any = [];
  totalHoursStudiedBarChartOptions: any = {
    responsive: true,
  };
  totalHoursStudiedPieChartData: any = [];
  studyTrendLineChartData: any = [];
  studyTrendLineChartOptions: any = {
    responsive: true,
    scales: {
      y: {
        suggestedMin: 0,
      }
    }
  };
  assessmentsByType: AssessmentAggregate[] = [];
  showModal = false;
  error: string | null = null;

  // Form data
  newLog: CreateLogRequest = {
    type: 'Track',
    assessmentId: '',
    title: '',
    trackedFrom: '',
    trackedTo: '',
    description: '',
    notes: ''
  };

  // Log types for the dropdown
  logTypes = [
    'Track',
    'Reminder',
    'Message'
  ];

  private destroy$ = new RxSubject<void>();

  constructor(
    private assessmentService: AssessmentService,
    private logService: LogService,
    private subjectService: SubjectService,
    private statisticsService: StatisticsService
  ) {}

  ngOnInit(): void {
    this.setGreeting();
    this.loadSubjects();
    this.loadCurrentAssessments();
    this.loadAssessments();
    this.loadTotalHoursStudied();
    this.loadStudyTrend();
    this.loadAssessmentsByType();
    this.initStatCards();
    this.initActivityFeed();
    this.logService.getLogs(5).pipe(takeUntil(this.destroy$)).subscribe();
  }
  private loadAssessments() {
    this.assessmentService.getAllAssessments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assessments) => {
          this.assessments = assessments;
        },
        error: (err) => console.error('Error loading assessments:', err)
      });
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

  openModal() {
    this.showModal = true;
    this.resetForm();
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  saveLog(): void {
    if (!this.newLog.assessmentId || !this.newLog.title) {
      this.error = 'Please fill in all required fields.';
      return;
    }

    console.log('Saving log:', this.newLog);
    this.logService.createLog(this.newLog)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Refresh statistics because they are calculated from logs
          this.loadTotalHoursStudied();
          this.loadStudyTrend();

          this.closeModal();
          // later add load logs here to refresh the list
          console.log('Log saved successfully');
          this.error = null;
        },
        error: (err: any) => {
          console.error('Error saving log:', err);
          this.error = 'Failed to save log. Please try again.';
        }
      });
    
  }

  // Statistics
  private loadTotalHoursStudied(): void {
    this.statisticsService
    .getTotalHoursStudied()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data)  => {
          this.totalHoursStudiedBarChartData = {
            labels: data.map(item => item.name),
            datasets: [
              {
                label: 'Study Hours',
                data: data.map(item => item.hours)
              }
            ],
          }

          const total_hours = data.reduce((sum, item) => sum + item.hours, 0);

          this.totalHoursStudiedPieChartData= {
            labels: this.totalHoursStudiedBarChartData.labels,
            datasets: [
              {
                data: this.totalHoursStudiedBarChartData.datasets[0].data.map((hours: number) => (hours / total_hours) * 100),
                backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
              }
            ]
          }
        },
        error: (error) => {
          console.error('Error loading total hours studied:', error);
        }
      });
  }

  private loadStudyTrend(): void {
    this.statisticsService
      .getTotalHoursStudiedByDay()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.studyTrendLineChartData = {
            labels: data.map(item => item.date),
            datasets: [
              {
                label: 'Study Hours',
                data: data.map(item => item.hours),
                fill: true,
                borderColor: 'rgba(0, 128, 0, 0.2)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
              }
            ]
          };
        },
        error: (error) => {
          console.error('Error loading study trend:', error);
        }
      });
  }

  private loadAssessmentsByType(): void {
    this.statisticsService
      .getAssessmentByType()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.assessmentsByType = data;
        },
        error: (error) => {
          console.error('Error loading assessments by type:', error);
        }
      });
  }


  private resetForm(): void {
    this.newLog = {
      type: 'Track',
      assessmentId: '',
      title: '',
      trackedFrom: '',
      trackedTo: '',
      description: '',
      notes: ''
    };
    this.error = null;
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

  private loadCurrentAssessments(): void {
    this.assessmentService.getCurrentAssessments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.assessmentsCountdown = data;
        },
        error: (err) => console.error('Error loading assessments:', err)
      });
  }

  private initStatCards(): void {
    this.statCards = [
      {
        label: 'Računalništvo 1 in 2',
        value: 'Dinamično programiranje', //this.subject?.name || 'N/A',
        change: 'to se uči v naslendjih dneh',
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
    this.logService.logs$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.activityItems = data.map(item => ({
            ...item,
            itemType:
              item.typeId === '1' ? 'blue' :
              item.typeId === '2' ? 'green' :
              item.typeId === '3' ? 'orange' :
              'not-recognized',
            description: item.description ?? ''
          }));
        },
        error: (err) => console.error('Error loading activity feed:', err)
      });
  }

  calculateTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }
}