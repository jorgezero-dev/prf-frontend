import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit"; // Added type for PayloadAction
import axios from "axios";
import { login as loginApi } from "../../../services/authService"; // Import the service
import type { RootState } from "../../store";
import type { IUser, LoginCredentials, AuthResponse } from "../../../types"; // Added LoginCredentials, AuthResponse

interface AuthState {
  token: string | null;
  user: IUser | null; // Using IUser from types
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Helper function to get token from localStorage
const getTokenFromLocalStorage = (): string | null => {
  try {
    return localStorage.getItem("adminToken");
  } catch (e) {
    console.error("Could not access localStorage", e);
    return null;
  }
};

const initialState: AuthState = {
  token: getTokenFromLocalStorage(),
  user: null,
  isAuthenticated: !!getTokenFromLocalStorage(),
  isLoading: false,
  error: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk<
  AuthResponse, // Expect AuthResponse (which includes token and optional user)
  LoginCredentials,
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    // Use the authService login function
    const data = await loginApi(credentials);
    if (data.token) {
      localStorage.setItem("adminToken", data.token);
      // If user details are returned by loginApi, they will be in data.user
      return data; // Return the whole AuthResponse object
    } else {
      return rejectWithValue("Login failed: No token received.");
    }
  } catch (error) {
    let errorMessage = "An unexpected error occurred.";
    if (axios.isAxiosError(error)) {
      if (
        error.response &&
        error.response.data &&
        typeof error.response.data.message === "string"
      ) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return rejectWithValue(errorMessage);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("adminToken");
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          // Expect AuthResponse
          state.isLoading = false;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.user = action.payload.user || null; // Store user if present
          state.error = null;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          // If rejectWithValue was called with a value, it's in action.payload
          state.error = action.payload;
        } else if (action.error && action.error.message) {
          // Otherwise, if an error was thrown, it's in action.error
          state.error = action.error.message;
        } else {
          state.error = "Login failed due to an unknown error.";
        }
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectUser = (state: RootState) => state.auth.user; // Added selector for user

export default authSlice.reducer;
