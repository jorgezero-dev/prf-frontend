import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError, selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../../store/features/auth/authSlice';
import type { AppDispatch } from '../../store/store';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const isLoading = useSelector(selectAuthLoading);
    const authError = useSelector(selectAuthError);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin/dashboard'); // Redirect to dashboard if authenticated
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        // Clear auth error when component unmounts or email/password changes
        // to prevent showing old errors if the user navigates away and back.
        return () => {
            dispatch(clearAuthError());
        };
    }, [dispatch]); // Dependency array simplified, clear on unmount

    // Clear error when email or password changes, providing immediate feedback
    useEffect(() => {
        if (authError) {
            dispatch(clearAuthError());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, password]); // dispatch is stable, authError is the trigger but we clear on input change

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light via-primary to-primary-dark dark:from-neutral-dark dark:via-background-dark dark:to-neutral-darker p-4">
            <div className="w-full max-w-md bg-white dark:bg-neutral-dark rounded-xl shadow-2xl p-8 space-y-8 transform transition-all duration-500 ease-in-out hover:scale-105">
                <div className="text-center">
                    {/* Optional: Add a logo here */}
                    {/* <img className="mx-auto h-12 w-auto" src="/path-to-your-logo.svg" alt="Logo" /> */}
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Admin Panel Login
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-neutral-light">
                        Welcome back! Please sign in to your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-1">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            disabled={isLoading}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-neutral-darker rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-neutral-light focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light sm:text-sm bg-gray-50 dark:bg-neutral-dark text-gray-900 dark:text-white transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-neutral-light mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            disabled={isLoading}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-neutral-darker rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-neutral-light focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light sm:text-sm bg-gray-50 dark:bg-neutral-dark text-gray-900 dark:text-white transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {authError && (
                        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-300 text-red-700 dark:text-red-200 p-4 rounded-md text-sm" role="alert">
                            <p><span className="font-medium">Login failed:</span> {authError}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-neutral-dark dark:focus:ring-primary-light disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out group relative"
                        >
                            {isLoading && (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-xs text-gray-500 dark:text-neutral-light">
                    &copy; {new Date().getFullYear()} Your Portfolio Admin. All rights reserved.
                </p>
            </div>
        </div>
    );
}
