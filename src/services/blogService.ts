import api from "./api";
import { type IBlogPost, type PaginatedResponse } from "../types";

// Public Routes

/**
 * Fetches published blog posts with pagination, optional filtering, and search.
 * @param page - Page number.
 * @param limit - Number of items per page.
 * @param category - Optional category to filter by.
 * @param tag - Optional tag to filter by.
 * @param search - Optional search term.
 * @param sortBy - Optional field to sort by.
 * @param sortOrder - Optional sort order ("asc" or "desc").
 * @returns A promise that resolves to a paginated response of blog posts.
 */
export const getPublishedBlogPosts = async (
  page = 1,
  limit = 10,
  category?: string,
  tag?: string,
  search?: string,
  sortBy?: string, // Added sortBy
  sortOrder?: "asc" | "desc" // Added sortOrder
): Promise<PaginatedResponse<IBlogPost>> => {
  const params: Record<string, string | number> = { page, limit };
  if (category) params.category = category;
  if (tag) params.tag = tag;
  if (search) params.search = search;
  if (sortBy) params.sortBy = sortBy; // Added
  if (sortOrder) params.sortOrder = sortOrder; // Added

  const response = await api.get<PaginatedResponse<IBlogPost>>("/blog", {
    params,
  });
  return response.data;
};

/**
 * Fetches a single published blog post by its slug.
 * @param slug - The slug of the blog post.
 * @returns A promise that resolves to the blog post data.
 */
export const getPublishedBlogPostBySlug = async (
  slug: string
): Promise<IBlogPost> => {
  const response = await api.get<IBlogPost>(`/blog/${slug}`);
  return response.data;
};

/**
 * Fetches unique blog post tags.
 * @returns A promise that resolves to a list of unique tags.
 */
export const getBlogPostTags = async (): Promise<string[]> => {
  const response = await api.get<{ data: string[] }>("/blog/tags"); // Expect an object with a data property
  return response.data.data; // Return the array from the data property
};

/**
 * Fetches unique blog post categories.
 * @returns A promise that resolves to a list of unique categories.
 */
export const getBlogPostCategories = async (): Promise<string[]> => {
  const response = await api.get<{ data: string[] }>("/blog/categories"); // Expect an object with a data property
  return response.data.data; // Return the array from the data property
};

// Admin Routes

/**
 * Creates a new blog post.
 * @param blogPostData - The data for the new blog post.
 * @returns A promise that resolves to the created blog post data.
 */
export const createBlogPostAdmin = async (
  blogPostData: Partial<IBlogPost>
): Promise<IBlogPost> => {
  const response = await api.post<IBlogPost>("/admin/blog", blogPostData);
  return response.data;
};

/**
 * Fetches all blog posts (published and drafts) for admin users.
 * @param page - Page number.
 * @param limit - Number of items per page.
 * @param status - Optional status to filter by (e.g., "published", "draft").
 * @param search - Optional search term.
 * @param sortBy - Optional field to sort by.
 * @param sortOrder - Optional sort order ("asc" or "desc").
 * @returns A promise that resolves to a paginated response of blog posts.
 */
export const getAllBlogPostsAdmin = async (
  page = 1,
  limit = 10,
  status?: string,
  search?: string,
  sortBy = "createdAt",
  sortOrder = "desc"
): Promise<PaginatedResponse<IBlogPost>> => {
  const params = { page, limit, status, search, sortBy, sortOrder };
  const response = await api.get<PaginatedResponse<IBlogPost>>(
    "/admin/blog/all",
    { params }
  );
  return response.data;
};

/**
 * Fetches a single blog post by ID for admin users, regardless of status.
 * @param id - The MongoDB ID of the blog post.
 * @returns A promise that resolves to the blog post data.
 */
export const getBlogPostByIdAdmin = async (id: string): Promise<IBlogPost> => {
  const response = await api.get<IBlogPost>(`/admin/blog/${id}`);
  return response.data;
};

/**
 * Updates an existing blog post.
 * @param id - The MongoDB ID of the blog post to update.
 * @param blogPostData - The partial blog post data to update.
 * @returns A promise that resolves to the updated blog post data.
 */
export const updateBlogPostAdmin = async (
  id: string,
  blogPostData: Partial<IBlogPost>
): Promise<IBlogPost> => {
  const response = await api.put<IBlogPost>(`/admin/blog/${id}`, blogPostData);
  return response.data;
};

/**
 * Deletes a blog post.
 * @param id - The MongoDB ID of the blog post to delete.
 * @returns A promise that resolves when the blog post is deleted.
 */
export const deleteBlogPostAdmin = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/admin/blog/${id}`);
  return response.data;
};
