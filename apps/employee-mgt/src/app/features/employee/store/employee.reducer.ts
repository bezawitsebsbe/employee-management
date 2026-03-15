import { createReducer, on } from '@ngrx/store';
import { Employee } from '../api/employee.model';
import * as EmployeeActions from './employee.actions';

export interface EmployeeState {
  employees: Employee[];
  selectedId: string | null;
  searchTerm: string;
  departmentFilter: string | null;
  statusFilter: string | null;
  loading: boolean; // added - used during load
  error: string | null; // added - used on failure
}

export const initialState: EmployeeState = {
  employees: [],
  selectedId: null,
  searchTerm: '',
  departmentFilter: null,
  statusFilter: null,
  loading: false,
  error: null,
};

export const employeeReducer = createReducer<EmployeeState>(
  initialState,

  // Load employees
  on(EmployeeActions.loadEmployees, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(EmployeeActions.loadEmployeesSuccess, (state, { employees }) => ({
    ...state,
    employees,
    loading: false,
    error: null,
  })),

  on(EmployeeActions.loadEmployeesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Selection
  on(EmployeeActions.selectEmployee, (state, { id }) => ({
    ...state,
    selectedId: id,
  })),

  // Filters
  on(EmployeeActions.setSearchTerm, (state, { searchTerm }) => ({
    ...state,
    searchTerm,
  })),

  on(EmployeeActions.setDepartmentFilter, (state, { department }) => ({
    ...state,
    departmentFilter: department,
  })),

  on(EmployeeActions.setStatusFilter, (state, { status }) => ({
    ...state,
    statusFilter: status,
  })),

  // CRUD operations
  on(EmployeeActions.addEmployee, (state, { employee }) => ({
    ...state,
    employees: [...state.employees, employee],
  })),

  on(EmployeeActions.updateEmployee, (state, { employee }) => ({
    ...state,
    employees: state.employees.map((e) =>
      e.id === employee.id ? employee : e,
    ),
  })),

  on(EmployeeActions.deleteEmployee, (state, { id }) => ({
    ...state,
    employees: state.employees.filter((e) => e.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId,
  })),
);
