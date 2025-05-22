import { Link } from "react-router-dom";
import type { IBlogPost } from "../../types";
import { FiArrowRight } from "react-icons/fi"; // Added for a "read more" affordance

const BlogPostPreview = ({ post }: { post: IBlogPost }) => (
    <div className="card bg-base-100 shadow-2xl border border-base-300/30 rounded-xl transition-all duration-300 hover:shadow-primary/20 hover:border-primary/50 ease-in-out overflow-hidden flex flex-col h-full">
        <Link to={`/blog/${post.slug}`} className="flex flex-col flex-grow">
            {post.featuredImageUrl && (
                <div className="overflow-hidden aspect-video"> {/* Maintain aspect ratio for images */}
                    <img
                        src={post.featuredImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    />
                </div>
            )}
            <div className="p-5 md:p-6 flex flex-col flex-grow"> {/* Added md:p-6 for responsive padding */}
                <h3 className="text-lg lg:text-xl font-semibold text-neutral-content group-hover:text-primary transition-colors duration-300 mb-2 truncate" title={post.title}> {/* Increased mb */}
                    {post.title}
                </h3>
                <p className="text-xs text-base-content/70 dark:text-base-content/60 mb-3"> {/* Increased mb and adjusted opacity */}
                    {new Date(post.publishedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div
                    className="text-base-content/80 dark:text-base-content/75 text-sm h-20 overflow-hidden line-clamp-3 mb-4 leading-relaxed flex-grow" /* Increased h, mb, added leading-relaxed and flex-grow */
                    dangerouslySetInnerHTML={{ __html: post.excerpt || post.content.substring(0, 120) + (post.content.length > 120 ? "..." : "") }} /* Shortened substring slightly */
                />
                <div className="mt-auto pt-3 border-t border-base-300/30 dark:border-neutral-content/10 flex items-center justify-end text-sm text-primary group-hover:underline">
                    Read More
                    <FiArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    </div>
);

export default BlogPostPreview;
