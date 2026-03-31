import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { EmployeeListComponent } from '../employee-list/employee-list.component';

@Component({
  selector: 'app-employee-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzIconModule,
    EmployeeListComponent
  ],
  templateUrl: './employee-page.component.html',
  styleUrls: ['./employee-page.component.scss'],
})
export class EmployeePageComponent implements OnInit {
  
  constructor() {}

  ngOnInit(): void {
    // Initialize any required data
  }

  // Export functionality
  exportEmployees() {
    // This will be handled by the employee-list component
    console.log('Export employees functionality');
  }
}