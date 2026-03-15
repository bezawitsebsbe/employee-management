// apps/portal/employee-portal/src/app/features/employee/facades/employee.facade.ts
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { Employee, EmployeeSummary } from '../api/employee.model';
import { EmployeeService } from '../api/employee.service';

import { EmployeeState } from '../store/employee.reducer';
import * as EmployeeActions from '../store/employee.actions';
import {
  selectAllEmployees,
  selectSelectedEmployee,
  selectFilteredEmployees,
  selectSummary,
  selectSearchTerm,
  selectDepartmentFilter,
  selectStatusFilter,
} from '../store/employee.selectors';

@Injectable({ providedIn: 'root' })
export class EmployeeFacade {
  private store = inject(Store<{ employee: EmployeeState }>);
  private service = inject(EmployeeService); // still here if you need direct access

  // ── Keep your original public signals ──
  employees = signal<Employee[]>([]);
  selectedEmployee = signal<Employee | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // ── Computed summary (kept as-is, but now can sync from store if preferred) ──
  summary = computed<EmployeeSummary>(() => {
    const emps = this.employees();
    const active = emps.filter((e) => e.status === 'Active').length;
    const avgPerf =
      emps.reduce((sum, e) => sum + (e.performance || 0), 0) /
      (emps.length || 1);
    const totalPay = emps.reduce((sum, e) => sum + (e.baseSalary || 0), 0);

    return {
      totalEmployees: emps.length,
      active,
      avgPerformance: Math.round(avgPerf),
      totalPayroll: totalPay,
    };
  });

  // ── New filtered signal (used by list component) ──
  filteredEmployees = toSignal(this.store.select(selectFilteredEmployees), {
    initialValue: [],
  });

  // ── Sync store → local signals (keeps your existing component bindings working) ──
  constructor() {
    // Load once on init (you can still call loadEmployees() manually if needed)
    this.store.dispatch(EmployeeActions.loadEmployees());

    // Sync employees
    effect(() => {
      const loaded = toSignal(this.store.select(selectAllEmployees), {
        initialValue: [],
      })();
      this.employees.set(loaded);
    });

    // Sync selected
    effect(() => {
      const selected = toSignal(this.store.select(selectSelectedEmployee), {
        initialValue: null,
      })();
      this.selectedEmployee.set(selected);
    });

    // Optional: you can also sync loading/error from store later if you move them there
  }

  // ── Original methods (enhanced to use store) ──
  loadEmployees() {
    this.loading.set(true);
    this.store.dispatch(EmployeeActions.loadEmployees());

    // Optional: listen once for completion if you want to keep manual loading signal
    // But since we use effects, this can be simplified later
  }

  selectEmployee(emp: Employee | null) {
    if (!emp) {
      this.store.dispatch(EmployeeActions.selectEmployee({ id: null! }));
      return;
    }
    this.store.dispatch(EmployeeActions.selectEmployee({ id: emp.id }));
  }

  // ── New public API methods (used by components) ──
  selectEmployeeById(id: string) {
    this.store.dispatch(EmployeeActions.selectEmployee({ id }));
  }

  setSearchTerm(term: string) {
    this.store.dispatch(EmployeeActions.setSearchTerm({ searchTerm: term }));
  }

  setDepartmentFilter(department: string | null) {
    this.store.dispatch(EmployeeActions.setDepartmentFilter({ department }));
  }

  setStatusFilter(status: string | null) {
    this.store.dispatch(EmployeeActions.setStatusFilter({ status }));
  }

  updateEmployee(updated: Employee) {
    this.store.dispatch(EmployeeActions.updateEmployee({ employee: updated }));
  }

  deleteEmployee(id: string) {
    this.store.dispatch(EmployeeActions.deleteEmployee({ id }));
  }

  addEmployee(newEmployee: Employee) {
    // In real app: generate id, call service, then dispatch
    // For now: simple client-side add
    this.store.dispatch(EmployeeActions.addEmployee({ employee: newEmployee }));
  }

  // Optional: expose current filter values if components need read access
  get currentSearchTerm() {
    return toSignal(this.store.select(selectSearchTerm), {
      initialValue: '',
    })();
  }

  get currentDepartmentFilter() {
    return toSignal(this.store.select(selectDepartmentFilter), {
      initialValue: null,
    })();
  }

  get currentStatusFilter() {
    return toSignal(this.store.select(selectStatusFilter), {
      initialValue: null,
    })();
  }
}
