import { State, StateContext, Action, Selector } from '@ngxs/store';
import { AuthStateModel, User } from '../../models/auth.model';
import { 
  Login, 
  LoginSuccess, 
  LoginFailure, 
  Logout, 
  LogoutSuccess, 
  LoadCurrentUser, 
  LoadCurrentUserSuccess, 
  LoadCurrentUserFailure, 
  ClearError, 
  SetToken 
} from '../action/auth.action';

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    token: null
  }
})
export class AuthState {

  @Selector()
  static currentUser(state: AuthStateModel): User | null {
    return state.currentUser;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Selector()
  static loading(state: AuthStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: AuthStateModel): string | null {
    return state.error;
  }

  @Selector()
  static token(state: AuthStateModel): string | null {
    return state.token;
  }

  @Selector()
  static userRole(state: AuthStateModel): string | null {
    return state.currentUser?.role || null;
  }

  @Selector()
  static isAdmin(state: AuthStateModel): boolean {
    return state.currentUser?.role === 'admin';
  }

  @Selector()
  static isManager(state: AuthStateModel): boolean {
    return state.currentUser?.role === 'admin' || state.currentUser?.role === 'manager';
  }

  // Login Actions
  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.patchState({ loading: true, error: null });
  }

  @Action(LoginSuccess)
  loginSuccess(ctx: StateContext<AuthStateModel>, action: LoginSuccess) {
    const response = action.payload;
    if (!response) return;
    
    ctx.patchState({
      currentUser: response.user,
      isAuthenticated: true,
      loading: false,
      error: null,
      token: response.token
    });
  }

  @Action(LoginFailure)
  loginFailure(ctx: StateContext<AuthStateModel>, action: LoginFailure) {
    const error = action.payload?.error || 'Unknown error';
    ctx.patchState({
      loading: false,
      error: error
    });
  }

  // Logout Actions
  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ loading: true, error: null });
  }

  @Action(LogoutSuccess)
  logoutSuccess(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({
      currentUser: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      token: null
    });
  }

  // Load Current User
  @Action(LoadCurrentUser)
  loadCurrentUser(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ loading: true, error: null });
  }

  @Action(LoadCurrentUserSuccess)
  loadCurrentUserSuccess(ctx: StateContext<AuthStateModel>, action: LoadCurrentUserSuccess) {
    const payload = action.payload;
    if (!payload) return;
    
    const user = payload.user;
    ctx.patchState({
      currentUser: user,
      isAuthenticated: true,
      loading: false,
      error: null
    });
  }

  @Action(LoadCurrentUserFailure)
  loadCurrentUserFailure(ctx: StateContext<AuthStateModel>, action: LoadCurrentUserFailure) {
    const error = action.payload?.error || 'Unknown error';
    ctx.patchState({
      loading: false,
      error: error
    });
  }

  // Clear Error
  @Action(ClearError)
  clearError(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ error: null });
  }

  // Set Token
  @Action(SetToken)
  setToken(ctx: StateContext<AuthStateModel>, action: SetToken) {
    const token = action.payload?.token;
    ctx.patchState({ token });
  }
}
