import { useEffect, useState } from "react";
import { getPublicProfile } from "../../services/profileService";
import { type IProfile, type SkillCategory, type EducationEntry, type WorkExperienceEntry } from "../../types";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaBriefcase, FaGraduationCap, FaCode, FaDownload } from "react-icons/fa"; // Example icons

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
    <div role="alert" className="alert alert-error my-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>Error! {message}</span>
    </div>
);

const SocialIcon = ({ platform }: { platform: string }) => {
    if (platform.toLowerCase().includes("github")) return <FaGithub className="inline mr-2" />;
    if (platform.toLowerCase().includes("linkedin")) return <FaLinkedin className="inline mr-2" />;
    if (platform.toLowerCase().includes("twitter")) return <FaTwitter className="inline mr-2" />;
    return null;
};

export default function AboutPage() {
    const [profile, setProfile] = useState<IProfile | null>(null); const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const profileData = await getPublicProfile();
                setProfile(profileData);

            } catch (err: unknown) {
                console.error("Failed to fetch about page data:", err);
                if (err instanceof Error) {
                    setError(err.message || "Could not load profile information.");
                } else {
                    setError("An unknown error occurred while loading profile information.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!profile) return <ErrorMessage message="Profile data is not available." />;

    const {
        name,
        title,
        biography,
        profilePictureUrl,
        contactEmail,
        skills,
        education,
        workExperience,
        socialLinks
    } = profile;

    return (
        <div className="container mx-auto p-4 lg:p-8 bg-base-100 text-base-content">
            <header className="text-center mb-12 py-8 bg-base-200 rounded-box shadow-xl">
                {profilePictureUrl && (
                    <img
                        src={profilePictureUrl}
                        alt={name || "Profile picture"}
                        className="w-40 h-40 md:w-48 md:h-48 rounded-full mx-auto mb-6 shadow-lg border-4 border-primary"
                    />
                )}
                <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">{name || "My Profile"}</h1>
                <p className="text-xl md:text-2xl text-accent-focus mb-4">{title || "Professional Title"}</p>
                {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="text-lg text-secondary hover:underline">
                        <FaEnvelope className="inline mr-2" /> {contactEmail}
                    </a>
                )}
                {socialLinks && socialLinks.length > 0 && (
                    <div className="mt-4 space-x-4">
                        {socialLinks.map((link) => (
                            <a
                                key={link.platform}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary hover:text-primary text-2xl"
                                aria-label={`Link to my ${link.platform} profile`}
                            >
                                <SocialIcon platform={link.platform} />
                            </a>
                        ))}
                    </div>
                )}
            </header>

            <section id="biography" className="mb-12 p-6 bg-base-200 rounded-box shadow-lg">
                <h2 className="text-3xl font-semibold mb-6 text-primary-focus border-b-2 border-accent pb-2">About Me</h2>
                {biography ? (
                    <div className="prose lg:prose-xl max-w-none text-base-content" dangerouslySetInnerHTML={{ __html: biography }} />
                ) : (
                    <p>Biography information is not available.</p>
                )}
            </section>

            {skills && skills.length > 0 && (
                <section id="skills" className="mb-12 p-6 bg-base-200 rounded-box shadow-lg">
                    <h2 className="text-3xl font-semibold mb-8 text-primary-focus border-b-2 border-accent pb-2"><FaCode className="inline mr-3" />Skills</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {skills.map((skillCat: SkillCategory) => (
                            <div key={skillCat.category} className="p-4 border border-neutral rounded-lg bg-base-100 shadow">
                                <h3 className="text-xl font-bold text-secondary-focus mb-3">{skillCat.category}</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {skillCat.items.map((item: string) => (
                                        <li key={item} className="text-base-content">{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {workExperience && workExperience.length > 0 && (
                <section id="experience" className="mb-12 p-6 bg-base-200 rounded-box shadow-lg">
                    <h2 className="text-3xl font-semibold mb-8 text-primary-focus border-b-2 border-accent pb-2"><FaBriefcase className="inline mr-3" />Work Experience</h2>
                    <div className="space-y-8">
                        {workExperience.map((exp: WorkExperienceEntry) => (
                            <div key={exp._id || exp.company} className="p-4 border-l-4 border-secondary bg-base-100 shadow-md rounded-r-lg">
                                <h3 className="text-2xl font-bold text-secondary-focus">{exp.position}</h3>
                                <p className="text-lg font-medium text-accent">{exp.company}</p>
                                <p className="text-sm text-neutral-content mb-2">
                                    {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Present"}
                                </p>                                {exp.responsibilities && exp.responsibilities.length > 0 && (
                                    <ul className="list-disc list-inside space-y-1 text-sm text-base-content">
                                        {exp.responsibilities.map((resp, index) => <li key={index}>{resp}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {education && education.length > 0 && (
                <section id="education" className="mb-12 p-6 bg-base-200 rounded-box shadow-lg">
                    <h2 className="text-3xl font-semibold mb-8 text-primary-focus border-b-2 border-accent pb-2"><FaGraduationCap className="inline mr-3" />Education</h2>
                    <div className="space-y-8">
                        {education.map((edu: EducationEntry) => (
                            <div key={edu._id || edu.institution} className="p-4 border-l-4 border-secondary bg-base-100 shadow-md rounded-r-lg">
                                <h3 className="text-2xl font-bold text-secondary-focus">{edu.degree}</h3>
                                <p className="text-lg font-medium text-accent">{edu.institution} {edu.fieldOfStudy && ` - ${edu.fieldOfStudy}`}</p>
                                <p className="text-sm text-neutral-content mb-2">
                                    {new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : "Ongoing"}
                                </p>
                                {edu.description && <p className="text-base-content">{edu.description}</p>}
                            </div>
                        ))}
                    </div>
                </section>
            )}            <section id="resume-download" className="text-center py-10">
                {profile?.resumeUrl && (
                    <a
                        href={profile.resumeUrl}
                        download
                        className="btn btn-primary btn-lg"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaDownload className="inline mr-2" /> Download Resume/CV
                    </a>
                )}
                {!profile?.resumeUrl && !isLoading && (
                    <p className="text-neutral-content mt-4">Resume will be available soon.</p>
                )}
            </section>

        </div>
    );
}
