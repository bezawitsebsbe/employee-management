// apps/portal/employee-portal/src/app/features/employee/api/employee.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Employee, EmployeeAttendance } from './employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  // Make service globally accessible
  static instance: EmployeeService;

  private mockEmployees: Employee[] = [
    {
      id: '1',
      empId: 'EMP001',
      fullName: 'John Doe',
      initials: 'JD',
      email: 'john.doe@company.com',
      phone: '+1234-567-8900',
      department: 'Sales',
      position: 'Senior Sales Manager',
      joinDate: '15/01/2023',
      status: 'Active',
      performance: 95,
      baseSalary: 5000,
      avatarColor: '#fadb14',
    },
    {
      id: '2',
      empId: 'EMP002',
      fullName: 'Sara Smith',
      initials: 'SS',
      email: 'sara.smith@company.com',
      phone: '+1234-567-8911',
      department: 'Marketing',
      position: 'Marketing Lead',
      joinDate: '10/02/2023',
      status: 'Active',
      performance: 88,
      baseSalary: 4200,
      avatarColor: '#ff7875',
    },
    {
      id: '3',
      empId: 'EMP003',
      fullName: 'Mike Johnson',
      initials: 'MJ',
      email: 'mike.johnson@company.com',
      phone: '+1234-567-8922',
      department: 'Sales',
      position: 'Sales Representative',
      joinDate: '05/03/2023',
      status: 'Active',
      performance: 92,
      baseSalary: 3800,
      avatarColor: '#95de64',
    },
    {
      id: '4',
      empId: 'EMP004',
      fullName: 'Emma Wilson',
      initials: 'EW',
      email: 'emma.wilson@company.com',
      phone: '+1234-567-8933',
      department: 'HR',
      position: 'HR Manager',
      joinDate: '20/01/2023',
      status: 'Active',
      performance: 97,
      baseSalary: 4800,
      avatarColor: '#69c0ff',
    },
    {
      id: '5',
      empId: 'EMP005',
      fullName: 'Liam Brown',
      initials: 'LB',
      email: 'liam.brown@company.com',
      phone: '+1234-567-8944',
      department: 'Finance',
      position: 'Finance Analyst',
      joinDate: '12/04/2023',
      status: 'Active',
      performance: 85,
      baseSalary: 4500,
      avatarColor: '#ffc53d',
    },
  ];

  private mockAttendanceData: EmployeeAttendance[] = [
    {
      employeeId: '1',
      name: 'John Doe',
      department: 'Sales',
      checkin: '09:01 AM',
      checkout: '05:12 PM',
      hours: '8h 11m',
      status: 'Present',
    },
    {
      employeeId: '2',
      name: 'Sara Smith',
      department: 'Marketing',
      checkin: '09:20 AM',
      checkout: '05:00 PM',
      hours: '7h 40m',
      status: 'Late',
    },
    {
      employeeId: '3',
      name: 'Mike Johnson',
      department: 'Sales',
      checkin: '08:45 AM',
      checkout: '05:15 PM',
      hours: '8h 30m',
      status: 'Present',
    },
    {
      employeeId: '4',
      name: 'Emma Wilson',
      department: 'HR',
      checkin: '-',
      checkout: '-',
      hours: '-',
      status: 'Absent',
    },
    {
      employeeId: '5',
      name: 'Liam Brown',
      department: 'Finance',
      checkin: '09:00 AM',
      checkout: '05:30 PM',
      hours: '8h 30m',
      status: 'Present',
    },
  ];

  constructor() {
    EmployeeService.instance = this;
    this.loadFromStorage();
    
    // If no data was loaded from storage, initialize with defaults
    if (this.mockEmployees.length === 0) {
      console.log('No employees loaded, initializing with defaults...');
      this.initializeDefaultData();
    }
  }

  private loadFromStorage(): void {
    try {
      console.log('Loading data from storage...');
      console.log('localStorage available:', typeof localStorage !== 'undefined');
      console.log('sessionStorage available:', typeof sessionStorage !== 'undefined');
      
      // Try localStorage first
      let storedEmployees = localStorage.getItem('employees');
      let storedAttendance = localStorage.getItem('attendance');
      let storageType = 'localStorage';
      
      // If localStorage is empty, try sessionStorage
      if (!storedEmployees) {
        console.log('localStorage empty, trying sessionStorage...');
        storedEmployees = sessionStorage.getItem('employees');
        storedAttendance = sessionStorage.getItem('attendance');
        storageType = 'sessionStorage';
      }
      
      console.log(`Loading from ${storageType}:`, {
        employees: storedEmployees,
        attendance: storedAttendance
      });
      
      if (storedEmployees) {
        try {
          const parsedEmployees = JSON.parse(storedEmployees);
          if (Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
            this.mockEmployees = parsedEmployees;
            console.log(`Successfully loaded employees from ${storageType}:`, this.mockEmployees.length);
          } else {
            console.log(`Invalid employee data in ${storageType}, using defaults`);
          }
        } catch (parseError) {
          console.error(`Error parsing employees from ${storageType}:`, parseError);
          console.log('Using default employee data');
        }
      } else {
        console.log(`No employees found in ${storageType}, using defaults`);
      }
      
      if (storedAttendance) {
        try {
          const parsedAttendance = JSON.parse(storedAttendance);
          if (Array.isArray(parsedAttendance)) {
            this.mockAttendanceData = parsedAttendance;
            console.log(`Successfully loaded attendance from ${storageType}:`, this.mockAttendanceData.length);
          } else {
            console.log(`Invalid attendance data in ${storageType}, using defaults`);
          }
        } catch (parseError) {
          console.error(`Error parsing attendance from ${storageType}:`, parseError);
          console.log('Using default attendance data');
        }
      } else {
        console.log(`No attendance found in ${storageType}, using defaults`);
      }
    } catch (error) {
      console.error('Critical error loading from storage:', error);
      console.log('Using default data as fallback');
    }
  }

  private saveToStorage(): void {
    try {
      console.log('Attempting to save data to localStorage...', {
        employeesCount: this.mockEmployees.length,
        attendanceCount: this.mockAttendanceData.length
      });
      
      // Try localStorage first
      localStorage.setItem('employees', JSON.stringify(this.mockEmployees));
      localStorage.setItem('attendance', JSON.stringify(this.mockAttendanceData));
      
      // Verify save was successful
      const verifyEmployees = localStorage.getItem('employees');
      const verifyAttendance = localStorage.getItem('attendance');
      
      const localStorageSuccess = 
        verifyEmployees === JSON.stringify(this.mockEmployees) &&
        verifyAttendance === JSON.stringify(this.mockAttendanceData);
      
      console.log('localStorage save verification:', {
        employeesSaved: localStorageSuccess,
        employeesStored: verifyEmployees,
        employeesExpected: JSON.stringify(this.mockEmployees)
      });
      
      // If localStorage failed, try sessionStorage
      if (!localStorageSuccess) {
        console.log('localStorage failed, trying sessionStorage...');
        sessionStorage.setItem('employees', JSON.stringify(this.mockEmployees));
        sessionStorage.setItem('attendance', JSON.stringify(this.mockAttendanceData));
        
        const sessionVerifyEmployees = sessionStorage.getItem('employees');
        const sessionVerifyAttendance = sessionStorage.getItem('attendance');
        
        console.log('sessionStorage save verification:', {
          employeesSaved: sessionVerifyEmployees === JSON.stringify(this.mockEmployees),
          employeesStored: sessionVerifyEmployees
        });
      }
      
    } catch (error) {
      console.error('Error saving to storage:', error);
      
      // Try sessionStorage as last resort
      try {
        sessionStorage.setItem('employees', JSON.stringify(this.mockEmployees));
        sessionStorage.setItem('attendance', JSON.stringify(this.mockAttendanceData));
        console.log('Saved to sessionStorage as fallback');
      } catch (sessionError) {
        console.error('sessionStorage also failed:', sessionError);
      }
    }
  }

  // Method to initialize localStorage with default data
  initializeDefaultData(): void {
    console.log('Initializing localStorage with default data...');
    this.saveToStorage();
    console.log('Default data saved to localStorage');
  }

  // Manual method to populate storage - call from browser console
  populateStorage(): void {
    console.log('Manually populating storage with default employee data...');
    this.mockEmployees = [
      {
        id: '1',
        empId: 'EMP001',
        fullName: 'John Doe',
        initials: 'JD',
        email: 'john.doe@company.com',
        phone: '+1234-567-8900',
        department: 'Sales',
        position: 'Senior Sales Manager',
        joinDate: '15/01/2023',
        status: 'Active',
        performance: 95,
        baseSalary: 5000,
        avatarColor: '#fadb14',
      },
      {
        id: '2',
        empId: 'EMP002',
        fullName: 'Sara Smith',
        initials: 'SS',
        email: 'sara.smith@company.com',
        phone: '+1234-567-8911',
        department: 'Marketing',
        position: 'Marketing Lead',
        joinDate: '10/02/2023',
        status: 'Active',
        performance: 88,
        baseSalary: 4200,
        avatarColor: '#ff7875',
      },
      {
        id: '3',
        empId: 'EMP003',
        fullName: 'Mike Johnson',
        initials: 'MJ',
        email: 'mike.johnson@company.com',
        phone: '+1234-567-8922',
        department: 'Sales',
        position: 'Sales Representative',
        joinDate: '05/03/2023',
        status: 'Active',
        performance: 92,
        baseSalary: 3800,
        avatarColor: '#95de64',
      },
      {
        id: '4',
        empId: 'EMP004',
        fullName: 'Emma Wilson',
        initials: 'EW',
        email: 'emma.wilson@company.com',
        phone: '+1234-567-8933',
        department: 'HR',
        position: 'HR Manager',
        joinDate: '20/01/2023',
        status: 'Active',
        performance: 97,
        baseSalary: 4800,
        avatarColor: '#69c0ff',
      },
      {
        id: '5',
        empId: 'EMP005',
        fullName: 'Liam Brown',
        initials: 'LB',
        email: 'liam.brown@company.com',
        phone: '+1234-567-8944',
        department: 'Finance',
        position: 'Finance Analyst',
        joinDate: '12/04/2023',
        status: 'Active',
        performance: 85,
        baseSalary: 4500,
        avatarColor: '#ffc53d',
      },
    ];
    
    this.saveToStorage();
    console.log('Storage manually populated with 5 employees');
  }

  // Clear all storage method
  clearAllStorage(): void {
    console.log('Clearing all storage...');
    localStorage.clear();
    sessionStorage.clear();
    console.log('Storage cleared');
  }

  getEmployees(): Observable<Employee[]> {
    return of(this.mockEmployees);
  }

  getAttendanceData(): Observable<EmployeeAttendance[]> {
    return of(this.mockAttendanceData);
  }

  getAttendanceSummary(): Observable<{
    present: number;
    absent: number;
    late: number;
    onLeave: number;
  }> {
    const summary = this.mockAttendanceData.reduce(
      (acc, record) => {
        switch (record.status) {
          case 'Present':
            acc.present++;
            break;
          case 'Absent':
            acc.absent++;
            break;
          case 'Late':
            acc.late++;
            break;
          case 'On Leave':
            acc.onLeave++;
            break;
        }
        return acc;
      },
      { present: 0, absent: 0, late: 0, onLeave: 0 },
    );
    return of(summary);
  }

  updateEmployee(updated: Employee): void {
    const current = this.mockEmployees;
    const index = current.findIndex((emp) => emp.id === updated.id);
    if (index !== -1) {
      const updatedList = [...current];
      updatedList[index] = updated;
      this.mockEmployees = updatedList;
      this.saveToStorage();
      console.log('Updated employee:', updated);
    }
  }

  deleteEmployee(id: string): void {
    const current = this.mockEmployees;
    const filtered = current.filter((emp) => emp.id !== id);
    this.mockEmployees = filtered;
    this.saveToStorage();
    console.log('Deleted employee with id:', id, 'Remaining:', filtered.length);
  }

  addEmployee(newEmployee: Employee): void {
    const current = this.mockEmployees;
    this.mockEmployees = [...current, newEmployee];
    this.saveToStorage();
    console.log('Added new employee:', newEmployee, 'Total:', this.mockEmployees.length);
  }
}
