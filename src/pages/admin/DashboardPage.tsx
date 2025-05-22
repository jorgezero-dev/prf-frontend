import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom'; // Import Link for navigation
import {
    fetchDashboardStats,
    selectDashboardStats,
    selectDashboardLoading,
    selectDashboardError,
} from '../../store/features/dashboard/dashboardSlice';
import type { AppDispatch } from '../../store/store';

// Example icons (replace with actual icons from a library like react-icons)
const ProjectsIcon = () => <svg className="w-8 h-8 text-primary dark:text-primary-light" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 3.293A1 1 0 0016 3H4a1 1 0 00-.949.684L2 9h16l-1.051-5.316A1 1 0 0017.293 3.293zM2 10v5a2 2 0 002 2h12a2 2 0 002-2v-5H2z"></path></svg>;
const BlogIcon = () => <svg className="w-8 h-8 text-accent dark:text-accent-light" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4zm0-6a2 2 0 100-4 2 2 0 000 4zm0 12a2 2 0 100-4 2 2 0 000 4z"></path></svg>; // Placeholder, find a better blog icon
const SubmissionsIcon = () => <svg className="w-8 h-8 text-secondary dark:text-secondary-light" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 2.692l7.997 3.192A1 1 0 0119 6.828v8.344a1 1 0 01-1.003.944l-7.997-3.192-7.997 3.192A1 1 0 011 15.172V6.828a1 1 0 011.003-.944zM10 13.388l7-2.8V7.51l-7 2.8v3.078zM3 7.51l7 2.8v3.078l-7-2.8V7.51z"></path></svg>;

interface StatCardProps {
    title: string;
    value: number | string;
    icon?: React.ReactNode;
    colorClass: string; // e.g., 'bg-blue-500'
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => (
    <div className={`p-6 rounded-xl shadow-lg flex items-center space-x-4 ${colorClass} text-white transition-all duration-300 ease-in-out hover:shadow-2xl transform hover:-translate-y-1`}>
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div>
            <p className="text-sm font-medium uppercase tracking-wider opacity-80">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    </div>
);

interface QuickLinkProps {
    to: string;
    title: string;
    icon?: React.ReactNode;
    description: string;
}

const QuickLinkCard: React.FC<QuickLinkProps> = ({ to, title, icon, description }) => (
    <Link to={to} className="block p-6 bg-white dark:bg-neutral-dark rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
        <div className="flex items-center space-x-3 mb-2">
            {icon}
            <h3 className="text-lg font-semibold text-primary dark:text-primary-light">{title}</h3>
        </div>
        <p className="text-sm text-neutral-darker dark:text-neutral-light">{description}</p>
    </Link>
);

export default function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const stats = useSelector(selectDashboardStats);
    const isLoading = useSelector(selectDashboardLoading);
    const error = useSelector(selectDashboardError);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary dark:border-primary-light"></div>
                <p className="ml-4 text-lg font-medium text-neutral-darker dark:text-neutral-light">Loading dashboard data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-300 text-red-700 dark:text-red-200 p-6 rounded-md shadow-md" role="alert">
                <h3 className="font-bold text-lg mb-2">Error Loading Dashboard</h3>
                <p>{error}</p>
                <button
                    onClick={() => dispatch(fetchDashboardStats())}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-300 text-yellow-700 dark:text-yellow-200 p-6 rounded-md shadow-md" role="alert">
                <h3 className="font-bold text-lg mb-2">No Data</h3>
                <p>No dashboard data available at the moment.</p>
                <button
                    onClick={() => dispatch(fetchDashboardStats())}
                    className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm font-medium"
                >
                    Refresh Data
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Admin Dashboard</h2>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Projects" value={stats.totalProjects} icon={<ProjectsIcon />} colorClass="bg-primary dark:bg-primary-dark" />
                <StatCard title="Published Posts" value={stats.totalPublishedPosts} icon={<BlogIcon />} colorClass="bg-accent dark:bg-accent-dark" />
                <StatCard title="Draft Posts" value={stats.totalDraftPosts} icon={<BlogIcon />} colorClass="bg-neutral-dark dark:bg-neutral-darker" />
                <StatCard title="Contact Submissions" value={stats.totalContactSubmissions} icon={<SubmissionsIcon />} colorClass="bg-secondary dark:bg-secondary-dark" />
            </div>

            {/* Quick Links Section */}
            <div>
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-neutral-light mb-4">Quick Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <QuickLinkCard
                        to="/admin/profile"
                        title="Manage Profile"
                        icon={<svg className="w-6 h-6 text-primary dark:text-primary-light" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
                        description="Update your personal information, skills, and social links."
                    />
                    <QuickLinkCard
                        to="/admin/projects/new" // Assuming a route for creating new projects
                        title="Add New Project"
                        icon={<svg className="w-6 h-6 text-primary dark:text-primary-light" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        description="Start a new project entry with details and images."
                    />
                    <QuickLinkCard
                        to="/admin/blog/new" // Assuming a route for creating new blog posts
                        title="Write New Blog Post"
                        icon={<svg className="w-6 h-6 text-accent dark:text-accent-light" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>}
                        description="Craft and publish a new article for your blog."
                    />
                    <QuickLinkCard
                        to="/admin/projects"
                        title="View All Projects"
                        icon={<ProjectsIcon />}
                        description="Browse and manage all your existing project entries."
                    />
                    <QuickLinkCard
                        to="/admin/blog"
                        title="Manage Blog Posts"
                        icon={<BlogIcon />}
                        description="Edit, publish, or delete existing blog articles."
                    />
                    <QuickLinkCard
                        to="/admin/contact-submissions"
                        title="View Submissions"
                        icon={<SubmissionsIcon />}
                        description="Check messages and inquiries sent through your contact form."
                    />
                </div>
            </div>
        </div>
    );
}
