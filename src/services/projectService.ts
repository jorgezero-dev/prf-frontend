import api from "./api";
import { type IProject, type PaginatedResponse } from "../types";

// Public Routes

/**
 * Fetches published projects with pagination and optional filtering.
 * @param page - Page number.
 * @param limit - Number of items per page.
 * @param category - Optional category to filter by.
 * @param featured - Optional flag to fetch only featured projects.
 * @returns A promise that resolves to a paginated response of projects.
 */
export const getPublishedProjects = async (
  page = 1,
  limit = 9,
  category?: string,
  featured?: boolean
): Promise<PaginatedResponse<IProject>> => {
  const params: Record<string, string | number | boolean> = { page, limit };
  if (category) params.category = category;
  if (featured) params.featured = featured;

  const response = await api.get<PaginatedResponse<IProject>>("/projects", {
    params,
  });
  return response.data;
};

/**
 * Fetches a single published project by its ID or slug.
 * @param idOrSlug - The ID or slug of the project.
 * @returns A promise that resolves to the project data.
 */
export const getPublishedProjectByIdOrSlug = async (
  idOrSlug: string
): Promise<IProject> => {
  const response = await api.get<IProject>(`/projects/${idOrSlug}`);
  return response.data;
};

// Admin Routes

/**
 * Creates a new project.
 * @param projectData - The data for the new project.
 * @returns A promise that resolves to the created project data.
 */
export const createProject = async (
  projectData: Partial<IProject>
): Promise<IProject> => {
  const response = await api.post<IProject>("/projects", projectData);
  return response.data;
};

/**
 * Creates a new project via admin route.
 * @param projectData - The data for the new project.
 * @returns A promise that resolves to the created project data.
 */
export const createAdminProjectService = async (
  projectData: Partial<IProject>
): Promise<IProject> => {
  const response = await api.post<IProject>("/admin/projects", projectData); // Target /admin/projects
  return response.data;
};

/**
 * Fetches all projects (published and drafts) for admin users.
 * @param page - Page number.
 * @param limit - Number of items per page.
 * @param status - Optional status to filter by (e.g., "published", "draft").
 * @param sortBy - Optional field to sort by.
 * @param sortOrder - Optional sort order ("asc" or "desc").
 * @returns A promise that resolves to a paginated response of projects.
 */
export const getAllProjectsAdmin = async (
  page = 1,
  limit = 10,
  status?: string,
  sortBy = "createdAt",
  sortOrder = "desc"
): Promise<PaginatedResponse<IProject>> => {
  const params = { page, limit, status, sortBy, sortOrder };
  const response = await api.get<PaginatedResponse<IProject>>(
    "/admin/projects",
    { params }
  );
  return response.data;
};

/**
 * Fetches a single project by ID for admin users, regardless of status.
 * @param id - The MongoDB ID of the project.
 * @returns A promise that resolves to the project data.
 */
export const getProjectByIdAdmin = async (id: string): Promise<IProject> => {
  const response = await api.get<IProject>(`/admin/projects/${id}`);
  return response.data;
};

/**
 * Updates an existing project.
 * @param id - The MongoDB ID of the project to update.
 * @param projectData - The partial project data to update.
 * @returns A promise that resolves to the updated project data.
 */
export const updateProjectAdmin = async (
  id: string,
  projectData: Partial<IProject>
): Promise<IProject> => {
  const response = await api.put<IProject>(
    `/admin/projects/${id}`,
    projectData
  );
  return response.data;
};

/**
 * Deletes a project.
 * @param id - The MongoDB ID of the project to delete.
 * @returns A promise that resolves when the project is deleted.
 */
export const deleteProjectAdmin = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/admin/projects/${id}`
  );
  return response.data;
};
