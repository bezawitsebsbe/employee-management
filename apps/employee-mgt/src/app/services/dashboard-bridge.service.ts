import { Injectable } from '@angular/core';
import { effect } from '@angular/core';
import { DashboardService } from '@employee-payroll/features';
import { PayrollFacadeService } from '../features/payroll/facades/payroll.facade.service';
import { EmployeeSimpleFacade } from '../features/employee/facades/employee-simple.facade';

@Injectable({
  providedIn: 'root'
})
export class DashboardBridgeService {
  constructor(
    private dashboardService: DashboardService,
    private payrollFacade: PayrollFacadeService,
    private employeeFacade: EmployeeSimpleFacade
  ) {
    console.log('DashboardBridgeService initialized');
    this.initializeDataBridge();
    
    // Load data explicitly if not already loaded
    setTimeout(() => {
      this.loadAndPushData();
    }, 100);
    
    // Also push data every 2 seconds to ensure updates
    setInterval(() => {
      this.loadAndPushData();
    }, 2000);
  }

  private loadAndPushData(): void {
    console.log('=== loadAndPushData called ===');
    
    // Get current data states
    const rawEmployees = this.employeeFacade.employees();
    const employeeSummary = this.employeeFacade.summary();
    const filteredEmployees = this.employeeFacade.filteredEmployees();
    const payrollData = this.payrollFacade.payrollData$();
    
    console.log('Current data states:', {
      rawEmployees: rawEmployees,
      employeeSummary: employeeSummary,
      filteredEmployees: filteredEmployees,
      payrollData: payrollData
    });
    
    // Push employee data immediately - use raw employees signal
    if (rawEmployees && rawEmployees.length >= 0) {
      const employeeData = { length: rawEmployees.length };
      console.log('Pushing employee data to dashboard:', employeeData);
      this.dashboardService.updateEmployeeData(employeeData);
    }
    
    // Explicitly load payroll data if not loaded
    if (!payrollData || !payrollData.records || payrollData.records.length === 0) {
      console.log('Loading payroll data...');
      this.payrollFacade.loadPayrollData();
      
      // Wait a moment for data to load, then push
      setTimeout(() => {
        this.pushPayrollData();
      }, 500);
    } else {
      console.log('Payroll data already loaded, pushing current data...');
      this.pushPayrollData();
    }
  }

  private pushPayrollData(): void {
    const payrollData = this.payrollFacade.payrollData$();
    console.log('Current payroll data in pushPayrollData:', payrollData);
    
    // Check if payroll data has actual records
    if (payrollData && payrollData.records && payrollData.records.length > 0) {
      console.log('Calling dashboardService.updatePayrollData with:', payrollData);
      this.dashboardService.updatePayrollData(payrollData);
    } else {
      console.log('No payroll data available to push');
    }
  }

  private initializeDataBridge(): void {
    // Bridge payroll data - use computed signal for real-time updates
    effect(() => {
      const payrollData = this.payrollFacade.payrollData$();
      console.log('Payroll data in bridge:', payrollData);
      if (payrollData && payrollData.records && payrollData.records.length > 0) {
        console.log('Calling dashboardService.updatePayrollData with real data:', payrollData);
        this.dashboardService.updatePayrollData(payrollData);
      }
    });

    // Bridge raw employee data for real-time updates - PRIMARY SOURCE
    effect(() => {
      const rawEmployees = this.employeeFacade.employees();
      console.log('Raw employees in bridge:', rawEmployees);
      if (rawEmployees && rawEmployees.length >= 0) {
        const employeeData = {
          length: rawEmployees.length
        };
        console.log('Calling dashboardService.updateEmployeeData from bridge with raw:', employeeData);
        this.dashboardService.updateEmployeeData(employeeData);
      }
    });

    // Also bridge filtered employees for additional tracking
    effect(() => {
      const filteredEmployees = this.employeeFacade.filteredEmployees();
      console.log('Filtered employees in bridge:', filteredEmployees);
      if (filteredEmployees && filteredEmployees.length >= 0) {
        const employeeData = {
          length: filteredEmployees.length
        };
        console.log('Calling dashboardService.updateEmployeeData from bridge with filtered:', employeeData);
        this.dashboardService.updateEmployeeData(employeeData);
      }
    });

    // Bridge employee summary for additional confirmation
    effect(() => {
      const employeeSummary = this.employeeFacade.summary();
      console.log('Employee summary in bridge:', employeeSummary);
      if (employeeSummary) {
        const employeeData = {
          length: employeeSummary.totalEmployees
        };
        console.log('Calling dashboardService.updateEmployeeData from bridge with summary:', employeeData);
        this.dashboardService.updateEmployeeData(employeeData);
      }
    });
  }
}
