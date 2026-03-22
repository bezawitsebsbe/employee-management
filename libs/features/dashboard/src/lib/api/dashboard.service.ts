import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { FirebaseService } from '@employee-payroll/firebase';
import { DashboardStats, ActivityItem } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private activitiesCollection = 'activities';
  private statsCollection = 'dashboardStats';

  constructor(private firebaseService: FirebaseService) {}

  // Get dashboard statistics from Firestore
  getDashboardStatsData(): Observable<DashboardStats> {
    return from(getDoc(doc(this.firebaseService.database, this.statsCollection, 'main'))).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            ...data,
            // Convert Firestore timestamps to Date objects
            timestamp: data['timestamp'] ? (data['timestamp'] as Timestamp).toDate() : new Date()
          } as DashboardStats;
        }
        // Return default stats if none exist
        return {
          id: 'main',
          totalEmployees: 0,
          activeEmployees: 0,
          totalPayroll: 0,
          thisMonthPayroll: 0,
          attendanceRate: 0,
          pendingTasks: 0,
          timestamp: new Date()
        };
      }),
      catchError(error => {
        console.error('Error fetching dashboard stats:', error);
        return of({
          id: 'main',
          totalEmployees: 0,
          activeEmployees: 0,
          totalPayroll: 0,
          thisMonthPayroll: 0,
          attendanceRate: 0,
          pendingTasks: 0,
          timestamp: new Date()
        });
      })
    );
  }

  // Get recent activities from Firestore
  getActivitiesData(): Observable<ActivityItem[]> {
    return from(getDocs(
      query(
        collection(this.firebaseService.database, this.activitiesCollection),
        orderBy('timestamp', 'desc'),
        limit(10)
      )
    )).pipe(
      map(querySnapshot => querySnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<ActivityItem, 'id'>;
        return {
          id: doc.id,
          ...data,
          // Convert Firestore timestamp to Date
          timestamp: data['timestamp'] ? (data['timestamp'] as any).toDate?.() || new Date(data['timestamp']) : new Date()
        } as ActivityItem;
      })),
      catchError(error => {
        console.error('Error fetching activities:', error);
        return of([]);
      })
    );
  }

  // Add new activity to Firestore
  addActivityData(activity: Omit<ActivityItem, 'id' | 'timestamp'>): Observable<ActivityItem> {
    const activityWithTimestamp = {
      ...activity,
      timestamp: new Date()
    };

    return from(addDoc(collection(this.firebaseService.database, this.activitiesCollection), activityWithTimestamp)).pipe(
      map(docRef => ({
        id: docRef.id,
        ...activityWithTimestamp
      })),
      catchError(error => {
        console.error('Error adding activity:', error);
        throw error;
      })
    );
  }

  // Update dashboard stats in Firestore
  updateStatsData(stats: Partial<DashboardStats>): Observable<void> {
    return from(updateDoc(doc(this.firebaseService.database, this.statsCollection, 'main'), {
      ...stats,
      updatedAt: new Date()
    })).pipe(
      catchError(error => {
        console.error('Error updating stats:', error);
        throw error;
      })
    );
  }

  // Delete activity from Firestore
  deleteActivityData(activityId: string): Observable<void> {
    return from(deleteDoc(doc(this.firebaseService.database, this.activitiesCollection, activityId))).pipe(
      catchError(error => {
        console.error('Error deleting activity:', error);
        throw error;
      })
    );
  }

  // Clear all activities from Firestore
  clearActivitiesData(): Observable<void> {
    return from(getDocs(collection(this.firebaseService.database, this.activitiesCollection))).pipe(
      switchMap(querySnapshot => {
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        return from(Promise.all(deletePromises));
      }),
      map(() => {}),
      catchError(error => {
        console.error('Error clearing activities:', error);
        throw error;
      })
    );
  }
}
