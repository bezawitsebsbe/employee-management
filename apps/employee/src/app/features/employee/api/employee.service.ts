import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { FirebaseService } from '@employee-payroll/firebase';
import { EmployeeEndpoint } from './employee.endpoint';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeApiService {
  employeeRootEndpoint;

  constructor(
    private readonly firebaseService: FirebaseService
  ) {
    this.employeeRootEndpoint = {
      employees: EmployeeEndpoint.collection
    };
  }

  getEmployees(): Observable<Employee[]> {
    return from(
      getDocs(collection(this.firebaseService.database, this.employeeRootEndpoint.employees))
    ).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee))
      ),
      catchError(error => {
        console.error('Error fetching employees:', error);
        return of([]);
      })
    );
  }

  getEmployee(id: string): Observable<Employee | null> {
    return from(
      getDoc(doc(this.firebaseService.database, this.employeeRootEndpoint.employees, id))
    ).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          return { id: docSnapshot.id, ...docSnapshot.data() } as Employee;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching employee by ID:', error);
        return of(null);
      })
    );
  }

  createEmployee(employee: Omit<Employee, 'id'>): Observable<Employee> {
    const employeeWithTimestamp = {
      ...employee,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    return from(
      addDoc(collection(this.firebaseService.database, this.employeeRootEndpoint.employees), employeeWithTimestamp)
    ).pipe(
      map(docRef => ({ id: docRef.id, ...employeeWithTimestamp } as Employee)),
      catchError(error => {
        console.error('Error creating employee:', error);
        throw error;
      })
    );
  }

  updateEmployee(id: string, changes: Partial<Employee>): Observable<Employee> {
    const changesWithTimestamp = {
      ...changes,
      updatedAt: Timestamp.now()
    };

    return from(
      updateDoc(doc(this.firebaseService.database, this.employeeRootEndpoint.employees, id), changesWithTimestamp)
    ).pipe(
      map(() => ({ id, ...changesWithTimestamp } as Employee)),
      catchError(error => {
        console.error('Error updating employee:', error);
        throw error;
      })
    );
  }

  deleteEmployee(id: string): Observable<void> {
    return from(
      deleteDoc(doc(this.firebaseService.database, this.employeeRootEndpoint.employees, id))
    ).pipe(
      catchError(error => {
        console.error('Error deleting employee:', error);
        throw error;
      })
    );
  }
}
