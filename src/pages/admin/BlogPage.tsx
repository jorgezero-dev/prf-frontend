import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import {
    fetchAdminBlogPosts,
    deleteAdminBlogPostThunk,
    selectAdminBlogPosts,
    selectIsAdminBlogPostsLoadingList,
    selectAdminBlogPostListError,
    selectAdminBlogPagination,
    clearBlogMessages,
} from '../../store/features/blog/blogSlice';
import type { IBlogPost, PaginatedResponse } from '../../types'; // Assuming AdminBlogFilters might be part of a general filter type or defined here
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';

// Define a filter type for admin blog posts if not already in types/index.ts
interface AdminBlogFilters {
    page?: number;
    limit?: number;
    status?: '' | 'draft' | 'published';
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

const BlogPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const posts = useAppSelector(selectAdminBlogPosts);
    const loading = useAppSelector(selectIsAdminBlogPostsLoadingList);
    const error = useAppSelector(selectAdminBlogPostListError);
    const pagination = useAppSelector(selectAdminBlogPagination) as PaginatedResponse<IBlogPost> | null; // Type assertion

    const [filters, setFilters] = useState<AdminBlogFilters>({
        page: 1,
        limit: 10,
        status: '', // all statuses
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    const fetchPosts = useCallback(() => {
        dispatch(fetchAdminBlogPosts(filters));
    }, [dispatch, filters]);

    useEffect(() => {
        dispatch(clearBlogMessages());
        fetchPosts();
        return () => {
            dispatch(clearBlogMessages());
        };
    }, [dispatch, fetchPosts]); // fetchPosts dependency will re-run if filters change

    const handleDelete = async (postId: string, postTitle: string) => {
        if (window.confirm(`Are you sure you want to delete the blog post "${postTitle}"?`)) {
            try {
                await dispatch(deleteAdminBlogPostThunk(postId)).unwrap();
                // fetchPosts(); // Re-fetch is handled by slice for delete usually, or can be explicit
            } catch (err) {
                console.error('Failed to delete blog post:', err);
                // Display error to user via toast or alert
            }
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [e.target.name]: e.target.value,
            page: 1, // Reset to page 1 on filter change
        }));
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            fetchPosts(); // Trigger search on Enter key
        }
    };

    const handlePageChange = (newPage: number) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            page: newPage,
        }));
    };

    if (loading && filters.page === 1 && !posts.length) return <div className="p-6 text-center text-gray-300">Loading blog posts...</div>;
    if (error) return <div className="p-6 text-red-400 bg-red-900 rounded-md text-center">Error loading posts: {typeof error === 'object' ? JSON.stringify(error) : error}</div>;

    return (
        <div className="container mx-auto p-4 md:p-8 bg-gray-900 text-white min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                    Manage Blog Posts
                </h1>
                <Link
                    to="/admin/blog/new"
                    className="flex items-center px-4 py-2.5 text-sm font-medium bg-green-600 hover:bg-green-700 rounded-md text-white transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                    <FaPlus className="mr-2" /> Create New Post
                </Link>
            </div>

            {/* Filters and Sorting */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-1">Search:</label>
                        <input
                            id="search"
                            name="search"
                            type="text"
                            value={filters.search}
                            onChange={handleFilterChange}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Search by title, content..."
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white shadow-sm transition-colors duration-150"
                        />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status:</label>
                        <select
                            id="status"
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white shadow-sm transition-colors duration-150"
                        >
                            <option value="">All</option>
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
                            <option value="publishedAt">Date Published</option>
                            <option value="title">Title</option>
                            <option value="status">Status</option>
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

            {loading && <div className="p-4 text-center text-gray-400">Updating blog post list...</div>}

            {/* Blog Posts Table */}
            <div className="bg-gray-800 shadow-xl rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-750">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Author</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Categories</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tags</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Published At</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {posts.length === 0 && !loading && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-lg">
                                    No blog posts found. <Link to="/admin/blog/new" className="text-indigo-400 hover:text-indigo-300">Create one now!</Link>
                                </td>
                            </tr>
                        )}
                        {posts.map((post: IBlogPost) => (
                            <tr key={post._id} className="hover:bg-gray-700 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 max-w-xs truncate" title={post.title}>{post.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${post.status === 'published' ? 'bg-green-700 text-green-100' : 'bg-yellow-700 text-yellow-100'
                                        }`}>
                                        {post.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{post.author?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 max-w-xs truncate" title={post.categories?.join(', ')}>{post.categories?.join(', ') || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 max-w-xs truncate" title={post.tags?.join(', ')}>{post.tags?.join(', ') || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Not Published'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    {post.status === 'published' && post.slug && (
                                        <a
                                            href={`/blog/${post.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sky-400 hover:text-sky-300 transition-colors duration-150"
                                            title="Preview Post"
                                        >
                                            <FaEye size={18} />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => navigate(`/admin/blog/edit/${post._id}`)}
                                        className="text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
                                        aria-label={`Edit ${post.title}`}
                                    >
                                        <FaEdit size={18} />
                                    </button>
                                    <button
                                        onClick={() => post._id && handleDelete(post._id, post.title)}
                                        disabled={!post._id}
                                        className="text-red-500 hover:text-red-400 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label={`Delete ${post.title}`}
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
                        onClick={() => handlePageChange(filters.page ? filters.page - 1 : 1)}
                        disabled={!filters.page || filters.page <= 1 || loading}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-400">
                        Page {filters.page || 1} of {pagination.totalPages} (Total: {pagination.total})
                    </span>
                    <button
                        onClick={() => handlePageChange(filters.page ? filters.page + 1 : 2)}
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

export default BlogPage;
