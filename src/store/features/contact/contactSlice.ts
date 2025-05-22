import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
// import api from "../../../services/api"; // No longer directly used here
import {
  getContactSubmissionsAdmin,
  updateContactSubmissionStatusAdmin,
  deleteContactSubmissionAdmin,
} from "../../../services/contactService"; // Import service functions
import type { IContactSubmission, PaginatedResponse } from "../../../types";

interface ContactAdminState {
  submissions: IContactSubmission[];
  currentSubmission: IContactSubmission | null;
  isLoading: boolean;
  error: string | null | undefined;
  totalPages: number;
  currentPage: number;
  totalCount: number;
  message: string | null;
}

const initialState: ContactAdminState = {
  submissions: [],
  currentSubmission: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  totalCount: 0,
  message: null,
};

interface FetchSubmissionsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Helper to extract error messages
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return err.response?.data?.message || err.message || defaultMessage;
  }
  return defaultMessage;
};

// Thunks
export const fetchSubmissions = createAsyncThunk<
  PaginatedResponse<IContactSubmission>,
  FetchSubmissionsParams,
  { rejectValue: string }
>("contactAdmin/fetchSubmissions", async (params = {}, { rejectWithValue }) => {
  try {
    // const response = await api.get("/api/admin/contact-submissions", {
    //   params,
    // });
    // return response.data as PaginatedResponse<IContactSubmission>;
    const data = await getContactSubmissionsAdmin(
      params.page,
      params.limit,
      params.isRead,
      params.sortBy,
      params.sortOrder
    );
    return data;
  } catch (error: unknown) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to fetch submissions")
    );
  }
});

interface MarkAsReadParams {
  id: string;
  isRead: boolean;
}

export const markSubmissionAsRead = createAsyncThunk<
  IContactSubmission,
  MarkAsReadParams,
  { rejectValue: string }
>(
  "contactAdmin/markSubmissionAsRead",
  async ({ id, isRead }, { rejectWithValue }) => {
    try {
      // const response = await api.patch(
      //   `/api/admin/contact-submissions/${id}/status`,
      //   { isRead }
      // );
      // return response.data as IContactSubmission;
      const data = await updateContactSubmissionStatusAdmin(id, isRead);
      return data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update submission status")
      );
    }
  }
);

export const deleteSubmission = createAsyncThunk<
  { message: string; id: string },
  string, // Argument is the ID of the submission to delete
  { rejectValue: string }
>("contactAdmin/deleteSubmission", async (id, { rejectWithValue }) => {
  try {
    // const response = await api.delete(`/api/admin/contact-submissions/${id}`);
    // return { ...response.data, id };
    const data = await deleteContactSubmissionAdmin(id);
    return { ...data, id };
  } catch (error: unknown) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to delete submission")
    );
  }
});

const contactAdminSlice = createSlice({
  name: "contactAdmin",
  initialState,
  reducers: {
    clearContactAdminError: (state) => {
      state.error = null;
    },
    clearContactAdminMessage: (state) => {
      state.message = null;
    },
    setCurrentSubmission: (
      state,
      action: PayloadAction<IContactSubmission | null>
    ) => {
      state.currentSubmission = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Submissions
      .addCase(fetchSubmissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchSubmissions.fulfilled,
        (
          state,
          action: PayloadAction<PaginatedResponse<IContactSubmission>>
        ) => {
          state.isLoading = false;
          state.submissions = action.payload.data;
          state.totalPages = action.payload.totalPages || 0;
          state.currentPage = action.payload.page || 1;
          state.totalCount = action.payload.total || 0;
        }
      )
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark Submission As Read
      .addCase(markSubmissionAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(
        markSubmissionAsRead.fulfilled,
        (state, action: PayloadAction<IContactSubmission>) => {
          state.isLoading = false;
          state.message = "Submission status updated successfully.";
          const index = state.submissions.findIndex(
            (sub) => sub._id === action.payload._id
          );
          if (index !== -1) {
            state.submissions[index] = action.payload;
          }
          if (state.currentSubmission?._id === action.payload._id) {
            state.currentSubmission = action.payload;
          }
        }
      )
      .addCase(markSubmissionAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Submission
      .addCase(deleteSubmission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(
        deleteSubmission.fulfilled,
        (state, action: PayloadAction<{ message: string; id: string }>) => {
          state.isLoading = false;
          state.message = action.payload.message;
          state.submissions = state.submissions.filter(
            (sub) => sub._id !== action.payload.id
          );
          state.totalCount = Math.max(0, state.totalCount - 1);
          if (state.currentSubmission?._id === action.payload.id) {
            state.currentSubmission = null;
          }
          if (
            state.submissions.length === 0 &&
            state.currentPage > 1 &&
            state.totalCount > 0
          ) {
            state.currentPage = Math.max(1, state.currentPage - 1);
          } else if (state.submissions.length === 0 && state.totalCount === 0) {
            state.currentPage = 1;
            state.totalPages = 0;
          }
        }
      )
      .addCase(deleteSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearContactAdminError,
  clearContactAdminMessage,
  setCurrentSubmission,
} = contactAdminSlice.actions;

export default contactAdminSlice.reducer;
