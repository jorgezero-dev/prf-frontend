import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/features/auth/authSlice';
import type { AppDispatch } from '../../store/store';
import { useState } from 'react'; // Import useState for mobile menu

// Define an interface for NavLink props if you need to pass more specific props
interface AdminNavLinkProps {
    to: string;
    children: React.ReactNode;
    baseClassName: string;
    activeClassName: string;
    onClick?: () => void; // Optional onClick for mobile menu closure
}

const AdminNavLink: React.FC<AdminNavLinkProps> = ({ to, children, baseClassName, activeClassName, onClick }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick} // Close mobile menu on click
            className={({ isActive }) =>
                `${baseClassName} ${isActive ? activeClassName : ''}`
            }
        >
            {children}
        </NavLink>
    );
};

export default function AdminLayout() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/admin/login'); // Redirect to login page after logout
        setIsMobileMenuOpen(false); // Close mobile menu on logout
    };

    const navLinkBaseClasses = "px-3 py-2 rounded-md text-sm font-medium text-onPrimary hover:bg-primary-light hover:text-primary-dark dark:hover:bg-primary-dark dark:hover:text-onPrimary focus:outline-none focus:bg-primary-light focus:text-primary-dark dark:focus:bg-primary-dark dark:focus:text-onPrimary transition-colors";
    const navLinkActiveClasses = "bg-primary-dark dark:bg-primary text-onPrimary"; // Use onPrimary for text on primary background
    const mobileNavLinkBaseClasses = `block px-3 py-2 rounded-md text-base font-medium text-neutral-900 dark:text-neutral-100 hover:bg-primary-light hover:text-primary-dark dark:hover:bg-primary-dark dark:hover:text-onPrimary focus:outline-none focus:bg-primary-light focus:text-primary-dark dark:focus:bg-primary-dark dark:focus:text-onPrimary transition-colors`; // Ensure hover text is contrasty

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard' },
        { path: '/admin/profile', label: 'Profile' },
        { path: '/admin/projects', label: 'Projects' },
        { path: '/admin/blog', label: 'Blog' },
        { path: '/admin/resume', label: 'Resume' },
        { path: '/admin/contact-submissions', label: 'Submissions' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-neutral-900 dark:text-neutral-100">
            <header className="bg-primary dark:bg-primary-dark text-onPrimary shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            {/* Optional: Add a logo here */}
                            <NavLink to="/admin/dashboard" className="text-2xl font-bold hover:opacity-80 transition-opacity text-onPrimary">
                                Admin Panel
                            </NavLink>
                        </div>
                        <nav className="hidden md:flex items-center space-x-1">
                            {navItems.map(item => (
                                <AdminNavLink
                                    key={item.path}
                                    to={item.path}
                                    baseClassName={navLinkBaseClasses}
                                    activeClassName={navLinkActiveClasses}
                                >
                                    {item.label}
                                </AdminNavLink>
                            ))}
                            <button
                                onClick={handleLogout}
                                className={`${navLinkBaseClasses} bg-secondary hover:bg-secondary-dark focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark focus:ring-white`}
                            >
                                Logout
                            </button>
                        </nav>
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={toggleMobileMenu}
                                className="p-2 rounded-md text-onPrimary hover:bg-primary-light hover:text-primary-dark dark:hover:bg-primary dark:hover:text-onPrimary focus:outline-none focus:bg-primary-light focus:text-primary-dark dark:focus:bg-primary dark:focus:text-onPrimary transition-colors"
                                aria-label="Toggle menu"
                                aria-expanded={isMobileMenuOpen}
                            >
                                {isMobileMenuOpen ? (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Mobile menu, show/hide based on state */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-background-lightElevated dark:bg-background-darkElevated shadow-lg absolute w-full top-16 left-0 z-40">
                        <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navItems.map(item => (
                                <AdminNavLink
                                    key={item.path}
                                    to={item.path}
                                    baseClassName="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 dark:text-neutral-100 hover:bg-primary-light hover:text-primary-dark dark:hover:bg-primary-dark dark:hover:text-onPrimary focus:outline-none focus:bg-primary-light focus:text-primary-dark dark:focus:bg-primary-dark dark:focus:text-onPrimary transition-colors"
                                    activeClassName="bg-primary dark:bg-primary-dark text-onPrimary"
                                    onClick={closeMobileMenu} // Close menu on navigation
                                >
                                    {item.label}
                                </AdminNavLink>
                            ))}
                            <button
                                onClick={handleLogout}
                                className={`${mobileNavLinkBaseClasses} w-full text-left text-onPrimary bg-secondary hover:bg-secondary-dark focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-lightElevated dark:focus:ring-offset-background-darkElevated focus:ring-white mt-2`}
                            >
                                Logout
                            </button>
                        </nav>
                    </div>
                )}
            </header>
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
            <footer className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 py-6 shadow-inner mt-auto">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} Your Name/Company. All rights reserved.</p>
                    <p className="mt-1">Admin Panel</p>
                </div>
            </footer>
        </div>
    );
}
