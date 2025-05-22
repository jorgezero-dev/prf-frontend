import api from "./api";
import { type IProfile, type IProfileAdmin } from "../types"; // Assuming IProfile is the public and IProfileAdmin is the admin version

/**
 * Fetches the admin profile data.
 * @returns A promise that resolves to the admin profile data.
 */
export const getAdminProfile = async (): Promise<IProfileAdmin> => {
  const response = await api.get<IProfileAdmin>("/profile");
  return response.data;
};

/**
 * Updates the admin profile data.
 * @param profileData - The partial profile data to update.
 * @returns A promise that resolves to the updated admin profile data.
 */
export const updateAdminProfile = async (
  profileData: Partial<IProfileAdmin>
): Promise<IProfileAdmin> => {
  const response = await api.put<IProfileAdmin>("/profile", profileData);
  return response.data;
};

/**
 * Fetches public profile information.
 * Note: The current backend /api/profile is admin protected.
 * This function assumes a public endpoint like /api/profile/public might exist in the future
 * or that relevant public info is fetched differently (e.g. site settings).
 * Adjust endpoint as per actual public profile data source.
 */
export const getPublicProfile = async (): Promise<IProfile> => {
  // Assuming '/api/profile' is now the public endpoint for basic profile info
  const response = await api.get<IProfile>("/profile");
  return response.data;
};
