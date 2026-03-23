import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
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
    return state?.employees ?? [];
  }

  @Selector() public static selectedEmployee(state: EmployeeStateModel): Employee | null {
    return state?.selectedEmployee || null;
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
      switchMap((employees: Employee[]) => {
        patchState({
          employeesLoading: false,
          employees: employees
        });

        return of(employees);
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
    ctx: StateContext<EmployeeStateModel>, 
    { payload }: LoadEmployee
  ) {
    if (!payload) {
      ctx.patchState({
        selectedEmployee: null
      });
      return;
    }

    const state = ctx.getState();
    const found = state.employees.find(emp => emp.id === payload);

    ctx.patchState({
      selectedEmployee: found || null
    });
  }

  @Action(CreateEmployee) createEmployee(
    { patchState, getState }: StateContext<EmployeeStateModel>,
    { payload }: CreateEmployee
  ): Observable<any> {
    if (!payload) {
      return of();
    }

    patchState({
      creatingEmployee: true
    });

    return this.employeeApi.createEmployee(payload).pipe(
      switchMap((createdEmployee: Employee) => {
        // Update state with new employee
        patchState({
          creatingEmployee: false,
          employees: [
            ...getState().employees,
            {
              ...createdEmployee,
              id: createdEmployee.id // ✅ ensure correct id
            }
          ]
        });

        this.notification.success(this.success, 'Employee Created Successfully');
        
        // Return observable to complete the operation
        return of(createdEmployee);
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
    ctx: StateContext<EmployeeStateModel>,
    { payload }: UpdateEmployee
  ): Observable<any> {
    if (!payload || !payload.id) {
      this.notification.error('SYSTEM.ERROR', 'Invalid payload');
      return of();
    }

    const state = ctx.getState();

    // Find correct employee using BOTH ids
    const realEmployee = state.employees.find(
      e => e.id === payload.id || e.empId === payload.id
    );

    if (!realEmployee) {
      this.notification.error('SYSTEM.ERROR', 'Employee not found');
      return of();
    }

    const realId = realEmployee.id; // ALWAYS Firestore ID

    if (!realId) {
      this.notification.error('SYSTEM.ERROR', 'Invalid employee ID');
      return of();
    }

    ctx.patchState({ updatingEmployee: true });

    return this.employeeApi.updateEmployee(realId, payload.changes || {}).pipe(
      tap(() => {
        const updatedEmployees = state.employees.map(emp =>
          emp.id === realId ? { ...emp, ...(payload.changes || {}) } : emp
        );

        ctx.patchState({
          updatingEmployee: false,
          employees: updatedEmployees,
          selectedEmployee: { ...realEmployee, ...(payload.changes || {}) }
        });

        this.notification.success(this.success, 'Employee Updated Successfully');
      }),
      catchError(() => {
        this.notification.error('SYSTEM.ERROR', 'Error updating employee');
        ctx.patchState({ updatingEmployee: false });
        return of();
      })
    );
  }

  @Action(DeleteEmployee) deleteEmployee(
    ctx: StateContext<EmployeeStateModel>, 
    { payload }: DeleteEmployee
  ) {
    if (!payload) {
      this.notification.error('SYSTEM.ERROR', 'Invalid payload');
      return;
    }

    const state = ctx.getState();

    ctx.patchState({
      employees: state.employees.filter(e => e.id !== payload),
      selectedEmployee: null
    });
  }
}