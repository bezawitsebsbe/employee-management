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
        snapshot.docs.map(doc => {
          const data = doc.data();

          return {
            ...data,
            id: doc.id, // ✅ FORCE overwrite ALWAYS
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date()
          } as Employee;
        })
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
          const data = docSnapshot.data();
          return {
            ...data,
            id: docSnapshot.id, // ✅ FORCE overwrite ALWAYS
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date()
          } as Employee;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching employee by ID:', error);
        return of(null);
      })
    );
  }

  createEmployee(employee: any): Observable<Employee> {
  const { id, ...safeEmployee } = employee; // ✅ strip id ALWAYS

  const employeeWithTimestamp = {
    ...safeEmployee,   // ✅ id removed
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  return from(
    addDoc(
      collection(this.firebaseService.database, this.employeeRootEndpoint.employees),
      employeeWithTimestamp
    )
  ).pipe(
    map(docRef => ({
      id: docRef.id, // ✅ real ID
      ...safeEmployee,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
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
      map(() => ({ 
        id, 
        ...changesWithTimestamp,
        updatedAt: new Date()
      } as Employee)),
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
