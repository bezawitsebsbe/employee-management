import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AttendanceApiService } from '../../api/attendance.service';
import {
  LoadAttendanceData,
  LoadAttendance,
  LoadAttendanceByEmployeeId,
  CreateAttendanceRecord,
  UpdateAttendanceRecord,
  DeleteAttendanceRecord,
  CheckIn,
  CheckOut
} from '../action/attendance.action';
import { EmployeeAttendance } from '../../models/attendance.model';

export interface AttendanceStateModel {
  attendanceData: EmployeeAttendance[];
  selectedAttendance: EmployeeAttendance | null;
  attendanceByEmployeeId: EmployeeAttendance[];
  attendanceDataLoading: boolean;
  attendanceLoading: boolean;
  attendanceByEmployeeIdLoading: boolean;
  creatingAttendanceRecord: boolean;
  updatingAttendanceRecord: boolean;
  deletingAttendanceRecord: boolean;
  checkingIn: boolean;
  checkingOut: boolean;
}

@Injectable()
@State<AttendanceStateModel>({
  name: 'AttendanceState',
  defaults: {
    attendanceData: [],
    selectedAttendance: null,
    attendanceByEmployeeId: [],
    attendanceDataLoading: false,
    attendanceLoading: false,
    attendanceByEmployeeIdLoading: false,
    creatingAttendanceRecord: false,
    updatingAttendanceRecord: false,
    deletingAttendanceRecord: false,
    checkingIn: false,
    checkingOut: false
  }
})
export class AttendanceState {
  success = 'SYSTEM.SUCCESS';

  @Selector() public static attendanceData(state: AttendanceStateModel): EmployeeAttendance[] {
    return state.attendanceData;
  }

  @Selector() public static selectedAttendance(state: AttendanceStateModel): EmployeeAttendance | null {
    return state.selectedAttendance;
  }

  @Selector() public static attendanceByEmployeeId(state: AttendanceStateModel): EmployeeAttendance[] {
    return state.attendanceByEmployeeId;
  }

  @Selector() public static attendanceDataLoading(state: AttendanceStateModel): boolean {
    return state.attendanceDataLoading;
  }

  @Selector() public static attendanceLoading(state: AttendanceStateModel): boolean {
    return state.attendanceLoading;
  }

  @Selector() public static attendanceByEmployeeIdLoading(state: AttendanceStateModel): boolean {
    return state.attendanceByEmployeeIdLoading;
  }

  @Selector() public static creatingAttendanceRecord(state: AttendanceStateModel): boolean {
    return state.creatingAttendanceRecord;
  }

  @Selector() public static updatingAttendanceRecord(state: AttendanceStateModel): boolean {
    return state.updatingAttendanceRecord;
  }

  @Selector() public static deletingAttendanceRecord(state: AttendanceStateModel): boolean {
    return state.deletingAttendanceRecord;
  }

  @Selector() public static checkingIn(state: AttendanceStateModel): boolean {
    return state.checkingIn;
  }

  @Selector() public static checkingOut(state: AttendanceStateModel): boolean {
    return state.checkingOut;
  }

  constructor(
    private readonly attendanceApi: AttendanceApiService,
    private readonly notification: NzNotificationService,
    private readonly router: Router
  ) {}

  @Action(LoadAttendanceData) loadAttendanceData({ patchState }: StateContext<AttendanceStateModel>): Observable<any> {
    patchState({
      attendanceDataLoading: true
    });

    return this.attendanceApi.getAttendanceData().pipe(
      tap((attendanceData: EmployeeAttendance[]) => {
        patchState({
          attendanceDataLoading: false,
          attendanceData: attendanceData
        });
      }),
      catchError((error) =>
        of(
          patchState({
            attendanceDataLoading: false
          })
        )
      )
    );
  }

  @Action(LoadAttendance) loadAttendance(
    { patchState }: StateContext<AttendanceStateModel>,
    { payload }: LoadAttendance
  ): Observable<any> {
    if (!payload) {
      return of(
        patchState({
          selectedAttendance: null
        })
      );
    }

    patchState({
      attendanceLoading: true
    });

    return this.attendanceApi.getAttendance(payload).pipe(
      tap((attendance: EmployeeAttendance | null) => {
        patchState({
          attendanceLoading: false,
          selectedAttendance: attendance
        });
      }),
      catchError((error) =>
        of(
          patchState({
            attendanceLoading: false,
            selectedAttendance: null
          })
        )
      )
    );
  }

  @Action(LoadAttendanceByEmployeeId) loadAttendanceByEmployeeId(
    { patchState }: StateContext<AttendanceStateModel>,
    { payload }: LoadAttendanceByEmployeeId
  ): Observable<any> {
    if (!payload) {
      return of(
        patchState({
          attendanceByEmployeeId: []
        })
      );
    }

    patchState({
      attendanceByEmployeeIdLoading: true
    });

    return this.attendanceApi.getAttendanceByEmployeeId(payload).pipe(
      tap((attendanceData: EmployeeAttendance[]) => {
        patchState({
          attendanceByEmployeeIdLoading: false,
          attendanceByEmployeeId: attendanceData
        });
      }),
      catchError((error) =>
        of(
          patchState({
            attendanceByEmployeeIdLoading: false,
            attendanceByEmployeeId: []
          })
        )
      )
    );
  }

