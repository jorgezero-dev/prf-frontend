### Refined Frontend Functional Requirements (F-FR)

**F-FR1: User Authentication & Session Management (for Admin)**

- **F-FR1.1: Admin Login Page (`/admin/login`)**
  - **Purpose:** Allow the administrator to log in.
  - **UI Elements:** Email input (`type="email"`), password input (`type="password"`), "Login" button.
  - **Interaction:**
    - User enters email and password.
    - Client-side validation:
      - Email: required, valid email format.
      - Password: required.
    - On "Login" button click (if client-side validation passes):
      - Display loading state (e.g., disable button, show spinner).
      - Make a `POST` request to `POST /api/auth/login` with `Content-Type: application/json` and request body:
        ```json
        {
          "email": "entered_email",
          "password": "entered_password"
        }
        ```
      - **On Success (200 OK from backend):**
        - Receive `{ token: "jwt_string", user: { id, email, name, role } }`.
        - Store `token` securely (e.g., `localStorage` or `sessionStorage`).
        - Store `user` object in global state (e.g., React Context, Zustand).
        - Redirect to Admin Dashboard (`/admin/dashboard`).
      - **On Error:**
        - `400 Bad Request` (e.g., from Zod validation on backend): Display a generic error or specific messages if the backend returns structured errors (e.g., "Invalid email format", "Password is required").
        - `401 Unauthorized`: Display "Invalid credentials."
        - `429 Too Many Requests`: Display "Too many login attempts. Please try again later."
        - `500 Internal Server Error`: Display "Login failed. Please try again."
      - Clear loading state.
- **F-FR1.2: Protected Admin Routes**
  - **Purpose:** Restrict access to admin sections (routes starting with `/admin/` except `/admin/login`).
  - **Implementation:**
    - Use a React Router wrapper component (e.g., `<ProtectedRoute>`).
    - Before rendering an admin component, check for:
      - Presence of `token` in storage.
      - (Optional but recommended) Validity of the token by decoding its expiry or making a quick verify endpoint call.
    - If `token` is missing or invalid, redirect to `/admin/login`.
    - If `token` is valid, render the requested admin component.
- **F-FR1.3: Admin Logout**
  - **Purpose:** Allow the administrator to log out.
  - **UI Elements:** "Logout" button (typically in admin layout header).
  - **Interaction:**
    - On "Logout" button click:
      - Remove `token` from storage.
      - Clear `user` object from global state.
      - Redirect to `/admin/login`.
- **F-FR1.4: Axios Instance for Authenticated Requests**
  - **Purpose:** Automatically include the JWT for protected API calls.
  - **Implementation:**
    - Create an Axios instance.
    - Add a request interceptor that retrieves the `token` from storage and adds an `Authorization: Bearer ${token}` header to requests targeting `/api/admin/*` or other protected routes.
    - Add a response interceptor to globally handle `401 Unauthorized` errors from the API by logging the user out (see F-FR1.3).

**F-FR2: Public Pages - Data Display & Interaction**

