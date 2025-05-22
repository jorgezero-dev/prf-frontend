import api from "./api";

interface ResumeUrlResponse {
  resumeUrl: string;
  message?: string; // For success messages from POST/PUT
}

/**
 * Fetches the resume URL.
 * @returns A promise that resolves to the resume URL data.
 * @deprecated Resume URL is now integrated into the profile model.
 */
export const getResumeUrl = async (): Promise<ResumeUrlResponse> => {
  // Resume URL is now part of the profile data
  // For backward compatibility, we'll keep this method
  const response = await api.get<ResumeUrlResponse>("/resume/url");
  return response.data;
};

/**
 * Uploads a resume file.
 * @param file - The resume file to upload.
 * @returns A promise that resolves to the new resume URL.
 */
export const uploadResumeFile = async (
  file: File
): Promise<ResumeUrlResponse> => {
  const formData = new FormData();
  formData.append("resume", file);

  // Assuming the backend endpoint for file upload is POST /api/admin/resume/upload
  // Adjust the endpoint if it's different based on your backend implementation.
  const response = await api.post<ResumeUrlResponse>(
    "/admin/profile/resume/upload", // F-FR3.6 suggests /api/admin/resume for uploads
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

/**
 * Updates or sets the resume URL.
 * @param resumeUrl - The new URL for the resume.
 * @returns A promise that resolves to the success response.
 */
export const updateResumeUrl = async (
  resumeUrl: string
): Promise<ResumeUrlResponse> => {
  // API_ENDPOINTS.md (5.1) indicates POST /api/resume, but F-FR3.6 suggests PUT /api/admin/resume/url.
  // This function might be for updating the URL directly, not uploading a file.
  // For file uploads, use uploadResumeFile.
  const response = await api.put<ResumeUrlResponse>("/admin/resume/url", {
    // Changed to PUT as per F-FR3.6 for URL update
    url: resumeUrl,
  });
  return response.data;
};
