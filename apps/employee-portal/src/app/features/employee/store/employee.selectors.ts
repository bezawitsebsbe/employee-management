// apps/portal/employee-portal/src/app/features/employee/store/employee.selectors.ts
import { createSelector } from '@ngrx/store';
import { Employee } from '../api/employee.model';
import { EmployeeState } from './employee.reducer';

const selectEmployeeState = (rootState: {
  employee: EmployeeState;
}): EmployeeState => rootState.employee;

export const selectAllEmployees = createSelector(
  selectEmployeeState,
  (state: EmployeeState): Employee[] => state.employees,
);

export const selectSelectedId = createSelector(
  selectEmployeeState,
  (state: EmployeeState): string | null => state.selectedId,
);

export const selectSearchTerm = createSelector(
  selectEmployeeState,
  (state: EmployeeState): string => state.searchTerm.toLowerCase(),
);

export const selectDepartmentFilter = createSelector(
  selectEmployeeState,
  (state: EmployeeState): string | null => state.departmentFilter,
);

export const selectStatusFilter = createSelector(
  selectEmployeeState,
  (state: EmployeeState): string | null => state.statusFilter,
);

export const selectFilteredEmployees = createSelector(
  selectAllEmployees,
  selectSearchTerm,
  selectDepartmentFilter,
  selectStatusFilter,
  (
    employees: Employee[],
    searchTerm: string,
    deptFilter: string | null,
    statusFilter: string | null,
  ): Employee[] => {
    return employees.filter((emp: Employee) => {
      const matchesSearch =
        !searchTerm ||
        emp.fullName.toLowerCase().includes(searchTerm) ||
        emp.empId.toLowerCase().includes(searchTerm) ||
        emp.email.toLowerCase().includes(searchTerm);

      const matchesDept = !deptFilter || emp.department === deptFilter;
      const matchesStatus = !statusFilter || emp.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  },
);

export const selectSelectedEmployee = createSelector(
  selectAllEmployees,
  selectSelectedId,
  (employees: Employee[], id: string | null): Employee | null =>
    employees.find((e: Employee) => e.id === id) || null,
);

export const selectSummary = createSelector(
  selectAllEmployees,
  (employees: Employee[]) => ({
    totalEmployees: employees.length,
    active: employees.filter((e: Employee) => e.status === 'Active').length,
    avgPerformance: employees.length
      ? Math.round(
          employees.reduce(
            (sum: number, e: Employee) => sum + (e.performance || 0),
            0,
          ) / employees.length,
        )
      : 0,
    totalPayroll: employees.reduce(
      (sum: number, e: Employee) => sum + (e.baseSalary || 0),
      0,
    ),
  }),
);