  @Action(CreateAttendanceRecord) createAttendanceRecord(
    { patchState, getState, dispatch }: StateContext<AttendanceStateModel>,
    { payload }: CreateAttendanceRecord
  ): Observable<any> {
    if (!payload) {
      return of();
    }
    
    patchState({
      creatingAttendanceRecord: true
    });

    return this.attendanceApi.createAttendanceRecord(payload).pipe(
      tap((createdAttendance: EmployeeAttendance) => {
        const currentAttendanceData = getState().attendanceData;
        patchState({
          creatingAttendanceRecord: false,
          attendanceData: [...currentAttendanceData, createdAttendance]
        });

        this.notification.success(this.success, 'Attendance Record Created Successfully');
        dispatch(new LoadAttendanceData()); // Refresh the list
      }),
      catchError((error) => {
        this.notification.error('SYSTEM.ERROR', 'Error creating attendance record');
        return of(patchState({ creatingAttendanceRecord: false }));
      })
    );
  }

  @Action(UpdateAttendanceRecord) updateAttendanceRecord(
    { patchState, getState }: StateContext<AttendanceStateModel>,
    { payload }: UpdateAttendanceRecord
  ): Observable<any> {
    if (!payload) {
      return of();
    }

    patchState({
      updatingAttendanceRecord: true
    });

    return this.attendanceApi.updateAttendanceRecord(payload.id, payload.changes).pipe(
      tap((updatedAttendance: EmployeeAttendance) => {
        const currentAttendanceData = getState().attendanceData;
        const updatedAttendanceData = currentAttendanceData.map(record => 
          record.id === payload.id ? { ...record, ...payload.changes } : record
        );
        
        patchState({
          updatingAttendanceRecord: false,
          attendanceData: updatedAttendanceData,
          selectedAttendance: updatedAttendance
        });

        this.notification.success(this.success, 'Attendance Record Updated Successfully');
      }),
      catchError((error) => {
        this.notification.error('SYSTEM.ERROR', 'Error updating attendance record');
        return of(
          patchState({
            updatingAttendanceRecord: false
          })
        );
      })
    );
  }

  @Action(DeleteAttendanceRecord) deleteAttendanceRecord(
    { patchState, getState }: StateContext<AttendanceStateModel>,
    { payload }: DeleteAttendanceRecord
  ): Observable<any> {
    if (!payload) {
      return of();
    }

    patchState({
      deletingAttendanceRecord: true
    });

    return this.attendanceApi.deleteAttendanceRecord(payload).pipe(
      tap(() => {
        const currentAttendanceData = getState().attendanceData;
        const filteredAttendanceData = currentAttendanceData.filter(record => record.id !== payload);
        
        patchState({
          deletingAttendanceRecord: false,
          attendanceData: filteredAttendanceData,
          selectedAttendance: null
        });

        this.notification.success(this.success, 'Attendance Record Deleted Successfully');
      }),
      catchError((error) => {
        this.notification.error('SYSTEM.ERROR', 'Error deleting attendance record');
        return of(
          patchState({
            deletingAttendanceRecord: false
          })
        );
      })
    );
  }

  @Action(CheckIn) checkIn(
    { patchState, getState, dispatch }: StateContext<AttendanceStateModel>,
    { payload }: CheckIn
  ): Observable<any> {
    if (!payload) {
      return of();
    }

    patchState({
      checkingIn: true
    });

    return this.attendanceApi.checkIn(payload.employeeId, payload.employeeName, payload.department).pipe(
      tap((checkInRecord: EmployeeAttendance) => {
        const currentAttendanceData = getState().attendanceData;
        patchState({
          checkingIn: false,
          attendanceData: [...currentAttendanceData, checkInRecord]
        });

        this.notification.success(this.success, `Check-in successful for ${payload.employeeName}`);
        dispatch(new LoadAttendanceData()); // Refresh the list
      }),
      catchError((error) => {
        this.notification.error('SYSTEM.ERROR', 'Error during check-in');
        return of(
          patchState({
            checkingIn: false
          })
        );
      })
    );
  }

  @Action(CheckOut) checkOut(
    { patchState, getState }: StateContext<AttendanceStateModel>,
    { payload }: CheckOut
  ): Observable<any> {
    if (!payload) {
      return of();
    }

    patchState({
      checkingOut: true
    });

    return this.attendanceApi.checkOut(payload).pipe(
      tap((updatedAttendance: EmployeeAttendance) => {
        const currentAttendanceData = getState().attendanceData;
        const updatedAttendanceData = currentAttendanceData.map(record => 
          record.id === payload ? { ...record, ...updatedAttendance } : record
        );
        
        patchState({
          checkingOut: false,
          attendanceData: updatedAttendanceData,
          selectedAttendance: updatedAttendance
        });

        this.notification.success(this.success, 'Check-out successful');
      }),
      catchError((error) => {
        this.notification.error('SYSTEM.ERROR', 'Error during check-out');
        return of(
          patchState({
            checkingOut: false
          })
        );
      })
    );
  }
}