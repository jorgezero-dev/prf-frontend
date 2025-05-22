import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import {
  getAllProjectsAdmin,
  getProjectByIdAdmin,
  // createProject, // Commented out or remove if not used elsewhere for admin
  updateProjectAdmin,
  deleteProjectAdmin,
  createAdminProjectService, // Import the new service
} from "../../../services/projectService";
import type { RootState } from "../../store";
import type {
  IProject,
  PaginatedResponse,
  ProjectAdminState,
} from "../../../types";

const initialState: ProjectAdminState = {
  projects: [],
  currentProject: null,
  pagination: null,
  isLoadingList: false,
  isLoadingDetails: false,
  isSaving: false,
  isDeleting: false,
  listError: null,
  detailsError: null,
  saveError: null,
  deleteError: null,
  deleteSuccess: false,
};

// Async thunks
export const fetchAdminProjects = createAsyncThunk<
  PaginatedResponse<IProject>,
  {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  },
  { rejectValue: string }
>("projects/fetchAdminProjects", async (params, { rejectWithValue }) => {
  try {
    const response = await getAllProjectsAdmin(
      params.page,
      params.limit,
      params.status,
      params.sortBy,
      params.sortOrder
    );
    return response;
  } catch (error) {
    let errorMessage = "Failed to fetch projects.";
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

export const fetchAdminProjectById = createAsyncThunk<
  IProject,
  string, // Project ID
  { rejectValue: string }
>("projects/fetchAdminProjectById", async (projectId, { rejectWithValue }) => {
  try {
    const response = await getProjectByIdAdmin(projectId);
    return response;
  } catch (error) {
    let errorMessage = "Failed to fetch project details.";
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

export const createAdminProject = createAsyncThunk<
  IProject,
  Partial<IProject>, // Project data to create
  { rejectValue: string }
>("projects/createAdminProject", async (projectData, { rejectWithValue }) => {
  try {
    // Use the new service function that targets /admin/projects
    const response = await createAdminProjectService(projectData);
    return response;
  } catch (error) {
    let errorMessage = "Failed to create project.";
    if (axios.isAxiosError(error)) {
      // Corrected: Ensure 'error' (the caught error) is used here, not an undefined 'axiosError'
      const typedError = error as AxiosError<{ message?: string }>;
      errorMessage =
        typedError.response?.data?.message ||
        typedError.message ||
        errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return rejectWithValue(errorMessage);
  }
});

export const updateAdminProjectThunk = createAsyncThunk<
  IProject,
  { id: string; projectData: Partial<IProject> },
  { rejectValue: string }
>(
  "projects/updateAdminProject",
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const response = await updateProjectAdmin(id, projectData);
      return response;
    } catch (error) {
      let errorMessage = "Failed to update project.";
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
  }
);

export const deleteAdminProjectThunk = createAsyncThunk<
  { message: string; projectId: string }, // Return type includes projectId for removal from state
  string, // Project ID to delete
  { rejectValue: string }
>("projects/deleteAdminProject", async (projectId, { rejectWithValue }) => {
  try {
    const response = await deleteProjectAdmin(projectId);
    return { ...response, projectId };
  } catch (error) {
    let errorMessage = "Failed to delete project.";
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

const projectSlice = createSlice({
  name: "adminProjects",
  initialState,
  reducers: {
    clearProjectMessages: (state) => {
      state.listError = null;
      state.detailsError = null;
      state.saveError = null;
      state.deleteError = null;
      state.deleteSuccess = false;
    },
    setCurrentProject: (state, action: PayloadAction<IProject | null>) => {
      state.currentProject = action.payload;
      state.detailsError = null; // Clear previous error when setting/clearing current project
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admin Projects
      .addCase(fetchAdminProjects.pending, (state) => {
        state.isLoadingList = true;
        state.listError = null;
      })
      .addCase(
        fetchAdminProjects.fulfilled,
        (state, action: PayloadAction<PaginatedResponse<IProject>>) => {
          state.isLoadingList = false;
          state.projects = action.payload.data;
          state.pagination = {
            total: action.payload.total,
            page: action.payload.page,
            limit: action.payload.limit,
            totalPages: action.payload.totalPages,
          };
        }
      )
      .addCase(fetchAdminProjects.rejected, (state, action) => {
        state.isLoadingList = false;
        state.listError = action.payload as string;
      })
      // Fetch Admin Project By ID
      .addCase(fetchAdminProjectById.pending, (state) => {
        state.isLoadingDetails = true;
        state.detailsError = null;
      })
      .addCase(
        fetchAdminProjectById.fulfilled,
        (state, action: PayloadAction<IProject>) => {
          state.isLoadingDetails = false;
          state.currentProject = action.payload;
        }
      )
      .addCase(fetchAdminProjectById.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.detailsError = action.payload as string;
      })
      // Create Admin Project
      .addCase(createAdminProject.pending, (state) => {
        state.isSaving = true;
        state.saveError = null;
      })
      .addCase(
        createAdminProject.fulfilled,
        (state, action: PayloadAction<IProject>) => {
          state.isSaving = false;
          // Optionally add to the list if viewing the list, or simply rely on a re-fetch.
          // For now, we update currentProject, useful if navigating to edit page after create.
          state.currentProject = action.payload;
          // state.projects.unshift(action.payload); // Or add to list
        }
      )
      .addCase(createAdminProject.rejected, (state, action) => {
        state.isSaving = false;
        state.saveError = action.payload as string;
      })
      // Update Admin Project
      .addCase(updateAdminProjectThunk.pending, (state) => {
        state.isSaving = true;
        state.saveError = null;
      })
      .addCase(
        updateAdminProjectThunk.fulfilled,
        (state, action: PayloadAction<IProject>) => {
          state.isSaving = false;
          state.currentProject = action.payload;
          const index = state.projects.findIndex(
            (p) => p._id === action.payload._id
          );
          if (index !== -1) {
            state.projects[index] = action.payload;
          }
        }
      )
      .addCase(updateAdminProjectThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.saveError = action.payload as string;
      })
      // Delete Admin Project
      .addCase(deleteAdminProjectThunk.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(
        deleteAdminProjectThunk.fulfilled,
        (
          state,
          action: PayloadAction<{ message: string; projectId: string }>
        ) => {
          state.isDeleting = false;
          state.deleteSuccess = true;
          state.projects = state.projects.filter(
            (p) => p._id !== action.payload.projectId
          );
          if (state.currentProject?._id === action.payload.projectId) {
            state.currentProject = null;
          }
        }
      )
      .addCase(deleteAdminProjectThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      });
  },
});

export const { clearProjectMessages, setCurrentProject } = projectSlice.actions;

// Selectors
export const selectAdminProjectsList = (state: RootState) =>
  state.adminProjects.projects;
export const selectAdminProjectsPagination = (state: RootState) =>
  state.adminProjects.pagination;
export const selectIsAdminProjectsLoadingList = (state: RootState) =>
  state.adminProjects.isLoadingList;
export const selectAdminProjectsListError = (state: RootState) =>
  state.adminProjects.listError;

export const selectCurrentAdminProject = (state: RootState) =>
  state.adminProjects.currentProject;
export const selectIsAdminProjectLoadingDetails = (state: RootState) =>
  state.adminProjects.isLoadingDetails;
export const selectAdminProjectDetailsError = (state: RootState) =>
  state.adminProjects.detailsError;

export const selectIsAdminProjectSaving = (state: RootState) =>
  state.adminProjects.isSaving;
export const selectAdminProjectSaveError = (state: RootState) =>
  state.adminProjects.saveError;

export const selectIsAdminProjectDeleting = (state: RootState) =>
  state.adminProjects.isDeleting;
export const selectAdminProjectDeleteError = (state: RootState) =>
  state.adminProjects.deleteError;
export const selectAdminProjectDeleteSuccess = (state: RootState) =>
  state.adminProjects.deleteSuccess;

export default projectSlice.reducer;
