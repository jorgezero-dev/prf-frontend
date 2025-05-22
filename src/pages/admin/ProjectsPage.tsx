import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch'; // Corrected import path
import { useAppSelector } from '../../hooks/useAppSelector'; // Added separate import for useAppSelector
import {
    fetchAdminProjects,
    deleteAdminProjectThunk,
    selectAdminProjectsList,
    selectIsAdminProjectsLoadingList,
    selectAdminProjectsListError, // Corrected selector name for error state
    selectAdminProjectsPagination,
} from '../../store/features/projects/projectSlice';
import type { IProject, AdminProjectsFilters } from '../../types';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const ProjectsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const projects = useAppSelector(selectAdminProjectsList);
    const loading = useAppSelector(selectIsAdminProjectsLoadingList);
    const error = useAppSelector(selectAdminProjectsListError); // Corrected selector for error state
    const pagination = useAppSelector(selectAdminProjectsPagination);

    const [filters, setFilters] = useState<AdminProjectsFilters>({
        page: 1,
        limit: 10,
        status: '', // all statuses
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    const fetchProjects = useCallback(() => {
        dispatch(fetchAdminProjects(filters)); // Corrected thunk name
    }, [dispatch, filters]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleDelete = async (projectId: string, projectTitle: string) => {
        if (window.confirm(`Are you sure you want to delete the project "${projectTitle}"?`)) {
            try {
                await dispatch(deleteAdminProjectThunk(projectId)).unwrap();
                fetchProjects();
            } catch (err) {
                console.error('Failed to delete project:', err);
                // Consider displaying an error message to the user via a toast or alert
            }
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters((prevFilters: AdminProjectsFilters) => ({ // Added type for prevFilters
            ...prevFilters,
            [e.target.name]: e.target.value,
            page: 1, // Reset to page 1 on filter change
        }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters((prevFilters: AdminProjectsFilters) => ({ // Added type for prevFilters
            ...prevFilters,
            page: newPage,
        }));
    };

    if (loading && filters.page === 1 && !projects.length) return <div className="p-6 text-center text-gray-300">Loading projects...</div>;
    if (error) return <div className="p-6 text-red-400 bg-red-900 rounded-md text-center">Error loading projects: {typeof error === 'object' ? JSON.stringify(error) : error}</div>;

    return (
        <div className="container mx-auto p-4 md:p-8 bg-gray-900 text-white min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">
                    Manage Projects
                </h1>
                <Link
                    to="/admin/projects/new"
                    className="flex items-center px-4 py-2.5 text-sm font-medium bg-green-600 hover:bg-green-700 rounded-md text-white transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                    <FaPlus className="mr-2" /> Create New Project
                </Link>
            </div>

            {/* Filters and Sorting */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Filter by Status:</label>
                        <select
                            id="status"
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white shadow-sm transition-colors duration-150"
                        >
                            <option value="">All Statuses</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="sortBy" className="block text-sm font-medium text-gray-300 mb-1">Sort By:</label>
                        <select
                            id="sortBy"
                            name="sortBy"
                            value={filters.sortBy}
                            onChange={handleFilterChange}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white shadow-sm transition-colors duration-150"
                        >
                            <option value="createdAt">Date Created</option>
                            <option value="updatedAt">Date Updated</option>
                            <option value="title">Title</option>
                            <option value="status">Status</option>
                            <option value="order">Order</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-300 mb-1">Order:</label>
                        <select
                            id="sortOrder"
                            name="sortOrder"
                            value={filters.sortOrder}
                            onChange={handleFilterChange}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white shadow-sm transition-colors duration-150"
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading && <div className="p-4 text-center text-gray-400">Updating project list...</div>}

            {/* Projects Table */}
            <div className="bg-gray-800 shadow-xl rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-750">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Featured</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created At</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {projects.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-lg">
                                    No projects found. <Link to="/admin/projects/new" className="text-indigo-400 hover:text-indigo-300">Create one now!</Link>
                                </td>
                            </tr>
                        )}
                        {projects.map((project: IProject) => (
                            <tr key={project._id} className="hover:bg-gray-700 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{project.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'published' ? 'bg-green-700 text-green-100' : 'bg-yellow-700 text-yellow-100'
                                        }`}>
                                        {project.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{project.order ?? 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{project.featured ? 'Yes' : 'No'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button
                                        onClick={() => navigate(`/admin/projects/edit/${project._id}`)}
                                        className="text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
                                        aria-label={`Edit ${project.title}`}
                                    >
                                        <FaEdit size={18} />
                                    </button>
                                    <button
                                        onClick={() => project._id && handleDelete(project._id, project.title)} // Ensure project._id exists
                                        disabled={!project._id} // Disable if no id
                                        className="text-red-500 hover:text-red-400 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label={`Delete ${project.title}`}
                                    >
                                        <FaTrash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(filters.page ? filters.page - 1 : 1)} // Ensure page is not undefined
                        disabled={!filters.page || filters.page <= 1 || loading}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-400">
                        Page {filters.page || 1} of {pagination.totalPages} (Total Items: {pagination.total})
                    </span>
                    <button
                        onClick={() => handlePageChange(filters.page ? filters.page + 1 : 2)} // Ensure page is not undefined
                        disabled={!filters.page || filters.page >= pagination.totalPages || loading}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
