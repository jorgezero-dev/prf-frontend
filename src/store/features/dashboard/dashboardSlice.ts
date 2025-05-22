import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
// import api from "../../../services/api"; // No longer directly needed
import { getAdminDashboardStats } from "../../../services/dashboardService"; // Import the service
import type { RootState } from "../../store";
import type { DashboardStats, DashboardState } from "../../../types"; // Import from types

const initialState: DashboardState = {
  stats: null,
  isLoading: false,
  error: null,
};

// Async thunk for fetching dashboard stats
export const fetchDashboardStats = createAsyncThunk<
  DashboardStats, // Return type of the payload creator
  void, // First argument to the payload creator (no args in this case)
  { rejectValue: string } // Types for ThunkAPI
>("dashboard/fetchStats", async (_, { rejectWithValue }) => {
  try {
    // Use the dashboardService
    const data = await getAdminDashboardStats();
    return data;
  } catch (error) {
    let errorMessage = "Failed to fetch dashboard stats.";
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>; // Type assertion
      if (
        axiosError.response &&
        axiosError.response.data &&
        axiosError.response.data.message
      ) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return rejectWithValue(errorMessage);
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // Potential future reducers for dashboard interactions
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchDashboardStats.fulfilled,
        (state, action: PayloadAction<DashboardStats>) => {
          state.isLoading = false;
          state.stats = action.payload;
        }
      )
      .addCase(
        fetchDashboardStats.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.isLoading = false;
          state.error = action.payload || "An unknown error occurred";
        }
      );
  },
});

// Selectors
export const selectDashboardStats = (state: RootState) => state.dashboard.stats;
export const selectDashboardLoading = (state: RootState) =>
  state.dashboard.isLoading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;

export default dashboardSlice.reducer;
