import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  LoadAttendanceData,
  LoadAttendance,
  LoadAttendanceByEmployeeId,
  CreateAttendanceRecord,
  UpdateAttendanceRecord,
  DeleteAttendanceRecord,
  CheckIn,
  CheckOut,
  ResetAttendance
} from '../store/action/attendance.action';
import { AttendanceState } from '../store/state/attendance.state';

@Injectable()
export class AttendanceFacadeService {
  attendanceData$: Observable<any[]>;
  selectedAttendance$: Observable<any>;
  attendanceByEmployeeId$: Observable<any[]>;
  attendanceDataLoading$: Observable<boolean>;
  attendanceLoading$: Observable<boolean>;
  attendanceByEmployeeIdLoading$: Observable<boolean>;
  creatingAttendanceRecord$: Observable<boolean>;
  updatingAttendanceRecord$: Observable<boolean>;
  deletingAttendanceRecord$: Observable<boolean>;
  checkingIn$: Observable<boolean>;
  checkingOut$: Observable<boolean>;

  constructor(private readonly store: Store) {
    this.attendanceData$ = this.store.select(AttendanceState.attendanceData);
    this.selectedAttendance$ = this.store.select(AttendanceState.selectedAttendance);
    this.attendanceByEmployeeId$ = this.store.select(AttendanceState.attendanceByEmployeeId);
    this.attendanceDataLoading$ = this.store.select(AttendanceState.attendanceDataLoading);
    this.attendanceLoading$ = this.store.select(AttendanceState.attendanceLoading);
    this.attendanceByEmployeeIdLoading$ = this.store.select(AttendanceState.attendanceByEmployeeIdLoading);
    this.creatingAttendanceRecord$ = this.store.select(AttendanceState.creatingAttendanceRecord);
    this.updatingAttendanceRecord$ = this.store.select(AttendanceState.updatingAttendanceRecord);
    this.deletingAttendanceRecord$ = this.store.select(AttendanceState.deletingAttendanceRecord);
    this.checkingIn$ = this.store.select(AttendanceState.checkingIn);
    this.checkingOut$ = this.store.select(AttendanceState.checkingOut);
  }

  loadAttendanceData(): void {
    this.store.dispatch(new LoadAttendanceData());
  }

  loadAttendance(id: string): void {
    this.store.dispatch(new LoadAttendance(id));
  }

  loadAttendanceByEmployeeId(employeeId: string): void {
    this.store.dispatch(new LoadAttendanceByEmployeeId(employeeId));
  }

  createAttendanceRecord(attendance: any): void {
    this.store.dispatch(new CreateAttendanceRecord(attendance));
  }

  updateAttendanceRecord(id: string, changes: any): void {
    this.store.dispatch(new UpdateAttendanceRecord({ id, changes }));
  }

  deleteAttendanceRecord(id: string): void {
    this.store.dispatch(new DeleteAttendanceRecord(id));
  }

  checkIn(employeeId: string, employeeName: string, department: string): void {
    this.store.dispatch(new CheckIn({ employeeId, employeeName, department }));
  }

  checkOut(attendanceId: string): void {
    this.store.dispatch(new CheckOut(attendanceId));
  }

  resetAttendance(): void {
    this.store.dispatch(new ResetAttendance());
  }
}