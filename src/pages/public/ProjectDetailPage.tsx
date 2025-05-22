import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublishedProjectByIdOrSlug } from "../../services/projectService";
import { type IProject, type ProjectImage } from "../../types";
import { FaExternalLinkAlt, FaGithub, FaTools, FaLightbulb, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const LoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
    <div role="alert" className="alert alert-error my-8 max-w-2xl mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>Error! {message}</span>
        <Link to="/projects" className="btn btn-sm btn-neutral ml-auto">Back to Projects</Link>
    </div>
);

const ImageGallery = ({ images }: { images: ProjectImage[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-base-200 rounded-box shadow-md">
                <p className="text-center text-base-content/70 italic text-lg">No images available for this project.</p>
            </div>
        );
    }

    const goToPrevious = () => {
        const isFirstImage = currentIndex === 0;
        const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastImage = currentIndex === images.length - 1;
        const newIndex = isLastImage ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto shadow-xl rounded-lg overflow-hidden mb-10 md:mb-12 group">
            <div className="aspect-w-16 aspect-h-9 bg-base-300 flex items-center justify-center"> {/* Ensure consistent aspect ratio */}
                <img
                    src={images[currentIndex].url}
                    alt={images[currentIndex].altText || `Project image ${currentIndex + 1}`}
                    className="w-full h-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
            </div>
            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute top-1/2 left-3 md:left-4 transform -translate-y-1/2 btn btn-circle btn-neutral btn-sm md:btn-md opacity-70 hover:opacity-100 transition-opacity duration-300 shadow-lg"
                        aria-label="Previous image"
                    >
                        <FaChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute top-1/2 right-3 md:right-4 transform -translate-y-1/2 btn btn-circle btn-neutral btn-sm md:btn-md opacity-70 hover:opacity-100 transition-opacity duration-300 shadow-lg"
                        aria-label="Next image"
                    >
                        <FaChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                    <div className="absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2.5 p-1 bg-black/20 rounded-full">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${currentIndex === index ? 'bg-primary scale-125' : 'bg-base-100 opacity-60 hover:opacity-90'} transition-all duration-300`}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default function ProjectDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [project, setProject] = useState<IProject | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            setError("Project identifier is missing.");
            setIsLoading(false);
            return;
        }

        const fetchProjectDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getPublishedProjectByIdOrSlug(slug);
                setProject(data);
            } catch (err: unknown) {
                console.error(`Failed to fetch project ${slug}:`, err);
                let status;
                if (typeof err === 'object' && err !== null) {
                    if ('response' in err && typeof (err as { response: unknown }).response === 'object' && (err as { response: unknown }).response !== null) {
                        const response = (err as { response: { status?: number } }).response;
                        if ('status' in response && typeof response.status === 'number') {
                            status = response.status;
                        }
                    }
                }

                if (status === 404) {
                    setError("Project not found. It might have been moved or deleted.");
                } else if (err instanceof Error) {
                    setError(err.message || "Could not load project details. Please try again later.");
                } else {
                    setError("An unknown error occurred while fetching project details.");
                }
            }
            setIsLoading(false);
        };

        fetchProjectDetails();
    }, [slug]);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!project) return <ErrorMessage message="Project data could not be loaded." />;

    const {
        title,
        description,
        technologies,
        role,
        challenges,
        images,
        liveDemoUrl,
        sourceCodeUrl
    } = project;

    return (
        <div className="bg-base-100 text-base-content min-h-screen">
            <div className="container mx-auto px-4 py-10 md:px-6 lg:px-8 lg:py-16">
                <header className="mb-12 md:mb-16 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary mb-3 tracking-tight animate-fade-in-down leading-tight">{title}</h1>
                    {role && <p className="text-lg sm:text-xl text-accent-focus/80 italic font-medium animate-fade-in-up delay-150">My Role: {role}</p>}
                </header>

                {images && images.length > 0 && (
                    <div className="mb-12 md:mb-16 animate-fade-in delay-300">
                        <ImageGallery images={images} />
                    </div>
                )}

                <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
                    <main className="lg:col-span-8 space-y-10">
                        <section id="description" className="bg-base-200 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out animate-slide-in-left">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-primary-focus flex items-center">
                                <FaLightbulb className="inline mr-3 text-accent h-6 w-6 sm:h-7 sm:w-7" /> Project Overview
                            </h2>
                            {description ? (
                                <div className="prose prose-lg max-w-none text-base-content/90 leading-relaxed" dangerouslySetInnerHTML={{ __html: description }} />
                            ) : (
                                <p className="italic text-base-content/70">No detailed description available.</p>
                            )}
                        </section>

                        {challenges && (
                            <section id="challenges-solutions" className="bg-base-200 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out animate-slide-in-left delay-100">
                                <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-primary-focus flex items-center">
                                    <FaTools className="inline mr-3 text-accent h-6 w-6 sm:h-7 sm:w-7" /> Challenges & Solutions
                                </h2>
                                <div className="prose prose-lg max-w-none text-base-content/90 leading-relaxed" dangerouslySetInnerHTML={{ __html: challenges }} />
                            </section>
                        )}
                        {!challenges && (
                            <section id="challenges-solutions-fallback" className="bg-base-200 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out animate-slide-in-left delay-100">
                                <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-primary-focus flex items-center">
                                    <FaTools className="inline mr-3 text-accent h-6 w-6 sm:h-7 sm:w-7" /> Challenges & Solutions
                                </h2>
                                <p className="italic text-base-content/70">No specific challenges or solutions were detailed for this project.</p>
                            </section>
                        )}
                    </main>

                    <aside className="lg:col-span-4 space-y-7 lg:sticky lg:top-28 self-start animate-slide-in-right">
                        <div className="bg-base-200 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-l-4 border-accent/60">
                            <h2 className="text-xl sm:text-2xl font-bold mb-5 text-primary-focus flex items-center">
                                <FaTools className="inline mr-3 text-accent h-5 w-5 sm:h-6 sm:w-6" />
                                <span className="relative">
                                    Technologies Used
                                    <span className="absolute bottom-0 left-0 w-full h-1 bg-accent/20 rounded-full"></span>
                                </span>
                            </h2>
                            {technologies && technologies.length > 0 ? (
                                <div className="flex flex-wrap gap-2.5">
                                    {technologies.map(tech => (
                                        <span
                                            key={tech}
                                            className="badge badge-lg bg-base-100 text-primary-focus hover:bg-primary hover:text-primary-content 
                                                     transition-all duration-300 ease-in-out transform hover:scale-110 hover:rotate-1
                                                     cursor-default text-sm font-medium px-4 py-3 shadow-sm"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-3 px-4 bg-base-300/50 rounded-lg text-center">
                                    <p className="italic text-base-content/70">Technology stack not specified.</p>
                                </div>
                            )}
                        </div>

                        {(liveDemoUrl || sourceCodeUrl) && (
                            <div className="bg-base-200 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-l-4 border-accent/60">
                                <h2 className="text-xl sm:text-2xl font-bold mb-5 text-primary-focus flex items-center">
                                    <FaExternalLinkAlt className="inline mr-3 text-accent h-5 w-5 sm:h-6 sm:w-6" />
                                    <span className="relative">
                                        Project Links
                                        <span className="absolute bottom-0 left-0 w-full h-1 bg-accent/20 rounded-full"></span>
                                    </span>
                                </h2>
                                <div className="space-y-4">
                                    {liveDemoUrl && (
                                        <a
                                            href={liveDemoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary btn-block group text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-out flex items-center justify-center"
                                        >
                                            <FaExternalLinkAlt className="mr-2.5 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                                            <span>Live Demo</span>
                                        </a>
                                    )}
                                    {sourceCodeUrl && (
                                        <a
                                            href={sourceCodeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline btn-secondary btn-block group text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ease-out flex items-center justify-center"
                                        >
                                            <FaGithub className="mr-2.5 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                                            <span>Source Code</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                        {!(liveDemoUrl || sourceCodeUrl) && (
                            <div className="bg-base-200 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-l-4 border-accent/60">
                                <h2 className="text-xl sm:text-2xl font-bold mb-5 text-primary-focus flex items-center">
                                    <FaExternalLinkAlt className="inline mr-3 text-accent h-5 w-5 sm:h-6 sm:w-6" />
                                    <span className="relative">
                                        Project Links
                                        <span className="absolute bottom-0 left-0 w-full h-1 bg-accent/20 rounded-full"></span>
                                    </span>
                                </h2>
                                <div className="py-4 px-5 bg-base-300/50 rounded-lg text-center">
                                    <p className="italic text-base-content/70">No external links provided for this project.</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-base-200 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-l-4 border-accent/60">
                            <Link
                                to="/projects"
                                className="btn btn-outline btn-accent btn-block group flex items-center justify-center gap-3 
                                         transform hover:-translate-y-0.5 transition-all duration-300 ease-out 
                                         shadow-md hover:shadow-lg text-base font-medium
                                         hover:bg-accent/10 hover:border-accent"
                            >
                                <span className="relative flex items-center">
                                    <FaChevronLeft className="h-4 w-4 group-hover:-translate-x-1.5 transition-transform duration-300 ease-out" />
                                    <span className="ml-2">Back to Projects Gallery</span>
                                </span>
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
