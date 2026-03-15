import { createAction, props } from '@ngrx/store';
import { Employee } from '../api/employee.model';

export const loadEmployees = createAction('[Employee] Load Employees');
export const loadEmployeesSuccess = createAction(
  '[Employee] Load Employees Success',
  props<{ employees: Employee[] }>(),
);
export const loadEmployeesFailure = createAction(
  '[Employee] Load Employees Failure',
  props<{ error: string }>(),
);
export const selectEmployee = createAction(
  '[Employee] Select Employee',
  props<{ id: string }>(),
);
export const setSearchTerm = createAction(
  '[Employee] Set Search Term',
  props<{ searchTerm: string }>(),
);
export const setDepartmentFilter = createAction(
  '[Employee] Set Department Filter',
  props<{ department: string | null }>(),
);
export const setStatusFilter = createAction(
  '[Employee] Set Status Filter',
  props<{ status: string | null }>(),
);
export const updateEmployee = createAction(
  '[Employee] Update Employee',
  props<{ employee: Employee }>(),
);
export const deleteEmployee = createAction(
  '[Employee] Delete Employee',
  props<{ id: string }>(),
);
export const addEmployee = createAction(
  '[Employee] Add Employee',
  props<{ employee: Employee }>(),
);
