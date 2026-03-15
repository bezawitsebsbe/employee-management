// employee.effects.ts
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { EmployeeService } from '../api/employee.service';
import * as EmployeeActions from './employee.actions';
import { Employee } from '../api/employee.model';

export class EmployeeEffects {
  private actions$ = inject(Actions);
  private employeeService = inject(EmployeeService);

  loadEmployees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.loadEmployees),
      switchMap(() =>
        this.employeeService.getEmployees().pipe(
          map((employees: Employee[]) =>
            EmployeeActions.loadEmployeesSuccess({ employees }),
          ),
          catchError((error) =>
            of(
              EmployeeActions.loadEmployeesFailure({
                error: error instanceof Error ? error.message : 'Unknown error',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
