import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedProjects } from "../../services/projectService";
import { getPublishedBlogPosts } from "../../services/blogService";
import { type IProject, type IBlogPost } from "../../types";
// import { getPublicProfile } from "../../services/profileService"; // Assuming a public profile service

// Import common components
import ProjectCard from "../../components/common/ProjectCard";
import BlogPostPreview from "../../components/common/BlogPostPreview";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

// Placeholder components - replace with actual UI components
// const ProjectCard = ({ project }: { project: IProject }) => ( // Moved to common components
// ...existing code...
// );

// const BlogPostPreview = ({ post }: { post: IBlogPost }) => ( // Moved to common components
// ...existing code...
// );

// const LoadingSpinner = () => ( // Moved to common components
// ...existing code...
// );

// const ErrorMessage = ({ message }: { message: string }) => ( // Moved to common components
// ...existing code...
// );

export default function HomePage() {
    const [featuredProjects, setFeaturedProjects] = useState<IProject[]>([]);
    const [recentPosts, setRecentPosts] = useState<IBlogPost[]>([]);
    // const [profile, setProfile] = useState<any>(null); // Replace 'any' with your public profile type

    const [projectsLoading, setProjectsLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    // const [profileLoading, setProfileLoading] = useState(true);

    const [projectsError, setProjectsError] = useState<string | null>(null);
    const [postsError, setPostsError] = useState<string | null>(null);
    // const [profileError, setProfileError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHomePageData = async () => {
            // Fetch Featured Projects
            try {
                setProjectsLoading(true);
                const projectsResponse = await getPublishedProjects(1, 3, undefined, true); // Fetch 3 featured projects
                setFeaturedProjects(projectsResponse.data);
                setProjectsError(null);
            } catch (error) {
                console.error("Failed to fetch featured projects:", error);
                setProjectsError("Could not load featured projects. Please try again later.");
            } finally {
                setProjectsLoading(false);
            }

            // Fetch Recent Blog Posts
            try {
                setPostsLoading(true);
                const postsResponse = await getPublishedBlogPosts(1, 3, undefined, undefined, undefined, "publishedAt", "desc"); // Fetch 3 recent posts
                setRecentPosts(postsResponse.data);
                setPostsError(null);
            } catch (error) {
                console.error("Failed to fetch recent blog posts:", error);
                setPostsError("Could not load recent blog posts. Please try again later.");
            } finally {
                setPostsLoading(false);
            }

            // Fetch Public Profile Info (Example - assuming a public endpoint)
            // try {
            //   setProfileLoading(true);
            //   const profileData = await getPublicProfile(); // You'll need to create this service
            //   setProfile(profileData);
            //   setProfileError(null);
            // } catch (error) {
            //   console.error("Failed to fetch profile data:", error);
            //   setProfileError("Could not load profile information.");
            // } finally {
            //   setProfileLoading(false);
            // }
        };

        fetchHomePageData();
    }, []);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 md:space-y-24 text-text-lightMode dark:text-text-darkMode">
            {/* Hero/Intro Section */}
            <section className="text-center py-12 md:py-20 bg-gradient-to-br from-primary via-primary-dark to-secondary rounded-xl shadow-2xl text-onPrimary overflow-hidden">
                {/* {profileLoading && <LoadingSpinner />}
                {profileError && <ErrorMessage message={profileError} />}
                {profile && (
                <>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 animate-fade-in-down">{profile.name || "Welcome to My Portfolio"}</h1>
                    <p className="text-lg sm:text-xl lg:text-2xl mb-8 animate-fade-in-up delay-200 max-w-2xl mx-auto">{profile.headline || "Showcasing my journey and skills in web development."}</p>
                </>
                )} */}
                {/* Static content if profile API is not public or not ready */}
                <div className="animate-fade-in-down">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
                        Welcome to My Digital Space
                    </h1>
                </div>
                <div className="animate-fade-in-up delay-200">
                    <p className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto px-4">
                        Discover my projects, explore my thoughts on development, and get to know my professional journey.
                    </p>
                </div>
                <div className="animate-fade-in-up delay-400">
                    <Link
                        to="/about"
                        className="btn btn-lg text-onAccent dark:hover:bg-accent focus:ring-accent-light transition-all duration-300 ease-in-out hover:shadow-lg transform hover:scale-105"
                    >
                        Learn More About Me
                    </Link>
                </div>
            </section>

            {/* Featured Projects Section */}
            <section className="space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-lightMode dark:text-text-darkMode mb-2">Featured Projects</h2>
                    <p className="text-lg text-text-lightModeSecondary dark:text-text-darkModeSecondary max-w-xl mx-auto">
                        A selection of projects that showcase my skills and passion for creating impactful solutions.
                    </p>
                </div>

                {projectsLoading && <LoadingSpinner />}
                {projectsError && <ErrorMessage message={projectsError} />}
                {!projectsLoading && !projectsError && featuredProjects.length === 0 && (
                    <p className="text-center text-text-lightModeSecondary dark:text-text-darkModeSecondary py-10">No featured projects available at the moment. Check back soon!</p>
                )}
                {!projectsLoading && !projectsError && featuredProjects.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {featuredProjects.map((project) => (
                            <ProjectCard key={project._id || project.slug} project={project} />
                        ))}
                    </div>
                )}
                {!projectsLoading && !projectsError && featuredProjects.length > 0 && (
                    <div className="text-center pt-6">
                        <Link to="/projects" className="btn btn-outline border-primary text-primary hover:bg-primary hover:text-onPrimary dark:border-primary-light dark:text-primary-light dark:hover:bg-primary-light dark:hover:text-onAccent focus:ring-primary-light transition-colors duration-300">
                            View All Projects
                        </Link>
                    </div>
                )}
            </section>

            {/* Recent Blog Posts Section */}
            <section className="space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-text-lightMode dark:text-text-darkMode mb-2">Latest Insights</h2>
                    <p className="text-lg text-text-lightModeSecondary dark:text-text-darkModeSecondary max-w-xl mx-auto">
                        Sharing my thoughts, experiences, and learnings from the world of technology and development.
                    </p>
                </div>

                {postsLoading && <LoadingSpinner />}
                {postsError && <ErrorMessage message={postsError} />}
                {!postsLoading && !postsError && recentPosts.length === 0 && (
                    <p className="text-center text-text-lightModeSecondary dark:text-text-darkModeSecondary py-10">No blog posts published yet. Stay tuned for updates!</p>
                )}
                {!postsLoading && !postsError && recentPosts.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {recentPosts.map((post) => (
                            <BlogPostPreview key={post._id || post.slug} post={post} />
                        ))}
                    </div>
                )}
                {!postsLoading && !postsError && recentPosts.length > 0 && (
                    <div className="text-center pt-6">
                        <Link to="/blog" className="btn btn-outline border-secondary text-secondary hover:bg-secondary hover:text-onPrimary dark:border-secondary-light dark:text-secondary-light dark:hover:bg-secondary-light dark:hover:text-onAccent focus:ring-secondary-light transition-colors duration-300">
                            Explore More Posts
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}

// Basic animation styles (add to your global CSS e.g., index.css or App.css)
// Ensure these are in your global CSS file (e.g., src/index.css or src/App.css)
/*
@layer base {
  body {
    @apply bg-base-200 text-base-content; // Example base styling
  }
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fade-in-down 0.6s ease-out forwards; // Slightly adjusted duration
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards; // Slightly adjusted duration
}

.delay-200 { animation-delay: 0.2s; }
.delay-400 { animation-delay: 0.4s; }
*/
