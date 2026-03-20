import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { FirebaseService } from '@employee-payroll/firebase';
import { AttendanceEndpoint } from './attendance.endpoint';
import { EmployeeAttendance } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceApiService {
  attendanceRootEndpoint;

  constructor(
    private readonly firebaseService: FirebaseService
  ) {
    this.attendanceRootEndpoint = {
      attendance: AttendanceEndpoint.collection
    };
  }

  getAttendanceData(): Observable<EmployeeAttendance[]> {
    return from(
      getDocs(collection(this.firebaseService.database, this.attendanceRootEndpoint.attendance))
    ).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            employeeId: data['employeeId'] || '',
            name: data['name'] || '',
            department: data['department'] || '',
            checkin: data['checkin'] || '',
            checkout: data['checkout'] || '',
            hours: data['hours'] || '',
            status: data['status'] || 'Present'
          } as EmployeeAttendance;
        })
      ),
      catchError(error => {
        console.error('Error fetching attendance data:', error);
        return of([]);
      })
    );
  }

  getAttendanceByEmployeeId(employeeId: string): Observable<EmployeeAttendance[]> {
    return from(
      getDocs(query(collection(this.firebaseService.database, this.attendanceRootEndpoint.attendance), where('employeeId', '==', employeeId)))
    ).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            employeeId: data['employeeId'] || '',
            name: data['name'] || '',
            department: data['department'] || '',
            checkin: data['checkin'] || '',
            checkout: data['checkout'] || '',
            hours: data['hours'] || '',
            status: data['status'] || 'Present'
          } as EmployeeAttendance;
        })
      ),
      catchError(error => {
        console.error('Error fetching attendance by employee ID:', error);
        return of([]);
      })
    );
  }

  getAttendance(id: string): Observable<EmployeeAttendance | null> {
    return from(
      getDoc(doc(this.firebaseService.database, this.attendanceRootEndpoint.attendance, id))
    ).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            employeeId: data['employeeId'] || '',
            name: data['name'] || '',
            department: data['department'] || '',
            checkin: data['checkin'] || '',
            checkout: data['checkout'] || '',
            hours: data['hours'] || '',
            status: data['status'] || 'Present'
          } as EmployeeAttendance;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching attendance by ID:', error);
        return of(null);
      })
    );
  }

  createAttendanceRecord(attendance: Omit<EmployeeAttendance, 'id'>): Observable<EmployeeAttendance> {
    const attendanceWithTimestamp = {
      ...attendance,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    return from(
      addDoc(collection(this.firebaseService.database, this.attendanceRootEndpoint.attendance), attendanceWithTimestamp)
    ).pipe(
      map(docRef => {
        const createdAttendance: EmployeeAttendance = {
          id: docRef.id,
          ...attendanceWithTimestamp
        } as EmployeeAttendance;
        return createdAttendance;
      }),
      catchError(error => {
        console.error('Error creating attendance record:', error);
        throw error;
      })
    );
  }

  updateAttendanceRecord(id: string, changes: Partial<EmployeeAttendance>): Observable<EmployeeAttendance> {
    const changesWithTimestamp = {
      ...changes,
      updatedAt: Timestamp.now()
    };

    return from(
      updateDoc(doc(this.firebaseService.database, this.attendanceRootEndpoint.attendance, id), changesWithTimestamp)
    ).pipe(
      switchMap(() => 
        // Fetch the updated document to return the complete EmployeeAttendance object
        this.getAttendance(id).pipe(
          map(attendance => {
            if (!attendance) {
              throw new Error('Attendance record not found after update');
            }
            return attendance;
          })
        )
      ),
      catchError(error => {
        console.error('Error updating attendance record:', error);
        throw error;
      })
    );
  }

  deleteAttendanceRecord(id: string): Observable<void> {
    return from(
      deleteDoc(doc(this.firebaseService.database, this.attendanceRootEndpoint.attendance, id))
    ).pipe(
      catchError(error => {
        console.error('Error deleting attendance record:', error);
        throw error;
      })
    );
  }

  checkIn(employeeId: string, employeeName: string, department: string): Observable<EmployeeAttendance> {
    const now = new Date();
    const checkInTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const attendanceRecord: Omit<EmployeeAttendance, 'id'> = {
      employeeId,
      name: employeeName,
      department,
      checkin: checkInTime,
      checkout: '-',
      hours: '-',
      status: 'Present'
    };

    return this.createAttendanceRecord(attendanceRecord);
  }

  checkOut(attendanceId: string): Observable<EmployeeAttendance> {
    const now = new Date();
    const checkOutTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return this.getAttendance(attendanceId).pipe(
      map(attendance => {
        if (!attendance || attendance.checkin === '-') {
          throw new Error('No valid check-in record found');
        }

        const checkIn = new Date(`1970-01-01 ${attendance.checkin}`);
        const checkOut = new Date(`1970-01-01 ${checkOutTime}`);
        const minutes = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);
        const hoursStr = `${Math.floor(minutes / 60)}h ${Math.floor(minutes % 60)}m`;

        return {
          id: attendanceId,
          employeeId: attendance.employeeId,
          name: attendance.name,
          department: attendance.department,
          checkin: attendance.checkin,
          checkout: checkOutTime,
          hours: hoursStr,
          status: attendance.status
        } as EmployeeAttendance;
      }),
      catchError(error => {
        console.error('Error during check-out:', error);
        throw error;
      })
    );
  }
}