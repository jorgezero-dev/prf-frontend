// src/types/index.ts

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: string; // Added role field
}

export interface DashboardStats {
  totalProjects: number;
  totalPublishedPosts: number;
  totalDraftPosts: number;
  totalContactSubmissions: number;
}

export interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

// Admin Profile related types (F-FR3.3)
export interface SkillCategory {
  _id?: string; // Optional: if backend assigns IDs for easier updates
  category: string;
  items: string[];
}

export interface EducationEntry {
  _id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string; // Was optional, now required
  startDate: string;
  endDate?: string;
  description?: string; // Remains optional as per backend model
}

export interface WorkExperienceEntry {
  _id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  responsibilities: string[]; // Changed from description?: string
}

export interface SocialLink {
  _id?: string;
  platform: string;
  url: string;
}

export interface IProfileAdmin {
  _id?: string;
  name: string; // Was optional
  title: string; // Was optional
  biography: string;
  profilePictureUrl?: string; // Was required
  contactEmail: string;
  skills: SkillCategory[]; // Was optional
  education: EducationEntry[]; // Was optional
  workExperience: WorkExperienceEntry[]; // Was optional
  socialLinks: SocialLink[]; // Was optional
  resumeUrl?: string; // Added
}

export interface ProfileAdminState {
  profile: IProfileAdmin | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  saveError: string | null;
}

// Added for projectSlice.ts (Admin Projects)
export interface ProjectAdminState {
  projects: IProject[];
  currentProject: IProject | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  isLoadingList: boolean;
  isLoadingDetails: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  listError: string | null;
  detailsError: string | null;
  saveError: string | null;
  deleteError: string | null;
  deleteSuccess: boolean; // To confirm deletion for UI feedback
}

// Added for authService.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: IUser; // User is not optional as per F-FR1.1 success response
}

// Added for profileService.ts (public profile)
// This is a basic representation. Adjust based on actual public data needs.
export interface IProfile {
  name?: string;
  title?: string;
  biography?: string;
  profilePictureUrl?: string;
  contactEmail?: string;
  skills?: SkillCategory[];
  education?: EducationEntry[];
  workExperience?: WorkExperienceEntry[];
  socialLinks?: SocialLink[];
  resumeUrl?: string; // Added
}

// Generic Paginated Response Type
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Added for projectService.ts
export interface ProjectImage {
  _id?: string;
  url: string;
  altText: string; // Changed to required
  isThumbnail?: boolean;
}

export interface IProject {
  _id: string;
  title: string;
  slug: string;
  description: string; // Rich text/Markdown
  shortSummary: string; // Changed to required
  technologies: string[];
  images: ProjectImage[]; // Changed to required, non-optional
  liveDemoUrl?: string; // Added
  sourceCodeUrl?: string; // Added
  role: string; // Changed to required
  challenges: string; // Changed to required
  status: "draft" | "published";
  featured?: boolean;
  order?: number; // Added based on F-FR3.4
  publishedAt?: string; // ISO date string
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string;
}

export interface AdminProjectsFilters {
  page?: number;
  limit?: number;
  status?: "" | "draft" | "published"; // Allow empty string for all statuses
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  // Add other potential filter fields here if needed, e.g., search term
  search?: string;
}

// Added for blogService.ts
export interface SeoMetadata {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
}

export interface IBlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string; // Rich text/Markdown
  excerpt?: string;
  categories: string[]; // Changed from category?: string
  tags?: string[];
  author: IUser; // Assuming author details are populated
  status: "draft" | "published";
  featuredImageUrl?: string;
  publishedAt?: string; // ISO date string
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  seoMetadata?: SeoMetadata;
}

// Added for blogSlice.ts (Admin Blog Posts)
export interface BlogAdminState {
  posts: IBlogPost[];
  currentPost: IBlogPost | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  isLoadingList: boolean;
  isLoadingDetails: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  listError: string | null;
  detailsError: string | null;
  saveError: string | null;
  deleteError: string | null;
  deleteSuccess: boolean; // To confirm deletion for UI feedback
}

// Added for contactService.ts
export interface IContactSubmission {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Zod Schemas for Validation
import { z } from "zod";

export const SeoMetadataSchema = z.object({
  seoTitle: z
    .string()
    .max(100, "SEO Title cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),
  seoDescription: z
    .string()
    .max(200, "SEO Description cannot exceed 200 characters.")
    .optional()
    .or(z.literal("")),
  seoKeywords: z
    .array(z.string().max(50, "Each SEO keyword cannot exceed 50 characters."))
    .optional(),
  ogTitle: z
    .string()
    .max(100, "Open Graph Title cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),
  ogDescription: z
    .string()
    .max(200, "Open Graph Description cannot exceed 200 characters.")
    .optional()
    .or(z.literal("")),
  ogImageUrl: z
    .string()
    .url({ message: "Invalid URL format for Open Graph Image." })
    .optional()
    .or(z.literal("")),
});

export const BlogPostValidationSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long." })
    .max(150, { message: "Title cannot exceed 150 characters." }),
  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters long." })
    .max(200, { message: "Slug cannot exceed 200 characters." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase alphanumeric with hyphens.",
    })
    .optional()
    .or(z.literal("")), // Optional because it can be auto-generated
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters long." }),
  excerpt: z
    .string()
    .max(300, { message: "Excerpt cannot exceed 300 characters." })
    .optional()
    .or(z.literal("")),
  categories: z // Renamed from category and changed to array
    .array(z.string().max(50, "Category cannot exceed 50 characters."))
    .min(0) // Explicitly allow empty array, making it non-optional but can be empty
    .optional(), // Keep optional if it truly can be undefined before Zod processing
  tags: z
    .array(z.string().max(50, "Each tag cannot exceed 50 characters."))
    .optional(),
  status: z.enum(["draft", "published"], { message: "Invalid status." }),
  featuredImageUrl: z
    .string()
    .url({ message: "Invalid URL format for Featured Image." })
    .optional()
    .or(z.literal("")),
  seoMetadata: SeoMetadataSchema.optional(),
});

export type BlogPostFormData = z.infer<typeof BlogPostValidationSchema>;
