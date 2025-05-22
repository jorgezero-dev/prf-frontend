import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'; // Example social icons
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store'; // Assuming RootState is exported from store
import type { IProfileAdmin, SocialLink } from '../../types'; // Import IProfileAdmin and SocialLink

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const profile = useSelector((state: RootState) => state.profile.profile) as IProfileAdmin | null;

    const socialLinksToDisplay = profile?.socialLinks
        ?.map((link: SocialLink) => {
            let iconComponent;
            switch (link.platform.toLowerCase()) { // Use toLowerCase for case-insensitive matching
                case 'github':
                    iconComponent = <FaGithub />;
                    break;
                case 'linkedin':
                    iconComponent = <FaLinkedin />;
                    break;
                case 'twitter': // Assuming 'twitter' is the platform name for X
                    iconComponent = <FaTwitter />;
                    break;
                default:
                    iconComponent = null;
            }
            return { ...link, icon: iconComponent };
        })
        .filter(link => link.icon && (link.platform.toLowerCase() === 'github' || link.platform.toLowerCase() === 'linkedin' || link.platform.toLowerCase() === 'twitter'))
        || [
            { platform: 'GitHub', url: 'https://github.com/yourusername', icon: <FaGithub /> },
            { platform: 'LinkedIn', url: 'https://linkedin.com/in/yourusername', icon: <FaLinkedin /> },
            { platform: 'Twitter', url: 'https://twitter.com/yourusername', icon: <FaTwitter /> },
        ];

    return (
        <footer className="bg-background-lightElevated dark:bg-background-darkElevated text-neutral-900 dark:text-neutral-100 py-10 text-center rounded-t-lg shadow-inner mt-16">
            <div className="container mx-auto px-6">
                <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-8">
                    <a href="/about" className="text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary dark:hover:text-primary-light transition-colors duration-300">About Me</a>
                    <a href="/contact" className="text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary dark:hover:text-primary-light transition-colors duration-300">Contact</a>
                    <a href="/projects" className="text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary dark:hover:text-primary-light transition-colors duration-300">Projects</a>
                    {/* Add other relevant links, e.g., privacy policy, terms of service if applicable */}
                </nav>
                <div className="mb-8">
                    <p className="text-sm text-neutral-900 dark:text-neutral-100">&copy; {currentYear} Jorge E. All rights reserved.</p>
                    <p className="text-xs text-neutral-700 dark:text-neutral-400 mt-2">Built with React, Vite, & Tailwind CSS.</p>
                </div>
                {socialLinksToDisplay.length > 0 && (
                    <nav className="flex justify-center space-x-6">
                        {socialLinksToDisplay.map(link => (
                            <a
                                key={link.platform}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-2xl text-neutral-700 dark:text-neutral-400 hover:text-primary dark:hover:text-primary-light transform hover:scale-110 transition-all duration-300"
                                aria-label={`Link to my ${link.platform} profile`}
                            >
                                {link.icon}
                            </a>
                        ))}
                    </nav>
                )}
            </div>
        </footer>
    );
}
