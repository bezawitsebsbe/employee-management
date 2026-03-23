import { State, StateContext, Action, Selector } from '@ngxs/store';
import { DashboardStats, ActivityItem } from '../../models/dashboard.model';
import { tap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import {
  LoadDashboardStats,
  LoadDashboardStatsSuccess,
  LoadDashboardStatsFailure,
  LoadRecentActivities,
  LoadRecentActivitiesSuccess,
  LoadRecentActivitiesFailure,
  AddActivity,
  ClearActivities,
  UpdateStats
} from '../action/dashboard.action';


export interface DashboardStateModel {
  stats: DashboardStats | null;
  recentActivities: ActivityItem[];
  loading: boolean;
  error: string | null;
}

@State<DashboardStateModel>({
  name: 'dashboard',
  defaults: {
    stats: null,
    recentActivities: [],
    loading: false,
    error: null
  }
})
export class DashboardState {
  
  @Selector()
  static stats(state: DashboardStateModel): DashboardStats | null {
    return state.stats;
  }

  @Selector()
  static recentActivities(state: DashboardStateModel): ActivityItem[] {
    return state.recentActivities;
  }

  @Selector()
  static loading(state: DashboardStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: DashboardStateModel): string | null {
    return state.error;
  }

  @Action(LoadDashboardStats)
  loadDashboardStats({ patchState, dispatch }: StateContext<DashboardStateModel>): Observable<any> {
    patchState({ loading: true, error: null });
    
    // Simulate API call - replace with actual service call
    return of({}).pipe(
      tap(() => {
        const mockStats: DashboardStats = {
          id: '1',
          totalEmployees: 150,
          activeEmployees: 142,
          totalPayroll: 500000,
          thisMonthPayroll: 45000,
          attendanceRate: 95.5,
          pendingTasks: 8,
          timestamp: new Date()
        };
        dispatch(new LoadDashboardStatsSuccess({ stats: mockStats }));
      }),
      catchError((error) => {
        dispatch(new LoadDashboardStatsFailure({ error: error.message || 'Failed to load dashboard stats' }));
        return of();
      })
    );
  }

  @Action(LoadDashboardStatsSuccess)
  loadDashboardStatsSuccess({ patchState }: StateContext<DashboardStateModel>, action: LoadDashboardStatsSuccess) {
    patchState({
      stats: action.payload?.stats,
      loading: false,
      error: null
    });
  }

  @Action(LoadDashboardStatsFailure)
  loadDashboardStatsFailure({ patchState }: StateContext<DashboardStateModel>, action: LoadDashboardStatsFailure) {
    patchState({
      loading: false,
      error: action.payload?.error
    });
  }

  @Action(LoadRecentActivities)
  loadRecentActivities({ patchState, dispatch }: StateContext<DashboardStateModel>): Observable<any> {
    patchState({ loading: true, error: null });
    
    // Simulate API call - replace with actual service call
    return of({}).pipe(
      tap(() => {
        const mockActivities: ActivityItem[] = [
          {
            id: '1',
            type: 'employee',
            title: 'New Employee Added',
            description: 'John Doe joined the company',
            timestamp: new Date(),
            color: 'green',
            icon: 'user-add'
          },
          {
            id: '2',
            type: 'payroll',
            title: 'Payroll Processed',
            description: 'Monthly payroll processed successfully',
            timestamp: new Date(Date.now() - 3600000),
            color: 'blue',
            icon: 'dollar'
          }
        ];
        dispatch(new LoadRecentActivitiesSuccess({ activities: mockActivities }));
      }),
      catchError((error) => {
        dispatch(new LoadRecentActivitiesFailure({ error: error.message || 'Failed to load recent activities' }));
        return of();
      })
    );
  }

  @Action(LoadRecentActivitiesSuccess)
  loadRecentActivitiesSuccess({ patchState }: StateContext<DashboardStateModel>, action: LoadRecentActivitiesSuccess) {
    patchState({
      recentActivities: action.payload?.activities || [],
      loading: false,
      error: null
    });
  }

  @Action(LoadRecentActivitiesFailure)
  loadRecentActivitiesFailure({ patchState }: StateContext<DashboardStateModel>, action: LoadRecentActivitiesFailure) {
    patchState({
      loading: false,
      error: action.payload?.error
    });
  }

  @Action(AddActivity)
  addActivity({ patchState, getState }: StateContext<DashboardStateModel>, action: AddActivity) {
    const currentActivities = getState().recentActivities;
    const newActivity = action.payload?.activity;
    if (newActivity) {
      const updatedActivities = [newActivity, ...currentActivities].slice(0, 10); // Keep last 10
      patchState({
        recentActivities: updatedActivities
      });
    }
  }

  @Action(ClearActivities)
  clearActivities({ patchState }: StateContext<DashboardStateModel>) {
    patchState({
      recentActivities: []
    });
  }

  @Action(UpdateStats)
  updateStats({ patchState, getState }: StateContext<DashboardStateModel>, action: UpdateStats) {
    const currentStats = getState().stats;
    const newStats = action.payload?.stats;
    if (currentStats && newStats) {
      patchState({
        stats: { ...currentStats, ...newStats }
      });
    }
  }
}
