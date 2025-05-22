import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPublishedProjects } from "../../services/projectService";
import { type IProject, type PaginatedResponse } from "../../types";
import ProjectCard from "../../components/common/ProjectCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight, FaSearchMinus } from "react-icons/fa"; // Added icons

// PaginationControls - Enhanced for better UX and visual appeal
const PaginationControls = (
    { currentPage, totalPages, onPageChange, isLoading }:
        { currentPage: number; totalPages: number; onPageChange: (page: number) => void; isLoading: boolean; }
) => {
    if (totalPages <= 1) return null;

    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        if (currentPage < totalPages / 2) {
            endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        } else {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
    }
    startPage = Math.max(1, startPage);
    endPage = Math.min(totalPages, endPage);

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="join mt-16 mb-12 flex justify-center items-center space-x-1" aria-label="Pagination"> {/* Increased top margin */}
            <button
                className="join-item btn btn-outline btn-sm disabled:opacity-50 transition-colors duration-200 flex items-center" // Added flex items-center
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                aria-label="Go to previous page"
            >
                <FaAngleLeft className="mr-1 h-4 w-4" /> {/* Added icon and margin */}
                Prev
            </button>
            {startPage > 1 && (
                <button
                    className="join-item btn btn-outline btn-sm disabled:opacity-50 transition-colors duration-200 flex items-center" // Added flex items-center
                    onClick={() => onPageChange(1)}
                    disabled={isLoading}
                    aria-label="Go to first page"
                >
                    <FaAngleDoubleLeft className="mr-1 h-4 w-4" /> {/* Added icon */}
                    1
                </button>
            )}
            {startPage > 2 && <span className="px-2 text-base-content/70">...</span>} {/* Simplified ellipsis */}
            {pageNumbers.map(number => (
                <button
                    key={number}
                    className={`join-item btn btn-sm ${currentPage === number ? "btn-primary" : "btn-outline hover:btn-neutral"} transition-colors duration-200 disabled:opacity-50`}
                    onClick={() => onPageChange(number)}
                    disabled={isLoading}
                    aria-current={currentPage === number ? "page" : undefined}
                >
                    {number}
                </button>
            ))}
            {endPage < totalPages - 1 && <span className="px-2 text-base-content/70">...</span>} {/* Simplified ellipsis */}
            {endPage < totalPages && (
                <button
                    className="join-item btn btn-outline btn-sm disabled:opacity-50 transition-colors duration-200 flex items-center" // Added flex items-center
                    onClick={() => onPageChange(totalPages)}
                    disabled={isLoading}
                    aria-label="Go to last page"
                >
                    {totalPages}
                    <FaAngleDoubleRight className="ml-1 h-4 w-4" /> {/* Added icon */}
                </button>
            )}
            <button
                className="join-item btn btn-outline btn-sm disabled:opacity-50 transition-colors duration-200 flex items-center" // Added flex items-center
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                aria-label="Go to next page"
            >
                Next
                <FaAngleRight className="ml-1 h-4 w-4" /> {/* Added icon and margin */}
            </button>
        </div>
    );
};

// TODO: Implement a filter UI for categories/technologies
// const FilterUI = ({ categories, currentCategory, onFilterChange, isLoading }) => { ... }

export default function PublicProjectsPage() {
    const [projectsResponse, setProjectsResponse] = useState<PaginatedResponse<IProject> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const currentCategory = searchParams.get("category") || undefined;
    const projectsPerPage = 9; // As per F-FR2.3

    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Simulate a slight delay for loading states if needed for UX testing
                // await new Promise(resolve => setTimeout(resolve, 500));
                const response = await getPublishedProjects(currentPage, projectsPerPage, currentCategory);
                setProjectsResponse(response);
            } catch (err: unknown) {
                console.error("Failed to fetch projects:", err);
                if (err instanceof Error) {
                    setError(err.message || "Could not load projects. Please try again later.");
                } else {
                    setError("An unknown error occurred while fetching projects. Please try again later.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [currentPage, currentCategory, projectsPerPage]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > (projectsResponse?.totalPages || 1) || page === currentPage) return;
        setSearchParams({ page: page.toString(), ...(currentCategory && { category: currentCategory }) });
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
    };

    // TODO: const handleFilterChange = (category: string) => { ... }
    // This would update searchParams: setSearchParams({ page: "1", category });
    // window.scrollTo({ top: 0, behavior: 'smooth' });

    if (error) return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center"> {/* Adjusted padding */}
            <ErrorMessage message={error} />
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen"> {/* Adjusted padding and py */}
            <header className="text-center my-12 md:my-20"> {/* Increased vertical margin */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-4 animate-fade-in-down"> {/* Adjusted font size and margin */}
                    Explore My Work
                </h1>
                <p className="text-lg sm:text-xl text-base-content/80 mt-3 animate-fade-in-up delay-200 max-w-3xl mx-auto"> {/* Adjusted text size and max-width */}
                    A curated collection of projects I've passionately developed and contributed to, showcasing a journey through technology and design.
                </p>
                {/* TODO: Add Filter UI here once implemented. 
                    Consider a visually appealing dropdown or a set of pill buttons.
                    Example: <FilterUI categories={uniqueCategories} currentCategory={currentCategory} onFilterChange={handleFilterChange} isLoading={isLoading} /> 
                */}
            </header>

            {isLoading && !projectsResponse && (
                <div className="flex justify-center items-center h-64"> {/* Centered spinner */}
                    <LoadingSpinner />
                </div>
            )}

            {!isLoading && !error && (!projectsResponse || projectsResponse.data.length === 0) && (
                <div className="text-center py-16"> {/* Increased padding */}
                    <FaSearchMinus className="mx-auto text-6xl text-neutral-content/50 mb-6" /> {/* Added icon */}
                    <h2 className="text-3xl font-semibold text-neutral-content mb-4">No Projects Found</h2> {/* Increased font size */}
                    <p className="text-base-content/70 text-lg"> {/* Increased font size */}
                        It seems there are no projects matching your current criteria. Try adjusting filters or check back later!
                    </p>
                    {/* Optionally, add a button to clear filters if a filter is active */}
                    {/* {currentCategory && <button onClick={() => handleFilterChange('')} className="btn btn-ghost mt-4">Clear Category Filter</button>} */}
                </div>
            )}

            {projectsResponse && projectsResponse.data.length > 0 && (
                <>
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-12"> {/* Adjusted gap and mb */}
                        {projectsResponse.data.map((project) => (
                            <ProjectCard key={project._id} project={project} />
                        ))}
                    </div>
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={projectsResponse.totalPages}
                        onPageChange={handlePageChange}
                        isLoading={isLoading} // Pass isLoading to pagination
                    />
                </>
            )}
        </div>
    );
}
