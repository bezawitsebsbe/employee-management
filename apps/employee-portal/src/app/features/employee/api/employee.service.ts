// // apps/portal/employee-portal/src/app/features/employee/api/employee.service.ts
// import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs';
// import { Employee, EmployeeAttendance } from './employee.model';

// @Injectable({ providedIn: 'root' })
// export class EmployeeService {
//   private mockEmployees: Employee[] = [
//     {
//       id: '1',
//       empId: 'EMP001',
//       fullName: 'John Doe',
//       initials: 'JD',
//       email: 'john.doe@company.com',
//       phone: '+1234-567-8900',
//       department: 'Sales',
//       position: 'Senior Sales Manager',
//       joinDate: '15/01/2023',
//       status: 'Active',
//       performance: 95,
//       baseSalary: 5000,
//       avatarColor: '#fadb14',
//     },
//     {
//       id: '2',
//       empId: 'EMP002',
//       fullName: 'Sara Smith',
//       initials: 'SS',
//       email: 'sara.smith@company.com',
//       phone: '+1234-567-8911',
//       department: 'Marketing',
//       position: 'Marketing Lead',
//       joinDate: '10/02/2023',
//       status: 'Active',
//       performance: 88,
//       baseSalary: 4200,
//       avatarColor: '#ff7875',
//     },
//     {
//       id: '3',
//       empId: 'EMP003',
//       fullName: 'Mike Johnson',
//       initials: 'MJ',
//       email: 'mike.johnson@company.com',
//       phone: '+1234-567-8922',
//       department: 'Sales',
//       position: 'Sales Representative',
//       joinDate: '05/03/2023',
//       status: 'Active',
//       performance: 92,
//       baseSalary: 3800,
//       avatarColor: '#95de64',
//     },
//     {
//       id: '4',
//       empId: 'EMP004',
//       fullName: 'Emma Wilson',
//       initials: 'EW',
//       email: 'emma.wilson@company.com',
//       phone: '+1234-567-8933',
//       department: 'HR',
//       position: 'HR Manager',
//       joinDate: '20/01/2023',
//       status: 'Active',
//       performance: 97,
//       baseSalary: 4800,
//       avatarColor: '#69c0ff',
//     },
//     {
//       id: '5',
//       empId: 'EMP005',
//       fullName: 'Liam Brown',
//       initials: 'LB',
//       email: 'liam.brown@company.com',
//       phone: '+1234-567-8944',
//       department: 'Finance',
//       position: 'Finance Analyst',
//       joinDate: '12/04/2023',
//       status: 'Active',
//       performance: 85,
//       baseSalary: 4500,
//       avatarColor: '#ffc53d',
//     },
//   ];

//   private mockAttendanceData: EmployeeAttendance[] = [
//     {
//       employeeId: '1',
//       name: 'John Doe',
//       department: 'Sales',
//       checkin: '09:01 AM',
//       checkout: '05:12 PM',
//       hours: '8h 11m',
//       status: 'Present',
//     },
//     {
//       employeeId: '2',
//       name: 'Sara Smith',
//       department: 'Marketing',
//       checkin: '09:20 AM',
//       checkout: '05:00 PM',
//       hours: '7h 40m',
//       status: 'Late',
//     },
//     {
//       employeeId: '3',
//       name: 'Mike Johnson',
//       department: 'Sales',
//       checkin: '08:45 AM',
//       checkout: '05:15 PM',
//       hours: '8h 30m',
//       status: 'Present',
//     },
//     {
//       employeeId: '4',
//       name: 'Emma Wilson',
//       department: 'HR',
//       checkin: '-',
//       checkout: '-',
//       hours: '-',
//       status: 'Absent',
//     },
//     {
//       employeeId: '5',
//       name: 'Liam Brown',
//       department: 'Finance',
//       checkin: '09:00 AM',
//       checkout: '05:30 PM',
//       hours: '8h 30m',
//       status: 'Present',
//     },
//   ];

//   getEmployees(): Observable<Employee[]> {
//     return of(this.mockEmployees);
//   }

//   getAttendanceData(): Observable<EmployeeAttendance[]> {
//     return of(this.mockAttendanceData);
//   }

//   getAttendanceSummary(): Observable<{
//     present: number;
//     absent: number;
//     late: number;
//     onLeave: number;
//   }> {
//     const summary = this.mockAttendanceData.reduce(
//       (acc, record) => {
//         switch (record.status) {
//           case 'Present':
//             acc.present++;
//             break;
//           case 'Absent':
//             acc.absent++;
//             break;
//           case 'Late':
//             acc.late++;
//             break;
//           case 'On Leave':
//             acc.onLeave++;
//             break;
//         }
//         return acc;
//       },
//       { present: 0, absent: 0, late: 0, onLeave: 0 },
//     );
//     return of(summary);
//   }
// }
