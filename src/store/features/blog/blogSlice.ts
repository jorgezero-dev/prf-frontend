import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { type AxiosError } from "axios";
import {
  getAllBlogPostsAdmin,
  getBlogPostByIdAdmin,
  createBlogPostAdmin,
  updateBlogPostAdmin,
  deleteBlogPostAdmin,
} from "../../../services/blogService";
import type { RootState } from "../../store";
import type {
  IBlogPost,
  PaginatedResponse,
  BlogAdminState,
} from "../../../types";

const initialState: BlogAdminState = {
  posts: [],
  currentPost: null,
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
export const fetchAdminBlogPosts = createAsyncThunk<
  PaginatedResponse<IBlogPost>,
  {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  },
  { rejectValue: string }
>("adminBlog/fetchAdminBlogPosts", async (params, { rejectWithValue }) => {
  try {
    const response = await getAllBlogPostsAdmin(
      params.page,
      params.limit,
      params.status,
      params.search,
      params.sortBy,
      params.sortOrder
    );
    return response;
  } catch (error) {
    let errorMessage = "Failed to fetch blog posts.";
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

export const fetchAdminBlogPostById = createAsyncThunk<
  IBlogPost,
  string, // Blog Post ID
  { rejectValue: string }
>("adminBlog/fetchAdminBlogPostById", async (postId, { rejectWithValue }) => {
  try {
    const response = await getBlogPostByIdAdmin(postId);
    return response;
  } catch (error) {
    let errorMessage = "Failed to fetch blog post details.";
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

export const createAdminBlogPost = createAsyncThunk<
  IBlogPost,
  Partial<IBlogPost>, // Blog post data to create
  { rejectValue: string }
>("adminBlog/createAdminBlogPost", async (postData, { rejectWithValue }) => {
  try {
    const response = await createBlogPostAdmin(postData);
    return response;
  } catch (error) {
    let errorMessage = "Failed to create blog post.";
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

export const updateAdminBlogPostThunk = createAsyncThunk<
  IBlogPost,
  { id: string; postData: Partial<IBlogPost> },
  { rejectValue: string }
>(
  "adminBlog/updateAdminBlogPost",
  async ({ id, postData }, { rejectWithValue }) => {
    try {
      const response = await updateBlogPostAdmin(id, postData);
      return response;
    } catch (error) {
      let errorMessage = "Failed to update blog post.";
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

export const deleteAdminBlogPostThunk = createAsyncThunk<
  { message: string; postId: string }, // Return type includes postId for removal from state
  string, // Blog Post ID to delete
  { rejectValue: string }
>("adminBlog/deleteAdminBlogPost", async (postId, { rejectWithValue }) => {
  try {
    const response = await deleteBlogPostAdmin(postId);
    return { ...response, postId };
  } catch (error) {
    let errorMessage = "Failed to delete blog post.";
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

const blogSlice = createSlice({
  name: "adminBlog",
  initialState,
  reducers: {
    clearBlogMessages: (state) => {
      state.listError = null;
      state.detailsError = null;
      state.saveError = null;
      state.deleteError = null;
      state.deleteSuccess = false;
    },
    setCurrentBlogPost: (state, action: PayloadAction<IBlogPost | null>) => {
      state.currentPost = action.payload;
      state.detailsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Admin Blog Posts
      .addCase(fetchAdminBlogPosts.pending, (state) => {
        state.isLoadingList = true;
        state.listError = null;
      })
      .addCase(
        fetchAdminBlogPosts.fulfilled,
        (state, action: PayloadAction<PaginatedResponse<IBlogPost>>) => {
          state.isLoadingList = false;
          state.posts = action.payload.data;
          state.pagination = {
            total: action.payload.total,
            page: action.payload.page,
            limit: action.payload.limit,
            totalPages: action.payload.totalPages,
          };
        }
      )
      .addCase(fetchAdminBlogPosts.rejected, (state, action) => {
        state.isLoadingList = false;
        state.listError = action.payload as string;
      })
      // Fetch Admin Blog Post By ID
      .addCase(fetchAdminBlogPostById.pending, (state) => {
        state.isLoadingDetails = true;
        state.detailsError = null;
      })
      .addCase(
        fetchAdminBlogPostById.fulfilled,
        (state, action: PayloadAction<IBlogPost>) => {
          state.isLoadingDetails = false;
          state.currentPost = action.payload;
        }
      )
      .addCase(fetchAdminBlogPostById.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.detailsError = action.payload as string;
      })
      // Create Admin Blog Post
      .addCase(createAdminBlogPost.pending, (state) => {
        state.isSaving = true;
        state.saveError = null;
      })
      .addCase(
        createAdminBlogPost.fulfilled,
        (state, action: PayloadAction<IBlogPost>) => {
          state.isSaving = false;
          state.currentPost = action.payload;
          // state.posts.unshift(action.payload); // Optionally add to list
        }
      )
      .addCase(createAdminBlogPost.rejected, (state, action) => {
        state.isSaving = false;
        state.saveError = action.payload as string;
      })
      // Update Admin Blog Post
      .addCase(updateAdminBlogPostThunk.pending, (state) => {
        state.isSaving = true;
        state.saveError = null;
      })
      .addCase(
        updateAdminBlogPostThunk.fulfilled,
        (state, action: PayloadAction<IBlogPost>) => {
          state.isSaving = false;
          state.currentPost = action.payload;
          const index = state.posts.findIndex(
            (p) => p._id === action.payload._id
          );
          if (index !== -1) {
            state.posts[index] = action.payload;
          }
        }
      )
      .addCase(updateAdminBlogPostThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.saveError = action.payload as string;
      })
      // Delete Admin Blog Post
      .addCase(deleteAdminBlogPostThunk.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
        state.deleteSuccess = false;
      })
      .addCase(
        deleteAdminBlogPostThunk.fulfilled,
        (state, action: PayloadAction<{ message: string; postId: string }>) => {
          state.isDeleting = false;
          state.deleteSuccess = true;
          state.posts = state.posts.filter(
            (p) => p._id !== action.payload.postId
          );
          if (state.currentPost?._id === action.payload.postId) {
            state.currentPost = null;
          }
        }
      )
      .addCase(deleteAdminBlogPostThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      });
  },
});

export const { clearBlogMessages, setCurrentBlogPost } = blogSlice.actions;

// Selectors
export const selectAdminBlogPosts = (state: RootState) => state.adminBlog.posts;
export const selectAdminBlogPagination = (state: RootState) =>
  state.adminBlog.pagination;
export const selectAdminCurrentBlogPost = (state: RootState) =>
  state.adminBlog.currentPost;
export const selectIsAdminBlogPostsLoadingList = (state: RootState) =>
  state.adminBlog.isLoadingList;
export const selectIsAdminBlogPostLoadingDetails = (state: RootState) =>
  state.adminBlog.isLoadingDetails;
export const selectIsAdminBlogPostSaving = (state: RootState) =>
  state.adminBlog.isSaving;
export const selectIsAdminBlogPostDeleting = (state: RootState) =>
  state.adminBlog.isDeleting;
export const selectAdminBlogPostListError = (state: RootState) =>
  state.adminBlog.listError;
export const selectAdminBlogPostDetailsError = (state: RootState) =>
  state.adminBlog.detailsError;
export const selectAdminBlogPostSaveError = (state: RootState) =>
  state.adminBlog.saveError;
export const selectAdminBlogPostDeleteError = (state: RootState) =>
  state.adminBlog.deleteError;
export const selectAdminBlogPostDeleteSuccess = (state: RootState) =>
  state.adminBlog.deleteSuccess;

export default blogSlice.reducer;
