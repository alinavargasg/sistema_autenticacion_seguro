import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../app.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectCurrentUser = createSelector(selectAuthState, state => state.user);
export const selectIsLoading = createSelector(selectAuthState, state => state.loading);