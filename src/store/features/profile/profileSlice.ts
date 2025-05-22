// filepath: c:\Users\joen_\Dev\portfolio\prf-frontend\src\store\features\profile\profileSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
// import api from "../../../services/api"; // No longer directly needed
import {
  getAdminProfile,
  updateAdminProfile,
} from "../../../services/profileService"; // Import the services
import type { RootState } from "../../store";
import type { IProfileAdmin, ProfileAdminState } from "../../../types";
import axios, { AxiosError } from "axios";
import { uploadResumeFile } from "../../../services/resumeService"; // Import the new service

const initialState: ProfileAdminState = {
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,
  saveError: null,
};

// Async thunk for fetching admin profile data
export const fetchAdminProfile = createAsyncThunk<
  IProfileAdmin, // Return type
  void, // Arguments type (no args)
  { rejectValue: string; state: RootState }
>("profile/fetchAdminProfile", async (_, { rejectWithValue }) => {
  try {
    // Use the profileService
    const data = await getAdminProfile();
    return data;
  } catch (error) {
    let errorMessage = "Failed to fetch profile data.";
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return rejectWithValue(errorMessage);
  }
});

// Async thunk for updating (or creating) admin profile data
export const upsertAdminProfile = createAsyncThunk<
  IProfileAdmin, // Return type
  Partial<IProfileAdmin>, // Argument type: the profile data to save
  { rejectValue: string; state: RootState } // Removed getState from here as it's not used
>("profile/upsertAdminProfile", async (profileData, { rejectWithValue }) => {
  try {
    // Use the profileService
    const data = await updateAdminProfile(profileData);
    return data;
  } catch (error) {
    let errorMessage = "Failed to save profile data.";
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return rejectWithValue(errorMessage);
  }
});

// Async thunk for uploading a resume
export const uploadResume = createAsyncThunk<
  string, // Return type: the new resume URL
  File, // Argument type: the file to upload
  { rejectValue: string; state: RootState }
>("profile/uploadResume", async (file, { rejectWithValue, dispatch }) => {
  try {
    const response = await uploadResumeFile(file);
    // After successful upload, update the profile state with the new URL
    dispatch(upsertAdminProfile({ resumeUrl: response.resumeUrl }));
    return response.resumeUrl;
  } catch (error) {
    let errorMessage = "Failed to upload resume.";
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return rejectWithValue(errorMessage);
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileMessages: (state) => {
      state.error = null;
      state.saveError = null;
    },
    // If needed, a reducer to set a blank profile for creation form
    // initializeNewProfile: (state) => {
    //   state.profile = { biography: '', profilePictureUrl: '', contactEmail: '', skills: [] };
    // }
  },
  extraReducers: (builder) => {
    builder
      // Fetch admin profile
      .addCase(fetchAdminProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchAdminProfile.fulfilled,
        (state, action: PayloadAction<IProfileAdmin>) => {
          state.isLoading = false;
          state.profile = action.payload;
        }
      )
      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // If fetch fails (e.g., 404), profile remains null, allowing form to be used for creation
      })
      // Upsert admin profile
      .addCase(upsertAdminProfile.pending, (state) => {
        state.isSaving = true;
        state.saveError = null;
      })
      .addCase(
        upsertAdminProfile.fulfilled,
        (state, action: PayloadAction<IProfileAdmin>) => {
          state.isSaving = false;
          state.profile = action.payload; // Update state with the saved/created profile
        }
      )
      .addCase(upsertAdminProfile.rejected, (state, action) => {
        state.isSaving = false;
        state.saveError = action.payload as string;
      })
      // Handle resume upload thunk
      .addCase(uploadResume.pending, (state) => {
        state.isSaving = true; // Or a new state like isUploadingResume
        state.saveError = null;
      })
      .addCase(
        uploadResume.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isSaving = false;
          if (state.profile) {
            state.profile.resumeUrl = action.payload;
          }
          // Optionally, you might want to refetch the profile or merge the URL
          // For now, directly updating if profile exists.
        }
      )
      .addCase(uploadResume.rejected, (state, action) => {
        state.isSaving = false;
        state.saveError = action.payload as string; // Or a specific resumeUploadError
      });
  },
});

export const { clearProfileMessages } = profileSlice.actions;

// Selectors
export const selectAdminProfileData = (state: RootState) =>
  state.profile.profile;
export const selectIsAdminProfileLoading = (state: RootState) =>
  state.profile.isLoading;
export const selectIsAdminProfileSaving = (state: RootState) =>
  state.profile.isSaving;
export const selectAdminProfileFetchError = (state: RootState) =>
  state.profile.error;
export const selectAdminProfileSaveError = (state: RootState) =>
  state.profile.saveError;

export default profileSlice.reducer;
