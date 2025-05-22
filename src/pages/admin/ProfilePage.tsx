import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store/store'; // Correct type-only import
import {
    fetchAdminProfile,
    upsertAdminProfile,
    selectAdminProfileData,
    selectIsAdminProfileLoading,
    selectIsAdminProfileSaving,
    selectAdminProfileFetchError,
    selectAdminProfileSaveError,
    clearProfileMessages,
} from '../../store/features/profile/profileSlice';
import type { IProfileAdmin, SkillCategory } from '../../types'; // Updated imports
import { STATIC_FILES_BASE_URL } from "../../services/api"; // Importar STATIC_FILES_BASE_URL

// Helper components for form elements (could be moved to a common components folder)
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}
const InputField: React.FC<InputProps> = ({ label, id, error, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            id={id}
            {...props}
            className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}
const TextareaField: React.FC<TextareaProps> = ({ label, id, error, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <textarea
            id={id}
            {...props}
            rows={4}
            className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

const ProfilePage: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const profileData = useSelector(selectAdminProfileData);
    const isLoading = useSelector(selectIsAdminProfileLoading);
    const isSaving = useSelector(selectIsAdminProfileSaving);
    const fetchError = useSelector(selectAdminProfileFetchError);
    const saveError = useSelector(selectAdminProfileSaveError);

    const [formData, setFormData] = useState<Partial<IProfileAdmin>>({
        biography: '',
        profilePictureUrl: '',
        contactEmail: '',
        skills: [],
        name: '',
        title: '',
        education: [],
        workExperience: [],
        socialLinks: [],
        resumeUrl: '',
    });
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

    // State for managing skill items input as a comma-separated string
    const [skillItemStrings, setSkillItemStrings] = useState<Record<number, string>>({});

    useEffect(() => {
        dispatch(fetchAdminProfile());
        return () => {
            dispatch(clearProfileMessages());
        };
    }, [dispatch]);

    useEffect(() => {
        if (profileData) {
            const resumeUrlValue = profileData.resumeUrl
                ? `${STATIC_FILES_BASE_URL}${profileData.resumeUrl.startsWith('/') ? '' : '/'}${profileData.resumeUrl}`
                : '';
            setFormData({
                name: profileData.name || '',
                title: profileData.title || '',
                biography: profileData.biography || '',
                profilePictureUrl: profileData.profilePictureUrl || '',
                contactEmail: profileData.contactEmail || '',
                skills: profileData.skills ? JSON.parse(JSON.stringify(profileData.skills)) : [],
                education: profileData.education ? JSON.parse(JSON.stringify(profileData.education)) : [],
                workExperience: profileData.workExperience ? JSON.parse(JSON.stringify(profileData.workExperience)) : [],
                socialLinks: profileData.socialLinks ? JSON.parse(JSON.stringify(profileData.socialLinks)) : [],
                resumeUrl: resumeUrlValue,
            });
            // Initialize skillItemStrings from profile data
            const initialSkillStrings: Record<number, string> = {};
            profileData.skills?.forEach((category, catIndex) => {
                initialSkillStrings[catIndex] = category.items.join(', ');
            });
            setSkillItemStrings(initialSkillStrings);
        } else if (!isLoading && fetchError) {
            setFormData({
                name: '',
                title: '',
                biography: '',
                profilePictureUrl: '',
                contactEmail: '',
                skills: [],
                education: [],
                workExperience: [],
                socialLinks: [],
                resumeUrl: '',
            });
            setSkillItemStrings({}); // Reset for new profile
        }
    }, [profileData, isLoading, fetchError]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (saveSuccess) setSaveSuccess(false);
        if (saveError) dispatch(clearProfileMessages());
    };

    // --- Skill Management ---
    const handleSkillCategoryChange = useCallback((catIndex: number, field: 'category', value: string) => {
        setFormData(prev => {
            const updatedSkills = JSON.parse(JSON.stringify(prev.skills || [])) as SkillCategory[];
            if (updatedSkills[catIndex]) {
                updatedSkills[catIndex][field] = value;
            }
            return { ...prev, skills: updatedSkills };
        });
    }, []);

    // Updated to handle comma-separated string input for skill items
    const handleSkillItemsStringChange = useCallback((catIndex: number, value: string) => {
        setSkillItemStrings(prev => ({ ...prev, [catIndex]: value }));
        // Update formData.skills[catIndex].items based on the parsed string
        setFormData(prev => {
            const updatedSkills = JSON.parse(JSON.stringify(prev.skills || [])) as SkillCategory[];
            if (updatedSkills[catIndex]) {
                updatedSkills[catIndex].items = value.split(',').map(s => s.trim()).filter(s => s);
            }
            return { ...prev, skills: updatedSkills };
        });
    }, []);

    const addSkillCategory = useCallback(() => {
        const newCatIndex = formData.skills?.length || 0;
        setFormData(prev => ({
            ...prev,
            skills: [...(prev.skills || []), { category: '', items: [] }], // Start with empty items array
        }));
        // Initialize the string for the new category
        setSkillItemStrings(prev => ({ ...prev, [newCatIndex]: '' }));
    }, [formData.skills]);

    const removeSkillCategory = useCallback((catIndex: number) => {
        setFormData(prev => ({
            ...prev,
            skills: (prev.skills || []).filter((_, index) => index !== catIndex),
        }));
        // Remove the corresponding string entry
        setSkillItemStrings(prev => {
            const newStrings = { ...prev };
            delete newStrings[catIndex];
            // Adjust keys if categories are re-indexed, though simple deletion might be fine if keys are stable
            return newStrings;
        });
    }, []);

    // addSkillItem and removeSkillItem are no longer needed as items are managed via the string input
    // --- End Skill Management ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveSuccess(false);
        dispatch(clearProfileMessages());

        // Basic client-side validation for required fields can be checked here
        // For more complex validation, consider react-hook-form or Zod
        if (!formData.name || !formData.contactEmail || !formData.biography) {
            // Instead of dispatching a rejected action, set a local error or rely on HTML5 validation
            // For now, we'll let the `required` attributes on inputs handle this.
            // If an API call is made with invalid data, the backend should ideally reject it,
            // and that error will be caught by the thunk.
            console.error("Validation Error: Name, Contact Email and Biography are required.");
            // Optionally, set a local state to display this error message in the UI
            // For example: setFormValidationError("Name, Contact Email and Biography are required.");
            return;
        }        // Clean up data before submitting
        const profileToSave: Partial<IProfileAdmin> = {
            ...formData,
            // Filter out empty skill items and categories
            skills: formData.skills?.map(cat => ({
                ...cat,
                items: cat.items.filter(item => item.trim() !== '')
            })).filter(cat => cat.category.trim() !== '' && cat.items.length > 0),

            // Filter out incomplete education entries
            education: formData.education?.filter(edu => edu.institution.trim() !== '' &&
                edu.degree.trim() !== '' &&
                edu.fieldOfStudy.trim() !== '' &&
                edu.startDate.trim() !== ''),

            // Filter out incomplete work experience entries and empty responsibilities
            workExperience: formData.workExperience?.map(exp => ({
                ...exp,
                responsibilities: exp.responsibilities.filter(resp => resp.trim() !== '')
            })).filter(exp => exp.company.trim() !== '' &&
                exp.position.trim() !== '' &&
                exp.startDate.trim() !== '' &&
                exp.responsibilities.length > 0),

            // Keep resumeUrl if it exists
            resumeUrl: formData.resumeUrl?.trim() || undefined
        };


        const resultAction = await dispatch(upsertAdminProfile(profileToSave));
        if (upsertAdminProfile.fulfilled.match(resultAction)) {
            setSaveSuccess(true);
            // Optionally, scroll to top or show a more persistent success message
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-gray-600">Loading profile...</p>
                {/* Add a spinner here */}
            </div>
        );
    }

    // If there was a fetch error AND profile is still null (meaning it wasn't just a background refresh error)
    // Allow form to be used for creation.
    const pageTitle = profileData?._id ? "Edit Profile" : "Create Profile";

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">{pageTitle}</h1>

            {fetchError && !profileData && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                    <p className="font-bold">Profile Not Found</p>
                    <p>Could not load existing profile data: {fetchError}. You can use this form to create a new profile.</p>
                </div>
            )}
            {fetchError && profileData && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                    <p>Warning: Could not refresh profile data ({fetchError}). Displaying last known data.</p>
                </div>
            )}
            {saveError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p className="font-bold">Save Error</p>
                    <p>{saveError}</p>
                </div>
            )}
            {saveSuccess && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
                    <p className="font-bold">Success!</p>
                    <p>Your profile has been saved successfully.</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow-md rounded-lg">
                <InputField
                    label="Full Name"
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                />
                <InputField
                    label="Title / Headline"
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g., Senior Web Developer"
                    value={formData.title || ''}
                    onChange={handleChange}
                />
                <InputField
                    label="Contact Email"
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={handleChange}
                    required
                />
                <InputField
                    label="Profile Picture URL"
                    id="profilePictureUrl"
                    name="profilePictureUrl"
                    type="url"
                    placeholder="https://example.com/image.png"
                    value={formData.profilePictureUrl || ''}
                    onChange={handleChange}
                />                <TextareaField
                    label="Biography"
                    id="biography"
                    name="biography"
                    value={formData.biography || ''}
                    onChange={handleChange}
                    placeholder="Tell us about yourself. Markdown might be supported by your display component."
                    required
                />

                <InputField
                    label="Resume URL"
                    id="resumeUrl"
                    name="resumeUrl"
                    type="url"
                    placeholder="https://example.com/your-resume.pdf"
                    value={formData.resumeUrl || ''}
                    onChange={handleChange}
                />

                {/* Skills Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700">Skills</h3>
                    {formData.skills?.map((category, catIndex) => (
                        <div key={`skill-category-${catIndex}`} className="p-4 border border-gray-200 rounded-md space-y-3">
                            <div className="flex items-center gap-x-3 mb-2">
                                <div className="flex-grow">
                                    <InputField
                                        label="Skill Category"
                                        id={`skill-category-name-${catIndex}`}
                                        type="text"
                                        placeholder="e.g., Frontend, Backend"
                                        value={category.category}
                                        onChange={(e) => handleSkillCategoryChange(catIndex, 'category', e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeSkillCategory(catIndex)}
                                    className="self-end mb-1 px-3 py-2 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                                >
                                    Remove Category
                                </button>
                            </div>
                            {/* Input for comma-separated skill items */}
                            <InputField
                                label="Skills (comma-separated)"
                                id={`skill-items-string-${catIndex}`}
                                type="text"
                                placeholder="e.g., React, Node.js, TypeScript"
                                value={skillItemStrings[catIndex] || ''}
                                onChange={(e) => handleSkillItemsStringChange(catIndex, e.target.value)}
                            // No direct 'required' here as validation is on the parsed array in handleSubmit
                            />
                            {/* Remove individual skill item buttons and add skill item button as items are managed by string */}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addSkillCategory}
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Add Skill Category
                    </button>
                </div>
                {/* End Skills Section */}                {/* Education Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700">Education</h3>
                    {formData.education?.map((edu, eduIndex) => (
                        <div key={`education-${eduIndex}`} className="p-4 border border-gray-200 rounded-md space-y-3">
                            <div className="flex items-center gap-x-3 mb-2">
                                <div className="flex-grow">
                                    <InputField
                                        label="Institution"
                                        id={`edu-institution-${eduIndex}`}
                                        type="text"
                                        placeholder="e.g., Harvard University"
                                        value={edu.institution}
                                        onChange={(e) => {
                                            const updatedEducation = [...(formData.education || [])];
                                            updatedEducation[eduIndex] = { ...edu, institution: e.target.value };
                                            setFormData({ ...formData, education: updatedEducation });
                                        }}
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updatedEducation = (formData.education || []).filter((_, idx) => idx !== eduIndex);
                                        setFormData({ ...formData, education: updatedEducation });
                                    }}
                                    className="self-end mb-1 px-3 py-2 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                                >
                                    Remove Education
                                </button>
                            </div>

                            <InputField
                                label="Degree"
                                id={`edu-degree-${eduIndex}`}
                                type="text"
                                placeholder="e.g., Bachelor of Science"
                                value={edu.degree}
                                onChange={(e) => {
                                    const updatedEducation = [...(formData.education || [])];
                                    updatedEducation[eduIndex] = { ...edu, degree: e.target.value };
                                    setFormData({ ...formData, education: updatedEducation });
                                }}
                                required
                            />

                            <InputField
                                label="Field of Study"
                                id={`edu-fieldOfStudy-${eduIndex}`}
                                type="text"
                                placeholder="e.g., Computer Science"
                                value={edu.fieldOfStudy}
                                onChange={(e) => {
                                    const updatedEducation = [...(formData.education || [])];
                                    updatedEducation[eduIndex] = { ...edu, fieldOfStudy: e.target.value };
                                    setFormData({ ...formData, education: updatedEducation });
                                }}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Start Date"
                                    id={`edu-startDate-${eduIndex}`}
                                    type="date"
                                    placeholder="e.g., 2020-09"
                                    value={edu.startDate}
                                    onChange={(e) => {
                                        const updatedEducation = [...(formData.education || [])];
                                        updatedEducation[eduIndex] = { ...edu, startDate: e.target.value };
                                        setFormData({ ...formData, education: updatedEducation });
                                    }}
                                    required
                                />

                                <InputField
                                    label="End Date (leave blank if ongoing)"
                                    id={`edu-endDate-${eduIndex}`}
                                    type="date"
                                    placeholder="e.g., 2024-05"
                                    value={edu.endDate || ''}
                                    onChange={(e) => {
                                        const updatedEducation = [...(formData.education || [])];
                                        updatedEducation[eduIndex] = { ...edu, endDate: e.target.value || undefined };
                                        setFormData({ ...formData, education: updatedEducation });
                                    }}
                                />
                            </div>

                            <TextareaField
                                label="Description (optional)"
                                id={`edu-description-${eduIndex}`}
                                placeholder="Enter any additional details about your education"
                                value={edu.description || ''}
                                onChange={(e) => {
                                    const updatedEducation = [...(formData.education || [])];
                                    updatedEducation[eduIndex] = { ...edu, description: e.target.value || undefined };
                                    setFormData({ ...formData, education: updatedEducation });
                                }}
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            const newEducation = {
                                institution: '',
                                degree: '',
                                fieldOfStudy: '',
                                startDate: '',
                            };
                            setFormData({
                                ...formData,
                                education: [...(formData.education || []), newEducation]
                            });
                        }}
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Add Education Entry
                    </button>
                </div>
                {/* End Education Section */}

                {/* Work Experience Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700">Work Experience</h3>
                    {formData.workExperience?.map((exp, expIndex) => (
                        <div key={`work-exp-${expIndex}`} className="p-4 border border-gray-200 rounded-md space-y-3">
                            <div className="flex items-center gap-x-3 mb-2">
                                <div className="flex-grow">
                                    <InputField
                                        label="Company"
                                        id={`work-company-${expIndex}`}
                                        type="text"
                                        placeholder="e.g., Google Inc."
                                        value={exp.company}
                                        onChange={(e) => {
                                            const updatedExperience = [...(formData.workExperience || [])];
                                            updatedExperience[expIndex] = { ...exp, company: e.target.value };
                                            setFormData({ ...formData, workExperience: updatedExperience });
                                        }}
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updatedExperience = (formData.workExperience || []).filter((_, idx) => idx !== expIndex);
                                        setFormData({ ...formData, workExperience: updatedExperience });
                                    }}
                                    className="self-end mb-1 px-3 py-2 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                                >
                                    Remove Experience
                                </button>
                            </div>

                            <InputField
                                label="Position"
                                id={`work-position-${expIndex}`}
                                type="text"
                                placeholder="e.g., Senior Developer"
                                value={exp.position}
                                onChange={(e) => {
                                    const updatedExperience = [...(formData.workExperience || [])];
                                    updatedExperience[expIndex] = { ...exp, position: e.target.value };
                                    setFormData({ ...formData, workExperience: updatedExperience });
                                }}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Start Date"
                                    id={`work-startDate-${expIndex}`}
                                    type="date"
                                    placeholder="e.g., 2021-06"
                                    value={exp.startDate}
                                    onChange={(e) => {
                                        const updatedExperience = [...(formData.workExperience || [])];
                                        updatedExperience[expIndex] = { ...exp, startDate: e.target.value };
                                        setFormData({ ...formData, workExperience: updatedExperience });
                                    }}
                                    required
                                />

                                <InputField
                                    label="End Date (leave blank if current)"
                                    id={`work-endDate-${expIndex}`}
                                    type="date"
                                    placeholder="e.g., 2023-12"
                                    value={exp.endDate || ''}
                                    onChange={(e) => {
                                        const updatedExperience = [...(formData.workExperience || [])];
                                        updatedExperience[expIndex] = { ...exp, endDate: e.target.value || undefined };
                                        setFormData({ ...formData, workExperience: updatedExperience });
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Responsibilities
                                </label>

                                {exp.responsibilities && exp.responsibilities.map((resp, respIndex) => (
                                    <div key={`resp-${expIndex}-${respIndex}`} className="flex items-center gap-x-2">
                                        <input
                                            type="text"
                                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder={`Responsibility #${respIndex + 1}`}
                                            value={resp}
                                            onChange={(e) => {
                                                const updatedExperience = [...(formData.workExperience || [])];
                                                const updatedResponsibilities = [...exp.responsibilities];
                                                updatedResponsibilities[respIndex] = e.target.value;
                                                updatedExperience[expIndex] = { ...exp, responsibilities: updatedResponsibilities };
                                                setFormData({ ...formData, workExperience: updatedExperience });
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updatedExperience = [...(formData.workExperience || [])];
                                                const updatedResponsibilities = exp.responsibilities.filter((_, idx) => idx !== respIndex);
                                                updatedExperience[expIndex] = { ...exp, responsibilities: updatedResponsibilities };
                                                setFormData({ ...formData, workExperience: updatedExperience });
                                            }}
                                            className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => {
                                        const updatedExperience = [...(formData.workExperience || [])];
                                        const updatedResponsibilities = [...(exp.responsibilities || []), ''];
                                        updatedExperience[expIndex] = { ...exp, responsibilities: updatedResponsibilities };
                                        setFormData({ ...formData, workExperience: updatedExperience });
                                    }}
                                    className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                                >
                                    Add Responsibility
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            const newExperience = {
                                company: '',
                                position: '',
                                startDate: '',
                                responsibilities: ['']
                            };
                            setFormData({
                                ...formData,
                                workExperience: [...(formData.workExperience || []), newExperience]
                            });
                        }}
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Add Work Experience
                    </button>
                </div>
                {/* End Work Experience Section */}

                <div className="pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={isSaving || isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : (profileData?._id ? 'Update Profile' : 'Create Profile')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
