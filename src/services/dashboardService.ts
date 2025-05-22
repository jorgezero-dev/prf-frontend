import api from "./api";
import { type DashboardStats } from "../types"; // Corrected AdminDashboardStats to DashboardStats

/**
 * Fetches admin dashboard statistics.
 * @returns A promise that resolves to the dashboard statistics.
 */
export const getAdminDashboardStats = async (): Promise<DashboardStats> => {
  // Endpoint from F-FR3.2 and API_ENDPOINTS.md (7.1)
  const response = await api.get<DashboardStats>("/admin/dashboard/stats");
  return response.data;
};
