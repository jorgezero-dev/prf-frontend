import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPublishedBlogPosts, getBlogPostTags, getBlogPostCategories } from "../../services/blogService";
import { type IBlogPost, type PaginatedResponse } from "../../types";
import { FaCalendarAlt, FaUser, FaSearch, FaThList, FaTimesCircle } from "react-icons/fa";

// Re-usable BlogPostPreviewCard
const BlogPostPreviewCard = ({ post }: { post: IBlogPost }) => (
    <article className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden rounded-lg">
        {post.featuredImageUrl && (
            <figure className="aspect-video overflow-hidden">
                <img
                    src={post.featuredImageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
            </figure>
        )}
        <div className="card-body p-5 flex-grow">
            <h2 className="card-title text-lg md:text-xl text-primary-focus hover:underline mb-1">
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <div className="text-xs text-neutral-content space-x-3 mb-3">
                <span className="inline-flex items-center"><FaCalendarAlt className="mr-1.5" /> {new Date(post.publishedAt || Date.now()).toLocaleDateString()}</span>
                {post.author && <span className="inline-flex items-center"><FaUser className="mr-1.5" /> {post.author.name}</span>}
            </div>
            <p className="text-sm text-base-content mb-4 line-clamp-3 flex-grow">
                {post.excerpt || post.content.substring(0, 150) + (post.content.length > 150 ? "..." : "")}
            </p>
            {(post.categories && post.categories.length > 0 || (post.tags && post.tags.length > 0)) && (
                <div className="card-actions justify-start mb-4 flex-wrap gap-2">
                    {post.categories && post.categories.map(category => (
                        <Link key={category} to={`?category=${encodeURIComponent(category)}&page=1`} className="badge badge-accent badge-outline text-xs hover:bg-accent hover:text-accent-content"><FaThList className="mr-1" />{category}</Link>
                    ))}
                    {post.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="inline-block bg-gray-200 dark:bg-neutral-dark rounded-full px-3 py-1 text-xs font-semibold text-gray-700 dark:text-neutral-light mr-2 mb-2">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
            <div className="card-actions justify-end mt-auto">
                <Link to={`/blog/${post.slug}`} className="btn btn-primary btn-sm hover:btn-primary-focus">Read More</Link>
            </div>
        </div>
    </article>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
    <div role="alert" className="alert alert-error my-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>Error! {message}</span>
    </div>
);

const PaginationControls = (
    { currentPage, totalPages, onPageChange }:
        { currentPage: number; totalPages: number; onPageChange: (page: number) => void; }
) => {
    if (totalPages <= 1) return null;
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="join mt-12 flex justify-center">
            <button className="join-item btn btn-outline btn-sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>«</button>
            {pageNumbers.map(number => (
                <button key={number} className={`join-item btn btn-sm ${currentPage === number ? "btn-primary" : "btn-outline"}`} onClick={() => onPageChange(number)}>{number}</button>
            ))}
            <button className="join-item btn btn-outline btn-sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>»</button>
        </div>
    );
};

export default function PublicBlogPage() {
    const [postsResponse, setPostsResponse] = useState<PaginatedResponse<IBlogPost> | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const currentTag = searchParams.get("tag") || ""; // Ensure empty string for select value
    const currentCategory = searchParams.get("category") || ""; // Ensure empty string for select value
    const currentSearchTerm = searchParams.get("search") || "";
    const postsPerPage = 9; // Changed to 9 for a 3-column layout

    const [searchTermInput, setSearchTermInput] = useState(currentSearchTerm);

    const debouncedSearch = useCallback(
        (newSearchTerm: string) => {
            const params = new URLSearchParams(searchParams);
            if (newSearchTerm.trim()) {
                params.set("search", newSearchTerm.trim());
            } else {
                params.delete("search");
            }
            params.set("page", "1");
            setSearchParams(params);
        },
        [searchParams, setSearchParams]
    );

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchTermInput !== currentSearchTerm) {
                debouncedSearch(searchTermInput);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTermInput, currentSearchTerm, debouncedSearch]);

    useEffect(() => {
        const fetchBlogData = async () => {
            setIsLoading(true);
            // setError(null); // Clear error before new fetch, but consider keeping old error if new fetch also fails for some reason
            try {
                const categoryFilter = currentCategory || undefined;
                const tagFilter = currentTag || undefined;
                const searchTermFilter = currentSearchTerm || undefined;

                const [postsData, tagsData, categoriesData] = await Promise.all([
                    getPublishedBlogPosts(currentPage, postsPerPage, categoryFilter, tagFilter, searchTermFilter),
                    getBlogPostTags(),
                    getBlogPostCategories()
                ]);
                setPostsResponse(postsData);
                setTags(tagsData.filter(tag => typeof tag === 'string' && tag.trim() !== ''));
                setCategories(categoriesData.filter(cat => typeof cat === 'string' && cat.trim() !== ''));
                setError(null); // Clear error on successful fetch
            } catch (err: unknown) {
                console.error("Failed to fetch blog data:", err);
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
                setError(errorMessage || "Could not load blog posts. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlogData();
    }, [currentPage, currentTag, currentCategory, currentSearchTerm, postsPerPage]);

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterChange = (type: "tag" | "category", value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(type, value);
        } else {
            params.delete(type);
        }
        params.set("page", "1");
        setSearchParams(params);
    };

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTermInput(event.target.value);
    };

    const clearFilters = () => {
        setSearchTermInput("");
        const params = new URLSearchParams();
        params.set("page", "1");
        setSearchParams(params);
    }

    const hasActiveFilters = !!(currentCategory || currentTag || currentSearchTerm);

    // Initial loading state (full screen spinner)
    if (isLoading && !postsResponse && !error) {
        return <LoadingSpinner />;
    }

    // Full page error if initial load fails and no data is present
    if (error && !postsResponse && !isLoading) { // Show only if not loading to prevent flash of error then content
        return (
            <div className="container mx-auto p-4 lg:p-8 flex flex-col min-h-[calc(100vh-200px)]"> {/* Adjust min-height as needed */}
                <header className="text-center my-12 md:my-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Blog Posts</h1>
                    <p className="text-lg text-base-content">Insights, articles, and updates of my work.</p>
                </header>
                <div className="flex-grow flex items-center justify-center">
                    <ErrorMessage message={error} />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="text-center my-10 md:my-14">
                <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-3 animate-fade-in-down">
                    Blog Posts
                </h1>
                <p className="text-md sm:text-lg text-base-content mt-1 animate-fade-in-up delay-200">
                    Insights, articles, and updates of my work.
                </p>
            </header>

            {/* Filter and Search UI - Sticky */}
            <div className="mb-10 p-5 bg-base-200 rounded-xl shadow-lg sticky top-4 z-50 backdrop-blur-md bg-opacity-80">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-center">
                    <div className="form-control lg:col-span-1">
                        <label htmlFor="searchInput" className="label pb-1"><span className="label-text font-medium">Search Posts</span></label>
                        <div className="join w-full">
                            <input
                                id="searchInput"
                                type="text"
                                placeholder="Keywords..."
                                className="input input-bordered join-item w-full focus:input-primary"
                                value={searchTermInput}
                                onChange={handleSearchInputChange}
                                aria-label="Search blog posts"
                            />
                            <button
                                className="btn btn-primary join-item"
                                onClick={() => debouncedSearch(searchTermInput)}
                                aria-label="Submit search"
                                disabled={isLoading}
                            >
                                {isLoading && searchTermInput !== currentSearchTerm ? <span className="loading loading-spinner loading-xs"></span> : <FaSearch />}
                            </button>
                        </div>
                    </div>

                    <div className="form-control">
                        <label htmlFor="categorySelect" className="label pb-1"><span className="label-text font-medium">Category</span></label>
                        <select
                            id="categorySelect"
                            className="select select-bordered w-full focus:select-primary"
                            value={currentCategory}
                            onChange={(e) => handleFilterChange("category", e.target.value)}
                            aria-label="Filter by category"
                            disabled={isLoading}
                        >
                            <option value="">All Categories</option>
                            {Array.isArray(categories) && categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="form-control">
                        <label htmlFor="tagSelect" className="label pb-1"><span className="label-text font-medium">Tag</span></label>
                        <select
                            id="tagSelect"
                            className="select select-bordered w-full focus:select-primary"
                            value={currentTag}
                            onChange={(e) => handleFilterChange("tag", e.target.value)}
                            aria-label="Filter by tag"
                            disabled={isLoading}
                        >
                            <option value="">All Tags</option>
                            {Array.isArray(tags) && tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                        </select>
                    </div>
                </div>
                {hasActiveFilters && (
                    <div className="mt-4 flex justify-end">
                        <button
                            className="btn btn-ghost btn-sm text-error hover:bg-error/10 flex items-center"
                            onClick={clearFilters}
                            aria-label="Clear all filters"
                            disabled={isLoading}
                        >
                            <FaTimesCircle className="mr-1.5" /> Clear All Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Inline error message for errors during filtering/pagination if data is already present */}
            {error && postsResponse && postsResponse.data.length > 0 && !isLoading && (
                <div className="my-4"><ErrorMessage message={error} /></div>
            )}

            {/* Loading spinner for subsequent loads (e.g. filtering, pagination) */}
            {isLoading && (postsResponse || error) && <LoadingSpinner />}

            {!isLoading && postsResponse && postsResponse.data.length === 0 && (
                <div className="text-center py-16">
                    <FaSearch size={48} className="mx-auto text-neutral-content/50 mb-4" />
                    <p className="text-xl text-neutral-content mb-2">No Posts Found</p>
                    <p className="text-base-content">We couldn't find any posts matching your criteria. Please try a different search or filter.</p>
                </div>
            )}

            {postsResponse && postsResponse.data.length > 0 && ( // Always render posts if available, even if loading new ones
                <div className={`grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 ${isLoading ? 'opacity-70' : ''}`}>
                    {postsResponse.data.map((post: IBlogPost) => (
                        <BlogPostPreviewCard key={post._id} post={post} />
                    ))}
                </div>
            )}

            {postsResponse && postsResponse.totalPages > 1 && !isLoading && ( // Show pagination only if not loading and multiple pages
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={postsResponse.totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}
