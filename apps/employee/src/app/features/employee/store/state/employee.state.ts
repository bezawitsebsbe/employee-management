import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { EmployeeApiService } from '../../api/employee.service';
import {
  LoadEmployees,
  LoadEmployee,
  CreateEmployee,
  UpdateEmployee,
  DeleteEmployee
} from '../action/employee.action';
import { Employee } from '../../models/employee.model';

export interface EmployeeStateModel {
  employees: Employee[];
  selectedEmployee: Employee | null;
  employeesLoading: boolean;
  employeeLoading: boolean;
  creatingEmployee: boolean;
  updatingEmployee: boolean;
  deletingEmployee: boolean;
}

@Injectable()
@State<EmployeeStateModel>({
  name: 'EmployeeState',
  defaults: {
    employees: [],
    selectedEmployee: null,
    employeesLoading: false,
    employeeLoading: false,
    creatingEmployee: false,
    updatingEmployee: false,
    deletingEmployee: false
  }
})
export class EmployeeState {
  success = 'SYSTEM.SUCCESS';

  @Selector() public static employees(state: EmployeeStateModel): Employee[] {
    return state.employees;
  }

  @Selector() public static selectedEmployee(state: EmployeeStateModel): Employee | null {
    return state.selectedEmployee;
  }

  @Selector() public static employeesLoading(state: EmployeeStateModel): boolean {
    return state.employeesLoading;
  }

  @Selector() public static employeeLoading(state: EmployeeStateModel): boolean {
    return state.employeeLoading;
  }

  @Selector() public static creatingEmployee(state: EmployeeStateModel): boolean {
    return state.creatingEmployee;
  }

  @Selector() public static updatingEmployee(state: EmployeeStateModel): boolean {
    return state.updatingEmployee;
  }

  @Selector() public static deletingEmployee(state: EmployeeStateModel): boolean {
    return state.deletingEmployee;
  }

  constructor(
    private readonly employeeApi: EmployeeApiService,
    private readonly notification: NzNotificationService,
    private readonly router: Router
  ) {}

  @Action(LoadEmployees) loadEmployees({ patchState }: StateContext<EmployeeStateModel>): Observable<any> {
    patchState({
      employeesLoading: true
    });

    return this.employeeApi.getEmployees().pipe(
      tap((employees: Employee[]) => {
        patchState({
          employeesLoading: false,
          employees: employees
        });
      }),
      catchError((error) =>
        of(
          patchState({
            employeesLoading: false
          })
        )
      )
    );
  }

  @Action(LoadEmployee) loadEmployee(
    { patchState }: StateContext<EmployeeStateModel>,
    { payload }: LoadEmployee
  ): Observable<any> {
    if (!payload) {
      return of(
        patchState({
          selectedEmployee: null
        })
      );
    }

    patchState({
      employeeLoading: true
    });

    return this.employeeApi.getEmployee(payload).pipe(
      tap((employee: Employee | null) => {
        patchState({
          employeeLoading: false,
          selectedEmployee: employee
        });
      }),
      catchError((error) =>
        of(
          patchState({
            employeeLoading: false,
            selectedEmployee: null
          })
        )
      )
    );
  }

  @Action(CreateEmployee) createEmployee(
    { patchState, getState, dispatch }: StateContext<EmployeeStateModel>,
    { payload }: CreateEmployee
  ): Observable<any> {
    if (!payload) {
      return of();
    }

    patchState({
      creatingEmployee: true
    });

    return this.employeeApi.createEmployee(payload).pipe(
      tap((createdEmployee: Employee) => {
        const currentEmployees = getState().employees;
        patchState({
          creatingEmployee: false,
          employees: [...currentEmployees, createdEmployee]
        });

        this.notification.success(this.success, 'Employee Created Successfully');
        dispatch(new LoadEmployees()); // Refresh the list
      }),
      catchError((error) => {
        this.notification.error('SYSTEM.ERROR', 'Error creating employee');
        return of(
          patchState({
            creatingEmployee: false
          })
        );
      })
    );
  }

  @Action(UpdateEmployee) updateEmployee(
    { patchState, getState }: StateContext<EmployeeStateModel>,
    { payload }: UpdateEmployee
  ): Observable<any> {
    if (!payload) {
      return of();
    }

    patchState({
      updatingEmployee: true
    });

    return this.employeeApi.updateEmployee(payload.id, payload.changes).pipe(
      tap((updatedEmployee: Employee) => {
        const currentEmployees = getState().employees;
        const updatedEmployees = currentEmployees.map(emp => 
          emp.id === payload.id ? { ...emp, ...payload.changes } : emp
        );
        
        patchState({
          updatingEmployee: false,
          employees: updatedEmployees,
          selectedEmployee: updatedEmployee
        });

        this.notification.success(this.success, 'Employee Updated Successfully');
      }),
      catchError((error) => {
        this.notification.error('SYSTEM.ERROR', 'Error updating employee');
        return of(
          patchState({
            updatingEmployee: false
          })
        );
      })
    );
  }

  @Action(DeleteEmployee) deleteEmployee(
    { patchState, getState }: StateContext<EmployeeStateModel>,
    { payload }: DeleteEmployee
  ): Observable<any> {
    if (!payload) {
      return of();
    }

    patchState({
      deletingEmployee: true
    });

    return this.employeeApi.deleteEmployee(payload).pipe(
      tap(() => {
        const currentEmployees = getState().employees;
        const filteredEmployees = currentEmployees.filter(emp => emp.id !== payload);
        
        patchState({
          deletingEmployee: false,
          employees: filteredEmployees,
          selectedEmployee: null
        });

        this.notification.success(this.success, 'Employee Deleted Successfully');
      }),
      catchError((error) => {
        this.notification.error('SYSTEM.ERROR', 'Error deleting employee');
        return of(
          patchState({
            deletingEmployee: false
          })
        );
      })
    );
  }
}