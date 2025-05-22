import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"; // Exportar la baseURL
// Define y exporta la URL base para archivos estáticos, que podría ser diferente a la API_BASE_URL
// Por ejemplo, si tu backend sirve estáticos desde el raíz y la API desde /api
// Si VITE_STATIC_BASE_URL no está definida, usa el origen del frontend, asumiendo que el backend sirve estáticos en el mismo dominio/puerto o a través de un proxy.
export const STATIC_FILES_BASE_URL =
  import.meta.env.VITE_STATIC_BASE_URL || window.location.origin;

const api = axios.create({
  baseURL: API_BASE_URL, // Usar la constante exportada
});

// Request interceptor to add the token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem("adminToken");
      // Redirect to login page
      // Ensure this doesn't cause a loop if the login page itself triggers an API call that could 401
      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
      // Optionally, you could dispatch a custom event or use a state management solution
      // to notify other parts of the application about the logout.
      console.error("Unauthorized access - 401. User logged out.");
    }
    return Promise.reject(error);
  }
);

export default api;
