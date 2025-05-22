import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, type SubmitHandler, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify'; // Make sure to install: npm install react-toastify
//import TiptapEditor from '../../components/common/TiptapEditor'; // Import TiptapEditor
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector'; // Corrected import
import {
    createAdminBlogPost,
    fetchAdminBlogPostById,
    updateAdminBlogPostThunk,
    clearBlogMessages,
    setCurrentBlogPost,
    selectAdminCurrentBlogPost,
    selectIsAdminBlogPostSaving,
    selectAdminBlogPostSaveError,
    selectAdminBlogPostDetailsError,
    selectIsAdminBlogPostLoadingDetails,
} from '../../store/features/blog/blogSlice';
import { type BlogPostFormData, BlogPostValidationSchema, type IBlogPost } from '../../types';

// Helper to generate slug (optional, can be done on backend too)
const generateSlug = (title: string): string => {
    if (!title) return '';
    return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w-]+/g, '')       // Remove all non-word chars
        .replace(/--+/g, '-');          // Replace multiple - with single -
};

const defaultSeoMetadata = {
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [],
    ogTitle: '',
    ogDescription: '',
    ogImageUrl: '',
};

const BlogPostFormPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { id: postId } = useParams<{ id: string }>();
    const isEditMode = Boolean(postId);

    const currentPost = useAppSelector(selectAdminCurrentBlogPost);
    const isSaving = useAppSelector(selectIsAdminBlogPostSaving);
    const saveError = useAppSelector(selectAdminBlogPostSaveError);
    const detailsError = useAppSelector(selectAdminBlogPostDetailsError);
    const isLoadingDetails = useAppSelector(selectIsAdminBlogPostLoadingDetails);

    const [availableCategories] = useState<string[]>(['Technology', 'Programming', 'Life', 'Tutorial', 'Web Development', 'AI']);

    const {
        control,
        handleSubmit,
        reset,
        setValue, // Kept setValue for potential dynamic updates
        watch,
        formState: { errors }, // Removed isDirty as it's not used currently
    } = useForm<BlogPostFormData>({
        resolver: zodResolver(BlogPostValidationSchema),
        defaultValues: {
            title: '',
            slug: '',
            content: '',
            excerpt: '',
            categories: [], // Changed from category: ''
            tags: [],
            status: 'draft',
            featuredImageUrl: '',
            seoMetadata: { ...defaultSeoMetadata },
        },
    });
    const watchedTitle = watch("title");


    // Memoize reset function to satisfy useEffect dependency rule if needed, though it's generally stable
    const memoizedReset = useCallback(reset, [reset]);

    useEffect(() => {
        dispatch(clearBlogMessages());
        if (isEditMode && postId) {
            dispatch(fetchAdminBlogPostById(postId));
        } else {
            dispatch(setCurrentBlogPost(null));
            memoizedReset({ title: '', slug: '', content: '', excerpt: '', categories: [], tags: [], status: 'draft', featuredImageUrl: '', seoMetadata: { ...defaultSeoMetadata } }); // Changed category to categories
        }
        return () => {
            dispatch(clearBlogMessages());
        };
    }, [dispatch, isEditMode, postId, memoizedReset]);

    useEffect(() => {
        if (isEditMode && currentPost && currentPost._id === postId) {
            memoizedReset({
                title: currentPost.title,
                slug: currentPost.slug,
                content: currentPost.content,
                excerpt: currentPost.excerpt || '',
                categories: currentPost.categories || [], // Changed category to categories
                tags: currentPost.tags || [],
                status: currentPost.status,
                featuredImageUrl: currentPost.featuredImageUrl || '',
                seoMetadata: {
                    seoTitle: currentPost.seoMetadata?.seoTitle || '',
                    seoDescription: currentPost.seoMetadata?.seoDescription || '',
                    seoKeywords: currentPost.seoMetadata?.seoKeywords || [],
                    ogTitle: currentPost.seoMetadata?.ogTitle || '',
                    ogDescription: currentPost.seoMetadata?.ogDescription || '',
                    ogImageUrl: currentPost.seoMetadata?.ogImageUrl || '',
                },
            });
        } else if (!isEditMode) {
            memoizedReset({ title: '', slug: '', content: '', excerpt: '', categories: [], tags: [], status: 'draft', featuredImageUrl: '', seoMetadata: { ...defaultSeoMetadata } }); // Changed category to categories
        }
    }, [currentPost, isEditMode, postId, memoizedReset]);

    const onSubmit: SubmitHandler<BlogPostFormData> = async (data) => {
        const finalSlug = data.slug || generateSlug(data.title);
        if (!finalSlug && !data.slug && data.title) { // if title is also empty, schema will catch it.
            setValue('slug', generateSlug(data.title), { shouldValidate: true });
        } else if (!finalSlug && !data.slug && !data.title) {
            toast.error("Title or Slug is required to save the post.");
            return;
        }

        const postData: Partial<IBlogPost> = {
            ...data, // data now includes categories: string[]
            slug: finalSlug,
            // category field is removed, data.categories will be used directly
            tags: data.tags && data.tags.length > 0 ? data.tags : undefined,
            seoMetadata: data.seoMetadata ? {
                ...data.seoMetadata,
                seoKeywords: data.seoMetadata.seoKeywords && data.seoMetadata.seoKeywords.length > 0 ? data.seoMetadata.seoKeywords : undefined,
            } : undefined,
        };

        try {
            if (isEditMode && postId) {
                await dispatch(updateAdminBlogPostThunk({ id: postId, postData })).unwrap();
                toast.success('Blog post updated successfully!');
            } else {
                await dispatch(createAdminBlogPost(postData)).unwrap();
                toast.success('Blog post created successfully!');
            }
            navigate('/admin/blog');
        } catch (_error) {
            console.error('Error saving blog post:', _error);
            // Error is handled by the slice and displayed via saveError selector
            // toast.error(saveError || 'An unexpected error occurred.'); // Already handled by Alert
        }
    };

    if (isLoadingDetails && isEditMode) {
        return <div className="flex justify-center items-center h-screen"><p className="text-lg text-gray-700 dark:text-neutral-light">Loading post details...</p></div>;
    }

    if (detailsError && isEditMode) {
        return (
            <div className="container mx-auto p-4">
                <div role="alert" className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
                    <span className="font-medium">Error!</span> {`Failed to load post details: ${detailsError}`}
                </div>
            </div>
        );
    }

    const commonInputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-darker rounded-md shadow-sm focus:outline-none focus:ring-primary dark:focus:ring-primary-light focus:border-primary dark:focus:border-primary-light sm:text-sm bg-gray-50 dark:bg-neutral text-gray-900 dark:text-white disabled:opacity-50";
    const commonLabelClass = "block text-sm font-medium text-gray-700 dark:text-neutral-light";

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-6">
                {isEditMode ? `Edit Blog Post` : 'Create New Blog Post'}
            </h1>

            {saveError && (
                <div role="alert" className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
                    <span className="font-medium">Save Error!</span> {saveError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white dark:bg-neutral-dark shadow-xl rounded-lg p-6 sm:p-8">
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-neutral-light mb-4 border-b pb-2 border-gray-200 dark:border-neutral-darker">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="postTitle" className={commonLabelClass}>Post Title <span className="text-red-500">*</span></label>
                            <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                    <input id="postTitle" type="text" {...field} placeholder="My Insightful Article" className={commonInputClass} />
                                )}
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="postSlug" className={commonLabelClass}>Slug (URL friendly)</label>
                            <Controller
                                name="slug"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        id="postSlug"
                                        type="text"
                                        {...field}
                                        placeholder={generateSlug(watchedTitle) || "my-insightful-article"}
                                        className={commonInputClass}
                                        onBlur={(e) => { // Auto-generate slug on blur if empty and title exists
                                            if (!e.target.value && watchedTitle) {
                                                setValue('slug', generateSlug(watchedTitle), { shouldValidate: true });
                                            }
                                            field.onBlur(); // Call original onBlur
                                        }}
                                    />
                                )}
                            />
                            {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
                            <p className="mt-1 text-xs text-gray-500 dark:text-neutral-lighter">Auto-generated if blank and title exists. Lowercase letters, numbers, and hyphens.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-neutral-light mb-4 border-b pb-2 border-gray-200 dark:border-neutral-darker">Content</h2>
                    <div>
                        <label htmlFor="postContent" className={commonLabelClass}>Main Content <span className="text-red-500">*</span></label>
                        <Controller
                            name="content"
                            control={control}
                            render={({ field }) => (
                                <textarea
                                    id="postContent"
                                    {...field}
                                    rows={15}
                                    placeholder="Write your blog post content here. Markdown is supported."
                                    className={`${commonInputClass} font-mono`} // Added font-mono for better markdown editing experience
                                />
                            )}
                        />
                        {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
                    </div>
                    <div className="mt-4">
                        <label htmlFor="postExcerpt" className={commonLabelClass}>Excerpt (Short Summary)</label>
                        <Controller
                            name="excerpt"
                            control={control}
                            render={({ field }) => (
                                <textarea id="postExcerpt" {...field} rows={3} placeholder="A brief summary of your post for previews." className={commonInputClass} />
                            )}
                        />
                        {errors.excerpt && <p className="mt-1 text-xs text-red-500">{errors.excerpt.message}</p>}
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-neutral-light mb-4 border-b pb-2 border-gray-200 dark:border-neutral-darker">Categorization</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="postCategory" className={commonLabelClass}>Category</label>
                            <Controller
                                name="categories" // Changed from "category"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        id="postCategory"
                                        {...field}
                                        value={field.value?.[0] || ''} // Handle array value for select
                                        onChange={(e) => field.onChange(e.target.value ? [e.target.value] : [])} // Store as array
                                        className={commonInputClass}
                                    >
                                        <option value="">Select a category</option>
                                        {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                )}
                            />
                            {errors.categories && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.categories.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="postTags" className={commonLabelClass}>Tags (comma-separated)</label>
                            <Controller
                                name="tags"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        id="postTags"
                                        type="text"
                                        value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                                        onChange={(e) => {
                                            const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                                            field.onChange(tagsArray);
                                        }}
                                        placeholder="react, typescript, webdev"
                                        className={commonInputClass}
                                    />
                                )}
                            />
                            {errors.tags && <p className="mt-1 text-xs text-red-500">{Array.isArray(errors.tags) ? errors.tags.map((e: FieldError | undefined) => e?.message).filter(Boolean).join(', ') : errors.tags.message}</p>}
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-neutral-light mb-4 border-b pb-2 border-gray-200 dark:border-neutral-darker">Status & Visibility</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="postStatus" className={commonLabelClass}>Status <span className="text-red-500">*</span></label>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <select id="postStatus" {...field} className={commonInputClass}>
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                )}
                            />
                            {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="featuredImageUrl" className={commonLabelClass}>Featured Image URL</label>
                            <Controller
                                name="featuredImageUrl"
                                control={control}
                                render={({ field }) => (
                                    <input id="featuredImageUrl" type="url" {...field} placeholder="https://example.com/image.jpg" className={commonInputClass} />
                                )}
                            />
                            {errors.featuredImageUrl && <p className="mt-1 text-xs text-red-500">{errors.featuredImageUrl.message}</p>}
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-neutral-light mb-4 border-b pb-2 border-gray-200 dark:border-neutral-darker">SEO Metadata (Optional)</h2>
                    <div className="space-y-6 p-4 border border-gray-200 dark:border-neutral-darker rounded-md">
                        <div>
                            <label htmlFor="seoTitle" className={commonLabelClass}>SEO Title</label>
                            <Controller name="seoMetadata.seoTitle" control={control} render={({ field }) => <input id="seoTitle" type="text" {...field} placeholder="Custom title for search engines (max 100 chars)" className={commonInputClass} />} />
                            {errors.seoMetadata?.seoTitle && <p className="mt-1 text-xs text-red-500">{errors.seoMetadata.seoTitle.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="seoDescription" className={commonLabelClass}>SEO Description</label>
                            <Controller name="seoMetadata.seoDescription" control={control} render={({ field }) => <textarea id="seoDescription" {...field} rows={2} placeholder="Custom description for search engines (max 200 chars)" className={commonInputClass} />} />
                            {errors.seoMetadata?.seoDescription && <p className="mt-1 text-xs text-red-500">{errors.seoMetadata.seoDescription.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="seoKeywords" className={commonLabelClass}>SEO Keywords (comma-separated)</label>
                            <Controller
                                name="seoMetadata.seoKeywords"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        id="seoKeywords"
                                        type="text"
                                        value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                                        onChange={(e) => {
                                            const keywordsArray = e.target.value.split(',').map(kw => kw.trim()).filter(kw => kw);
                                            field.onChange(keywordsArray);
                                        }}
                                        placeholder="keyword1, keyword2, keyword3 (max 50 chars each)"
                                        className={commonInputClass}
                                    />
                                )}
                            />
                            {errors.seoMetadata?.seoKeywords && <p className="mt-1 text-xs text-red-500">{Array.isArray(errors.seoMetadata.seoKeywords) ? errors.seoMetadata.seoKeywords.map((e: FieldError | undefined) => e?.message).filter(Boolean).join(', ') : errors.seoMetadata.seoKeywords.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="ogTitle" className={commonLabelClass}>Open Graph Title</label>
                            <Controller name="seoMetadata.ogTitle" control={control} render={({ field }) => <input id="ogTitle" type="text" {...field} placeholder="Custom title for social media (max 100 chars)" className={commonInputClass} />} />
                            {errors.seoMetadata?.ogTitle && <p className="mt-1 text-xs text-red-500">{errors.seoMetadata.ogTitle.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="ogDescription" className={commonLabelClass}>Open Graph Description</label>
                            <Controller name="seoMetadata.ogDescription" control={control} render={({ field }) => <textarea id="ogDescription" {...field} rows={2} placeholder="Custom description for social media (max 200 chars)" className={commonInputClass} />} />
                            {errors.seoMetadata?.ogDescription && <p className="mt-1 text-xs text-red-500">{errors.seoMetadata.ogDescription.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="ogImageUrl" className={commonLabelClass}>Open Graph Image URL</label>
                            <Controller name="seoMetadata.ogImageUrl" control={control} render={({ field }) => <input id="ogImageUrl" type="url" {...field} placeholder="https://example.com/social-image.jpg" className={commonInputClass} />} />
                            {errors.seoMetadata?.ogImageUrl && <p className="mt-1 text-xs text-red-500">{errors.seoMetadata.ogImageUrl.message}</p>}
                        </div>
                    </div>
                </section>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-neutral-darker">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/blog')}
                        disabled={isSaving}
                        className="px-4 py-2 border border-gray-300 dark:border-neutral-darker rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-neutral-light bg-white dark:bg-neutral hover:bg-gray-50 dark:hover:bg-neutral-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:opacity-50 flex items-center"
                    >
                        {isSaving && (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isSaving ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Post')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BlogPostFormPage;