- **F-FR2.1: Home Page (`/`)**
  - **Data Fetching:**
    - Fetch featured projects: `GET /api/projects?featured=true&limit=3` (or similar, based on how "featured" is implemented).
    - Fetch recent blog posts: `GET /api/blog?limit=3&sortBy=publishedAt&sortOrder=desc`.
    - Fetch profile data for intro/headline: `GET /api/profile` (if the public doesn't need admin auth for a _subset_ of profile info, this needs a public profile endpoint. Assuming for now that key public info like name, bio snippet might come from a separate public endpoint or be statically configured. If it _must_ come from `/api/profile`, this page section might be admin-view only or require different auth). _Correction based on backend: `/api/profile` is admin protected. Public profile info (like name, short bio) must come from a different source or be part of site settings fetched publicly._ Let's assume some static content or a dedicated _public_ profile data endpoint if needed.
  - **Display:**
    - Headline, intro text.
    - Project cards (using `title`, `shortSummary`, `images` (finding `isThumbnail: true`), `slug` from project objects). Link to `/projects/:slug`.
    - Blog post previews (`title`, `publishedAt`, `content` (excerpt), `featuredImageUrl`, `slug` from blog post objects). Link to `/blog/:slug`.
  - **States:** Loading skeleton/spinners for project/blog sections, error message if API calls fail.
- **F-FR2.2: About Me Page (`/about`)**
  - **Data Fetching:**
    - This page displays public info. The backend `/api/profile` is admin-protected. **Crucial Decision:**
      - **Option A (Simpler):** Hardcode most "About Me" content or manage it via a simple JSON file in the frontend repo if it doesn't change often.
      - **Option B (Backend Change):** Create a new public endpoint `GET /api/public-profile` that returns `biography`, `skills`, `education`, `workExperience`, `profilePictureUrl`, `socialLinks`, `contactEmail`.
      - **Option C (Current Backend):** This page cannot display dynamic profile data as described if `/api/profile` is admin-only.
    - Assuming **Option B** is preferred for a dynamic portfolio: Fetch from `GET /api/public-profile`.
    - Fetch resume URL: `GET /api/resume/url`.
  - **Display (assuming Option B):**
    - Render `biography` (handling HTML/Markdown if backend provides it, else plain text).
    - Display `skills` (iterating `category` and `items`).
    - List `education` and `workExperience` entries (formatting dates).
    - Display `profilePictureUrl`.
    - Display `socialLinks` (iterating `platform` and `url` to create links with icons).
    - Display `contactEmail`.
    - "Download Resume/CV" button with `href` set to `resumeUrl` from `GET /api/resume/url`.
  - **States:** Loading state, error state (e.g., "Could not load profile information."). If `resumeUrl` is 404, hide download button or show "Resume not available".
- **F-FR2.3: Projects Listing Page (`/projects`)**
  - **Data Fetching:**
    - Initial load: `GET /api/projects?page=1&limit=9` (adjust limit as needed).
    - Pagination: `GET /api/projects?page=newPage&limit=9`.
    - Filtering: `GET /api/projects?category=selectedCategory&page=1&limit=9`.
  - **Display:**
    - Grid of project cards. Each card uses `_id`, `title`, `slug`, `shortSummary`, `images` (find `isThumbnail: true`), `technologies`. Link to `/projects/:slug`.
    - Filter UI (e.g., dropdown/buttons for `technologies` - frontend can aggregate unique `technologies` from fetched projects or fetch from a dedicated endpoint if available).
    - Pagination controls using `total`, `page`, `limit`, `totalPages` from API response.
  - **States:** Loading (initial, on filter/page change), error, empty state ("No projects found.").
- **F-FR2.4: Individual Project Detail Page (`/projects/:idOrSlug`)**
  - **Data Fetching:** `GET /api/projects/:idOrSlug` using the `idOrSlug` from `react-router-dom` params.
  - **Display:**
    - `title`, `description` (handle HTML/Markdown), `technologies` (list/tags), `role`, `challenges`.
    - Links for `liveDemoUrl` and `sourceCodeUrl` (conditionally render if present).
    - Image gallery using `images` array (`url`, `altText`).
  - **States:** Loading, error (display "Project not found" on 404).
- **F-FR2.5: Blog Listing Page (`/blog`)**
  - **Data Fetching:**
    - Initial load: `GET /api/blog?page=1&limit=10`.
    - Pagination: `GET /api/blog?page=newPage&limit=10`.
    - Tag filtering: `GET /api/blog?tag=selectedTag&page=1&limit=10`.
    - Search: `GET /api/blog?search=searchTerm&page=1&limit=10`.
    - Fetch unique tags: `GET /api/blog/tags` for filter UI.
    - Fetch unique categories: `GET /api/blog/categories` for filter UI.
  - **Display:**
    - List of blog post previews: `title`, `slug`, `content` (excerpt), `author.name`, `categories`, `tags`, `featuredImageUrl`, `publishedAt`. Link to `/blog/:slug`.
    - Filter UI for tags and categories using data from `/api/blog/tags` and `/api/blog/categories`.
    - Search input field.
    - Pagination controls using `total`, `page`, `limit`, `totalPages` from API.
  - **States:** Loading, error, empty state ("No blog posts found.").
- **F-FR2.6: Individual Blog Post Page (`/blog/:slug`)**
  - **Data Fetching:** `GET /api/blog/:slug` using `slug` from `react-router-dom` params.
  - **Display:**
    - `title`, `content` (handle HTML/Markdown, apply syntax highlighting to code blocks).
    - `author.name`, `publishedAt`.
    - `categories`, `tags`.
    - `featuredImageUrl`.
    - (Optional) Social sharing buttons.
    - (Optional) SEO: Use `seoMetadata.seoTitle` and `seoMetadata.seoDescription` for meta tags.
  - **States:** Loading, error (display "Blog post not found" on 404).
- **F-FR2.7: Contact Page (`/contact`)**
  - **UI Elements:** Form with inputs for `name`, `email`, `subject` (optional), `message`. Submit button. (Optional: CAPTCHA).
  - **Interaction:**
    - Client-side validation (required fields, email format).
    - On submit:
      - Display loading state.
      - Make `POST /api/contact` with request body:
        ```json
        {
          "name": "...",
          "email": "...",
          "subject": "...", // optional
          "message": "...",
          "captchaToken": "..." // if using CAPTCHA
        }
        ```
      - **On Success (201 Created from backend):** Display success message from API (`response.data.message`). Clear form.
      - **On Error:**
        - `400 Bad Request` (Zod validation): Display specific field errors if available from `response.data.errors` or a generic "Please check your input."
        - `429 Too Many Requests`: Display "Too many submissions. Please try again later."
        - `500 Internal Server Error`: Display "Could not send message. Please try again."
      - Clear loading state.
- **F-FR2.8: Resume Download**
  - **Data Fetching:** `GET /api/resume/url`.
  - **Interaction:** "Download Resume/CV" button on About page (and potentially header/footer) is an `<a>` tag.
    - If `GET /api/resume/url` is successful: `href` set to `response.data.resumeUrl`, add `download` attribute.
    - If `GET /api/resume/url` returns 404: Disable button or show "Resume not available".
- **F-FR2.9: Site Navigation & Structure (Header, Footer, Theme Toggle)**
  - As previously defined, using `react-router-dom` for navigation. Theme toggle updates CSS variables and uses `localStorage`.

**F-FR3: Admin Panel - Content Management (All routes under `/admin/*` are protected)**

- **F-FR3.1: Admin Layout**
  - Consistent layout: Sidebar (Dashboard, Profile, Projects, Blog, Resume, Contact Submissions), Header (User name, Logout button).
- **F-FR3.2: Admin Dashboard (`/admin/dashboard`)**
  - **Data Fetching:** `GET /api/admin/dashboard/stats`.
  - **Display:** Cards showing `totalProjects`, `totalPublishedPosts`, `totalDraftPosts`, `totalContactSubmissions`. Quick links.
  - **States:** Loading stats.
- **F-FR3.3: Manage Profile (`/admin/profile`)**
  - **Data Fetching:** `GET /api/profile`.
  - **UI Elements:**
    - Form with fields for `biography` (rich text editor), `profilePictureUrl` (input field), `contactEmail` (email input).
    - Dynamic forms for `skills` (add/edit/delete: `category` text input, `items` tag-input/repeatable text inputs).
    - Dynamic forms for `education` (add/edit/delete: `institution`, `degree`, `fieldOfStudy`, `startDate`, `endDate`, `description`).
    - Dynamic forms for `workExperience` (add/edit/delete: `company`, `position`, `startDate`, `endDate`, `description`, `responsibilities` as repeatable text inputs).
    - Dynamic forms for `socialLinks` (add/edit/delete: `platform` dropdown/text input, `url` URL input).
    - "Save Profile" button.
  - **Interaction:**
    - Populate forms with data from `GET /api/profile`. If 404 (profile not found), present empty forms to create one.
    - Client-side validation (e.g., URLs, required fields within sub-objects).
    - On "Save Profile":
      - Make `PUT /api/profile` with the form data, matching the backend's `updateProfileSchema`.
      - Handle 200 OK (show success message, refresh data) or 400 Bad Request (display Zod validation errors next to fields or as a summary).
  - **States:** Loading profile, saving profile.
- **F-FR3.4: Manage Projects (`/admin/projects`, `/admin/projects/new`, `/admin/projects/edit/:id`)**
  - **List View (`/admin/projects`):**
    - **Data Fetching:** `GET /api/admin/projects` with query params for pagination (`page`, `limit`), sorting (`sortBy`, `sortOrder`), and filtering (`status`).
    - **Display:** Table/list of projects (`title`, `status`, `order`, `featured`, `createdAt`). Edit/Delete buttons. Link to `/admin/projects/new`. Pagination controls. Filter/Sort UI.
    - **Interaction:**
      - Edit button navigates to `/admin/projects/edit/:id` (using project `_id`).
      - Delete button: Confirm, then `DELETE /api/admin/projects/:id`. On success (200 OK with message), refresh list. Handle 404.
  - **Create/Edit Form (`/admin/projects/new`, `/admin/projects/edit/:id`):**
    - **Data Fetching (Edit):** `GET /api/admin/projects/:id`.
    - **UI Elements:** Form matching `createProjectSchema`/`updateProjectSchema`: `title`, `shortSummary`, `description` (rich text editor), `technologies` (tag input), `role`, `challenges`, `liveDemoUrl`, `sourceCodeUrl`, `images` (list of inputs for `url`, `altText`, `isThumbnail` checkbox; consider a file uploader that uploads to a service and returns URLs), `status` (select: "published" | "draft"), `order` (number input), `featured` (checkbox), `slug` (display if auto-generated, potentially editable for updates if backend supports it, but backend spec implies auto-generation). "Save Project" button.
    - **Interaction:**
      - Client-side validation (required fields, URL formats).
      - On save (new): `POST /api/projects` with form data. Handle 201 Created (redirect/notify) or 400 (Zod errors, Mongoose validation errors like duplicate slug).
      - On save (edit): `PUT /api/admin/projects/:id`. Handle 200 OK or 400/404.
  - **States:** Loading list/form, saving form.
- **F-FR3.5: Manage Blog Posts (`/admin/blog`, `/admin/blog/new`, `/admin/blog/edit/:id`)**
  - **List View (`/admin/blog`):** (Assuming this should map to `GET /api/admin/blog/all`)
    - **Data Fetching:** `GET /api/admin/blog/all` with query params for pagination, sorting, filtering (`status`, `search`).
    - **Display:** Table/list of posts (`title`, `status`, `author.name`, `categories`, `tags`, `publishedAt`). Edit/Delete/Preview buttons. Link to `/admin/blog/new`.
    - **Interaction:**
      - Edit navigates to `/admin/blog/edit/:id` (using post `_id`).
      - Delete: Confirm, then `DELETE /api/admin/blog/:id`. On success, refresh. Handle 404.
      - Preview: Link to `/blog/:slug` in new tab if `status` is "published".
  - **Create/Edit Form (`/admin/blog/new`, `/admin/blog/edit/:id`):**
    - **Data Fetching (Edit):** `GET /api/admin/blog/:id`.
    - **UI Elements:** Form matching `createBlogPostSchema.body`: `title`, `content` (rich text/Markdown editor), `featuredImageUrl` (URL input or uploader), `categories` (tag/multi-select), `tags` (tag/multi-select), `status` (select: "published" | "draft"), `slug` (text input, validate format, check uniqueness client-side if feasible or rely on backend 409), `metaTitle`, `metaDescription`. "Save Post" button.
    - **Interaction:**
      - On save (new): `POST /api/admin/blog` (or `/api/blog` if it's the same admin-protected route). Handle 201 Created or 400/409.
      - On save (edit): `PUT /api/admin/blog/:id`. Handle 200 OK or 400/404.
  - **States:** Loading list/form, saving form.
- **F-FR3.6: Manage Resume (`/admin/resume`)**
  - **Data Fetching:** `GET /api/resume/url` to display current URL (if any).
  - **UI Elements:** Input field for `resumeUrl`. "Update Resume" button.
  - **Display:** Current `resumeUrl` (if set).
  - **Interaction:**
    - Client-side validation (URL format, required).
    - On "Update Resume":
      - Make `POST /api/resume` with `Content-Type: application/json` and request body:
        ```json
        { "resumeUrl": "entered_url" }
        ```
      - Handle 200 OK (display success message and updated `resumeUrl`) or 400 (Zod validation).
  - **States:** Saving URL.
- **F-FR3.7: Manage Contact Submissions (`/admin/contact-submissions`)**
  - **Data Fetching:** `GET /api/admin/contact-submissions` with query params for pagination (`page`, `limit`), filtering (`isRead`), sorting (`sortBy`, `sortOrder`).
  - **Display:** Table/list of submissions (`name`, `email`, `subject`, `createdAt`, `isRead` status). View details button/modal. Mark as Read/Unread button. Delete button. Pagination.
  - **Interaction:**
    - View details: Show full `message`.
    - Mark as Read/Unread: `PATCH /api/admin/contact-submissions/:id/status` with body `{ "isRead": true/false }`. Refresh item or list on success.
    - Delete: Confirm, then `DELETE /api/admin/contact-submissions/:id`. Refresh list on success.
  - **States:** Loading submissions, updating status, deleting.

---

### Refined Frontend Non-Functional Requirements (F-NFR)

(Largely similar to previous, but with emphasis on API interaction)

- **F-NFR1: Performance:**
  - F-NFR1.1: **Fast Initial Load:** As before.
  - F-NFR1.2: **Responsive Interactions:** UI updates quickly after API responses. Use optimistic updates where appropriate for a perception of speed (e.g., marking an item as deleted locally before API confirms).
  - F-NFR1.3: **Efficient API Data Handling:**
    - Fetch only necessary data.
    - Cache data where appropriate (e.g., using React Query, SWR, or custom context) to avoid redundant API calls, especially for data that doesn't change frequently (like profile info, list of tags).
    - Debounce search inputs to avoid excessive API calls.
- **F-NFR2: Usability & UX ("Cool and Professional"):**
  - F-NFR2.1: **Clear Feedback for API States:** Distinct loading indicators for different sections/actions. Clear, non-technical error messages. Success notifications.
  - F-NFR2.2: **Form Usability:**
    - Client-side validation provides immediate feedback.
    - Server-side validation errors (from Zod/Mongoose) are displayed clearly, ideally next to the relevant form fields.
    - Disable submit buttons during API calls.
  - (Other UX points like responsive design, visual appeal, A11y remain the same).
- **F-NFR3: Maintainability:**
  - F-NFR3.1: **API Service Layer:** Abstract API calls into a dedicated service layer (e.g., `services/projectService.js`, `services/authService.js`) that components can use. This centralizes API logic, making it easier to manage base URLs, headers, and error handling.
  - F-NFR3.2: **Type Definitions for API Payloads:** Use TypeScript interfaces/types that match the backend request/response structures for type safety and better autocompletion.
  - (Other points like component architecture, code style remain).
- **F-NFR4: Browser Compatibility:** As before.
- **F-NFR5: SEO (for public pages):**
  - F-NFR5.1: Use `title`, `slug`, `seoMetadata` (for blog), and project details to populate meta tags dynamically.
  - (Other points remain).
- **F-NFR6: Build & Deployment:**
  - F-NFR6.1: Configure environment variables in Vercel for `VITE_API_BASE_URL`.

---

This refined set of requirements should give you a very clear path for frontend development, ensuring it integrates seamlessly with your existing backend. The key change was aligning data fetching and manipulation exactly with your API spec, especially for the Profile section and Admin forms. Remember to handle all specified error responses gracefully.
