import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';

export interface FilterData {
  searchTerm: string;
  department: string;
  status: string;
}

@Component({
  selector: 'app-attendance-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzSelectModule, NzInputModule, NzButtonModule],
  templateUrl: './attendance-filters.component.html',
  styleUrls: ['./attendance-filters.component.scss']
})
export class AttendanceFiltersComponent implements OnInit {
  @Output() filtersChange = new EventEmitter<FilterData>();
  
  filterForm!: FormGroup;

  departments = [
    { value: '', label: 'All Departments' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'HR', label: 'HR' },
    { value: 'Finance', label: 'Finance' },
    { value: 'IT', label: 'IT' }
  ];

  statuses = [
    { value: '', label: 'All Status' },
    { value: 'Present', label: 'Present' },
    { value: 'Absent', label: 'Absent' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      department: [''],
      status: ['']
    });

    // Subscribe to form value changes
    this.filterForm.valueChanges.subscribe(values => {
      this.filtersChange.emit(values);
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  // Getters for easier template access
  get searchTerm(): FormControl {
    return this.filterForm.get('searchTerm') as FormControl;
  }

  get department(): FormControl {
    return this.filterForm.get('department') as FormControl;
  }

  get status(): FormControl {
    return this.filterForm.get('status') as FormControl;
  }
}
