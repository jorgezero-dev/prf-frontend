import { Link } from "react-router-dom";
import type { IProject } from "../../types";
import { FaExternalLinkAlt, FaGithub, FaEye } from "react-icons/fa";
import { FiArrowRightCircle } from "react-icons/fi"; // Added for a consistent "view details" affordance

const ProjectCard = ({ project }: { project: IProject }) => {
    const thumbnailUrl = project.images?.find(img => img.isThumbnail)?.url;
    const thumbnailAlt = project.images?.find(img => img.isThumbnail)?.altText || project.title;

    return (
        <div className="card bg-base-100 shadow-2xl border border-base-300/30 rounded-xl transition-all duration-300 hover:shadow-primary/20 hover:border-primary/50 ease-in-out overflow-hidden transform hover:-translate-y-1 flex flex-col h-full">
            {thumbnailUrl && (
                <Link to={`/projects/${project.slug}`} className="block overflow-hidden relative aspect-video"> {/* Maintain aspect ratio */}
                    <img
                        src={thumbnailUrl}
                        alt={thumbnailAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" /* Changed to scale-105 for subtlety */
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                        <span className="btn btn-primary btn-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-100 flex items-center"> {/* Adjusted translate-y */}
                            <FaEye className="mr-2 h-4 w-4" /> View Details
                        </span>
                    </div>
                </Link>
            )}
            <div className="p-5 md:p-6 flex flex-col flex-grow"> {/* Consistent padding */}
                <h3 className="text-xl lg:text-2xl font-bold text-neutral-content group-hover:text-primary transition-colors duration-300 mb-2 truncate" title={project.title}>
                    <Link to={`/projects/${project.slug}`} className="hover:underline">
                        {project.title}
                    </Link>
                </h3>
                <p className="text-base-content/80 dark:text-base-content/75 text-sm mb-4 h-20 overflow-hidden line-clamp-3 leading-relaxed flex-grow"> {/* Adjusted line-clamp and opacity */}
                    {project.shortSummary || 'No summary available.'}
                </p>

                {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-4 pt-3 border-t border-base-300/30 dark:border-neutral-content/10"> {/* Adjusted border opacity */}
                        <p className="text-xs uppercase tracking-wider font-semibold text-base-content/60 dark:text-base-content/50 mb-2.5">Key Technologies</p> {/* Adjusted mb */}
                        <div className="flex flex-wrap gap-2"> {/* Increased gap */}
                            {project.technologies.slice(0, 5).map((tech) => ( /* Show up to 5 techs */
                                <span
                                    key={tech}
                                    className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full dark:bg-primary/20 dark:text-primary-focus transition-colors hover:bg-primary/20 dark:hover:bg-primary/30"
                                >
                                    {tech}
                                </span>
                            ))}
                            {project.technologies.length > 5 && (
                                <span
                                    className="inline-block bg-base-200/60 text-base-content/70 text-xs font-medium px-3 py-1 rounded-full dark:bg-neutral-focus dark:text-neutral-content/70"
                                >
                                    +{project.technologies.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {(project.liveDemoUrl || project.sourceCodeUrl || !thumbnailUrl) && (
                    <div className={`mt-auto pt-4 ${project.technologies && project.technologies.length > 0 ? 'border-t border-base-300/30 dark:border-neutral-content/10' : ''} flex flex-col sm:flex-row gap-2.5`}> {/* Adjusted gap and conditional border */}
                        {project.liveDemoUrl && (
                            <a
                                href={project.liveDemoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-primary flex-1 group/link transform hover:scale-105 transition-transform duration-150 ease-in-out flex items-center justify-center" /* Added flex items-center justify-center */
                                onClick={(e) => e.stopPropagation()}
                            >
                                <FaExternalLinkAlt className="mr-1.5 h-3.5 w-3.5 group-hover/link:animate-pulse" /> Live Demo
                            </a>
                        )}
                        {project.sourceCodeUrl && (
                            <a
                                href={project.sourceCodeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline btn-accent flex-1 group/link transform hover:scale-105 transition-transform duration-150 ease-in-out flex items-center justify-center" /* Added flex items-center justify-center */
                                onClick={(e) => e.stopPropagation()}
                            >
                                <FaGithub className="mr-1.5 h-4 w-4 group-hover/link:animate-pulse" /> Source Code
                            </a>
                        )}
                        {!thumbnailUrl && !project.liveDemoUrl && !project.sourceCodeUrl && (
                            <Link to={`/projects/${project.slug}`} className="btn btn-sm btn-ghost text-primary flex-1 flex items-center justify-center group/link">
                                <FiArrowRightCircle className="mr-2 h-4 w-4 group-hover/link:animate-pulse" /> View Details
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProjectCard;
