import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../services/assessment.service';
import { SubjectService } from '../../services/subject.service';
import { Assessment, CreateAssessmentRequest, Subject as SubjectModel } from '../../models/assessment.model';
import { Subject as RxSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-assessments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessments.component.html',
  styleUrls: []
})
export class AssessmentsComponent implements OnInit, OnDestroy {
  assessments: Assessment[] = [];
  subjects: SubjectModel[] = [];
  showModal = false;
  editingRowId: number | null = null;
  loading = false;
  error: string | null = null;

  // Form data
  newAssessment: CreateAssessmentRequest = {
    subject: '',
    type: 'final exam',
    title: '',
    dueDate: ''
  };

  // Edit form data
  editData: { [key: string]: string } = {};

  assessmentTypes = [
    'final exam',
    'oral exam',
    'midterm exam',
    'course paper',
    'homework',
    'project',
    'quiz'
  ];

  private destroy$ = new RxSubject<void>();

  constructor(
    private assessmentService: AssessmentService,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    this.loadAssessments();
    this.loadSubjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAssessments(): void {
    this.loading = true;
    this.assessmentService.getAllAssessments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.assessments = data;
          this.loading = false;
          this.error = null;
        },
        error: (err) => {
          console.error('Error loading assessments:', err);
          this.error = 'Failed to load assessments';
          this.loading = false;
        }
      });
  }

  private loadSubjects(): void {
    this.subjectService.getAllSubjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.subjects = data;
          if (data.length > 0 && !this.newAssessment.subject) {
            this.newAssessment.subject = data[0].name;
          }
        },
        error: (err) => console.error('Error loading subjects:', err)
      });
  }

  openModal(): void {
    this.showModal = true;
    this.resetForm();
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  saveAssessment(): void {
    if (!this.newAssessment.subject || !this.newAssessment.type || !this.newAssessment.title) {
      this.error = 'Please fill all required fields';
      return;
    }

    this.loading = true;
    this.assessmentService.createAssessment(this.newAssessment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeModal();
          this.loadAssessments();
          this.error = null;
        },
        error: (err) => {
          console.error('Error creating assessment:', err);
          this.error = 'Error creating assessment';
          this.loading = false;
        }
      });
  }

  editRow(assessment: Assessment): void {
    this.editingRowId = assessment.id;
    this.editData = {
      title: assessment.title,
      createdOn: assessment.createdOn || '',
      dueDate: assessment.dueDate || '',
      doneOn: assessment.doneOn || '',
      grade: assessment.grade?.toString() || ''
    };
  }

  deleteRow(id: number): void {
    if (confirm('Are you sure you want to delete this assessment?')) {
      this.loading = true;
      this.assessmentService.deleteAssessment(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadAssessments();
            this.error = null;
          },
          error: (err) => {
            console.error('Error deleting assessment:', err);
            this.error = 'Error deleting assessment';
            this.loading = false;
          }
        });
    }
  }

  saveRow(id: number): void {
    this.loading = true;
    this.assessmentService.updateAssessment(id, this.editData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.editingRowId = null;
          this.loadAssessments();
          this.error = null;
        },
        error: (err) => {
          console.error('Error updating assessment:', err);
          this.error = 'Error updating assessment';
          this.loading = false;
        }
      });
  }

  cancelEdit(): void {
    this.editingRowId = null;
    this.editData = {};
  }

  private resetForm(): void {
    this.newAssessment = {
      subject: this.subjects.length > 0 ? this.subjects[0].name : '',
      type: 'final exam',
      title: '',
      dueDate: ''
    };
    this.error = null;
  }

  formatDate(date: string | null): string {
    if (!date) return '';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return date;
    }
  }
}