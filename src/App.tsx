import React from 'react'; // Import React for JSX
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Added import
import { selectIsAuthenticated } from './store/features/auth/authSlice'; // Added import
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ProfilePage from './pages/admin/ProfilePage';
import ProjectsPage from './pages/admin/ProjectsPage';
import BlogPage from './pages/admin/BlogPage';
import ResumePage from './pages/admin/ResumePage';
import ContactSubmissionsPage from './pages/admin/ContactSubmissionsPage';
import ProjectFormPage from './pages/admin/ProjectFormPage';
import BlogPostFormPage from './pages/admin/BlogPostFormPage';

import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import PublicProjectsPage from './pages/public/PublicProjectsPage';
import ProjectDetailPage from './pages/public/ProjectDetailPage';
import PublicBlogPage from './pages/public/PublicBlogPage';
import BlogPostPage from './pages/public/BlogPostPage';
import ContactPage from './pages/public/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function App() {
  // useEffect to manage body classes for base theme (light/dark) is removed.
  // ThemeToggle will now handle adding/removing the 'dark' class on the <html> element.

  return (
    // The div no longer needs explicit dark mode classes if the html tag controls it.
    // However, keeping font-sans and antialiased is good.
    <div className="flex flex-col min-h-screen font-sans antialiased bg-background-light text-text-light dark:bg-background-dark dark:text-text-dark">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<PublicProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} /> {/* Ensure :slug is used if that's the param name */}
          <Route path="/blog" element={<PublicBlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={(
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            )}
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/new" element={<ProjectFormPage />} />
            <Route path="projects/edit/:id" element={<ProjectFormPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/new" element={<BlogPostFormPage />} />
            <Route path="blog/edit/:id" element={<BlogPostFormPage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="contact-submissions" element={<ContactSubmissionsPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Not Found Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
