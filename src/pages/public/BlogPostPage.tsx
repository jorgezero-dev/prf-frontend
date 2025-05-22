import { useEffect, useState, Fragment } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { getPublishedBlogPostBySlug } from "../../services/blogService";
import { type IBlogPost } from "../../types";
import { FaCalendarAlt, FaUser, FaTags, FaThList, FaArrowLeft, FaExclamationTriangle } from "react-icons/fa"; // Added FaExclamationTriangle
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"> {/* Adjusted min-height */}
        <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
);

const ErrorMessage = ({ message, showBackButton = true }: { message: string; showBackButton?: boolean }) => (
    <div role="alert" className="alert alert-error my-8 max-w-3xl mx-auto shadow-lg">
        <FaExclamationTriangle className="stroke-current shrink-0 h-6 w-6" />
        <span>{message}</span>
        {showBackButton && (
            <Link to="/blog" className="btn btn-sm btn-ghost ml-auto hover:bg-error-content/20">Back to Blog</Link>
        )}
    </div>
);

export default function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate(); // For programmatic navigation
    const [post, setPost] = useState<IBlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            setError("Blog post identifier is missing. Please go back to the blog and select a post.");
            setIsLoading(false);
            return;
        }

        const fetchPost = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getPublishedBlogPostBySlug(slug);
                if (!data) { // Handle case where API returns null/undefined for not found
                    setError("Blog post not found. It might have been moved or deleted.");
                    setPost(null); // Ensure post state is also null
                } else {
                    setPost(data);
                    // SEO: Set document title and meta description
                    document.title = data.seoMetadata?.seoTitle || `${data.title} | My Portfolio Blog`;
                    const metaDescTag = document.querySelector('meta[name="description"]');
                    const newDescContent = data.seoMetadata?.seoDescription || data.excerpt || data.content.substring(0, 160);
                    if (metaDescTag) {
                        metaDescTag.setAttribute("content", newDescContent);
                    } else {
                        const newMetaDesc = document.createElement('meta');
                        newMetaDesc.name = "description";
                        newMetaDesc.content = newDescContent;
                        document.head.appendChild(newMetaDesc);
                    }
                }
            } catch (err: unknown) {
                console.error(`Failed to fetch blog post by slug ${slug}:`, err);
                let errorMessage = "An unknown error occurred. Please try again later.";

                if (typeof err === 'object' && err !== null) {
                    // Attempt to access properties common in Axios errors or standard errors
                    // This provides a type-safer way than using 'as any'
                    const errorAsObject = err as { message?: string; isAxiosError?: boolean; response?: { status?: number; data?: { message?: string } } };

                    if (errorAsObject.isAxiosError) {
                        if (errorAsObject.response?.status === 404) {
                            errorMessage = "Blog post not found. It might have been moved or deleted.";
                        } else if (errorAsObject.response?.data?.message) {
                            errorMessage = errorAsObject.response.data.message;
                        } else if (errorAsObject.message) { // Fallback to Axios error's own message property
                            errorMessage = errorAsObject.message;
                        }
                    } else if (errorAsObject.message) { // Handle standard Error objects
                        errorMessage = errorAsObject.message;
                    } else {
                        // If it's an object but not a recognizable error structure, try to stringify
                        try {
                            errorMessage = JSON.stringify(err);
                        } catch {
                            // If stringify fails, stick to the default unknown error message
                        }
                    }
                } else if (typeof err === 'string') { // If a string was thrown
                    errorMessage = err;
                }
                // If err is not an object or string (e.g. null, undefined, number), the default message is used.
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();

        // Cleanup meta description and title on component unmount
        return () => {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute("content", "Welcome to my portfolio and blog."); // Generic description
            document.title = "My Portfolio"; // Reset to default title
        };
    }, [slug]);

    if (isLoading) return <LoadingSpinner />;
    // If error and no post data (e.g. 404 or initial load failure)
    if (error && !post) return <ErrorMessage message={error} />;
    // If no post data even after loading and no specific error (should ideally be caught by error state)
    if (!post) return <ErrorMessage message="Blog post data is unavailable or the post does not exist." />;


    return (
        <div className="bg-base-100 py-8 md:py-12">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
                <button
                    onClick={() => navigate(-1)} // Go back to previous page in history
                    className="btn btn-ghost mb-6 md:mb-8 inline-flex items-center text-primary hover:text-primary-focus transition-colors duration-200 group"
                >
                    <FaArrowLeft className="mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
                    Back
                </button>

                <article className="bg-base-200 shadow-xl rounded-lg overflow-hidden">
                    {post.featuredImageUrl && (
                        <figure className="aspect-video overflow-hidden"> {/* Consistent aspect ratio */}
                            <img
                                src={post.featuredImageUrl}
                                alt={`Featured image for ${post.title}`}
                                className="w-full h-full object-cover"
                            />
                        </figure>
                    )}

                    <div className="p-6 md:p-10">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-focus mb-6 leading-tight hyphens-auto">{post.title}</h1>

                        <div className="text-sm text-neutral-content mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
                            <span className="inline-flex items-center">
                                <FaCalendarAlt className="mr-2 text-secondary" />
                                Published on {new Date(post.publishedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            {post.author && (
                                <span className="inline-flex items-center">
                                    <FaUser className="mr-2 text-secondary" /> By {post.author.name}
                                </span>
                            )}
                        </div>

                        <div className="prose prose dark:prose-invert max-w-none mx-auto bg-white dark:bg-neutral-dark p-6 sm:p-8 rounded-lg shadow-lg mt-8">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                {post.content}
                            </ReactMarkdown>
                        </div>

                        {(post.categories && post.categories.length > 0 || (post.tags && post.tags.length > 0)) && (
                            <div className="mt-10 pt-8 border-t border-base-300/70">
                                {post.categories && post.categories.length > 0 && (
                                    <span className="mr-2">
                                        <FaThList className="mr-1 text-primary dark:text-primary-light" />
                                        {post.categories.map((cat, index) => (
                                            <Fragment key={cat}>
                                                <Link
                                                    to={`/blog?category=${encodeURIComponent(cat)}&page=1`}
                                                    className="text-primary dark:text-primary-light hover:underline"
                                                >
                                                    {cat}
                                                </Link>
                                                {index < post.categories.length - 1 && ', '}
                                            </Fragment>
                                        ))}
                                    </span>
                                )}
                                {post.tags && post.tags.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2 inline-flex items-center text-accent-content">
                                            <FaTags className="mr-2.5 text-secondary" />Tags
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {post.tags.map(tag => (
                                                <Link
                                                    key={tag}
                                                    to={`/blog?tag=${encodeURIComponent(tag)}&page=1`}
                                                    className="badge badge-secondary badge-outline badge-md hover:bg-secondary hover:text-secondary-content transition-colors duration-200"
                                                >
                                                    {tag}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </article>

                {/* Consider adding related posts or comments section here in the future */}
            </div>
        </div>
    );
}
