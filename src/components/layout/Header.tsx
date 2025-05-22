import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import { useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi'; // Added for menu icons

export default function Header() {
    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About' },
        { path: '/projects', label: 'Projects' },
        { path: '/blog', label: 'Blog' },
        { path: '/contact', label: 'Contact' },
    ];
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="bg-background-light dark:bg-background-dark text-neutral-900 dark:text-neutral-100 shadow-lg sticky top-0 z-50 transition-colors duration-300">
            <div className="container mx-auto flex items-center justify-between p-4 md:p-5">
                <div className="flex items-center">
                    <Link to="/" className="text-2xl font-bold text-primary dark:text-primary-light hover:opacity-80 transition-opacity duration-300">
                        MyPortfolio
                    </Link>
                </div>
                <nav className="hidden md:flex space-x-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out ${isActive
                                    ? 'bg-primary text-onPrimary dark:bg-primary-dark dark:text-onPrimary shadow-md scale-105'
                                    : 'text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 hover:text-primary dark:hover:bg-neutral-800 dark:hover:text-primary-light transform hover:scale-105'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="flex items-center space-x-3">
                    <ThemeToggle />
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-neutral-900 dark:text-neutral-100 focus:outline-none p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-300"
                            aria-label="Toggle mobile menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? (
                                <HiX className="h-6 w-6" />
                            ) : (
                                <HiMenu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                    {/* Optional: Admin login link if needed on public header */}
                    {/* <Link to="/admin/login" className="ml-4 px-3 py-2 rounded-md text-sm font-medium hover:bg-neutral-light dark:hover:bg-neutral-darker">Admin</Link> */}
                </div>
            </div>
            {/* Mobile menu (conditionally rendered) */}
            <div
                className={`
                    md:hidden bg-background-light dark:bg-background-dark shadow-lg absolute w-full
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
                `}
            >
                {isMobileMenuOpen && (
                    <ul className="px-4 pt-2 pb-4 space-y-2 sm:px-5">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                                    className={({ isActive }) =>
                                        `block px-3 py-3 rounded-lg text-base font-medium transition-all duration-300 ease-in-out ${isActive
                                            ? 'bg-primary text-onPrimary dark:bg-primary-dark dark:text-onPrimary shadow-sm'
                                            : 'text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 hover:text-primary dark:hover:bg-neutral-700 dark:hover:text-primary-light'
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </header>
    );
}
