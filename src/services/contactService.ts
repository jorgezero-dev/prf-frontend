// filepath: c:\\Users\\joen_\\Dev\\portfolio\\prf-frontend\\src\\services\\contactService.ts
import api from "./api";
import { type IContactSubmission, type PaginatedResponse } from "../types"; // Assuming types are defined

export interface ContactFormData {
  // Exporting for use in the component
  name: string;
  email: string;
  subject?: string;
  message: string;
  // captchaToken?: string; // If you add CAPTCHA
}

export interface SubmitContactFormResponse {
  // Exporting for use in the component
  message: string;
  submission?: IContactSubmission; // Optional: backend might return the created submission
}

/**
 * Submits the contact form.
 * @param formData - The contact form data (name, email, subject, message).
 * @returns A promise that resolves to the submission response.
 */
export const submitContactForm = async (
  formData: ContactFormData
): Promise<SubmitContactFormResponse> => {
  const response = await api.post<SubmitContactFormResponse>(
    "/contact",
    formData
  ); // Endpoint from API_ENDPOINTS.md (6.1)
  return response.data;
};

// Admin Routes

/**
 * Fetches contact submissions for admin users.
 * @param page - Page number.
 * @param limit - Number of items per page.
 * @param isRead - Optional filter for read status.
 * @param sortBy - Optional field to sort by.
 * @param sortOrder - Optional sort order ("asc" or "desc").
 * @returns A promise that resolves to a paginated response of contact submissions.
 */
export const getContactSubmissionsAdmin = async (
  page = 1,
  limit = 10,
  isRead?: boolean,
  sortBy = "createdAt",
  sortOrder = "desc"
): Promise<PaginatedResponse<IContactSubmission>> => {
  const params: Record<string, string | number | boolean> = {
    page,
    limit,
    sortBy,
    sortOrder,
  };
  if (typeof isRead === "boolean") {
    params.isRead = isRead;
  }
  // Endpoint from F-FR3.7, assuming /api/admin/contact-submissions from API_ENDPOINTS.md (Table of Contents)
  // and matching query params from F-FR3.7
  const response = await api.get<PaginatedResponse<IContactSubmission>>(
    "/admin/contact-submissions",
    { params }
  );
  return response.data;
};

/**
 * Updates the read status of a contact submission.
 * @param id - The ID of the contact submission.
 * @param isRead - The new read status.
 * @returns A promise that resolves to the updated contact submission.
 */
export const updateContactSubmissionStatusAdmin = async (
  id: string,
  isRead: boolean
): Promise<IContactSubmission> => {
  // Endpoint from API_ENDPOINTS.md (6.4)
  const response = await api.patch<IContactSubmission>(
    `/admin/contact-submissions/${id}/status`, // Corrected path
    { isRead }
  );
  return response.data;
};

/**
 * Deletes a contact submission.
 * @param id - The ID of the contact submission to delete.
 * @returns A promise that resolves when the submission is deleted.
 */
export const deleteContactSubmissionAdmin = async (
  id: string
): Promise<{ message: string }> => {
  // Endpoint from API_ENDPOINTS.md (6.5)
  const response = await api.delete<{ message: string }>(
    `/admin/contact-submissions/${id}`
  );
  return response.data;
};
