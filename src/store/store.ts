import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import dashboardReducer from "./features/dashboard/dashboardSlice";
import profileReducer from "./features/profile/profileSlice";
import projectReducer from "./features/projects/projectSlice"; // Import project reducer
import blogReducer from "./features/blog/blogSlice"; // Import blog reducer
import contactAdminReducer from "./features/contact/contactSlice"; // Import contact admin reducer

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    profile: profileReducer,
    adminProjects: projectReducer, // Add project reducer for admin
    adminBlog: blogReducer, // Add blog reducer for admin
    contactAdmin: contactAdminReducer, // Add contact admin reducer
    // Add other reducers here as features are built
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
