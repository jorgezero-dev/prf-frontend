import api from "./api";
import { type LoginCredentials, type AuthResponse } from "../types"; // Assuming types are defined in ../types

/**
 * Logs in a user.
 * @param credentials - The email and password for login.
 * @returns A promise that resolves to the authentication response (e.g., token).
 */
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", credentials);
  return response.data;
};

// Add other auth-related API calls here if needed (e.g., refresh token, forgot password)
