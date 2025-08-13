import { User } from "../../shared/models/user.model";

export interface AppState {
  auth: AuthState;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  loading: false,
  error: null
};