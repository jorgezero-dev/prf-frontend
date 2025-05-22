import React, { useState, useCallback } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector"; // Corrected import
import {
    uploadResume,
    selectIsAdminProfileSaving,
    selectAdminProfileSaveError,
    selectAdminProfileData,
} from "../../store/features/profile/profileSlice"; // Removed Button, Input, Alert imports
import { STATIC_FILES_BASE_URL } from "../../services/api"; // Importar STATIC_FILES_BASE_URL

export default function ResumePage() {
    const dispatch = useAppDispatch();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const isSaving = useAppSelector(selectIsAdminProfileSaving);
    const saveError = useAppSelector(selectAdminProfileSaveError);
    const profileData = useAppSelector(selectAdminProfileData);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setUploadMessage(null);
            setUploadError(null);
        }
    };

    const handleUpload = useCallback(async () => {
        if (!selectedFile) {
            setUploadError("Please select a file to upload.");
            return;
        }
        setUploadMessage(null);
        setUploadError(null);

        try {
            const resultAction = await dispatch(uploadResume(selectedFile));
            if (uploadResume.fulfilled.match(resultAction)) {
                setUploadMessage('Resume uploaded successfully! New URL: ' + resultAction.payload);
                setSelectedFile(null); // Clear the file input after successful upload
            } else {
                if (resultAction.payload) {
                    setUploadError(resultAction.payload as string);
                } else {
                    setUploadError("Failed to upload resume. Please try again.");
                }
            }
        } catch (err) { // Changed err: any to err
            // It's better to check the type of err if possible, or handle it as unknown
            if (err instanceof Error) {
                setUploadError(err.message);
            } else if (typeof err === 'string') {
                setUploadError(err);
            } else {
                setUploadError("An unexpected error occurred.");
            }
        }
    }, [dispatch, selectedFile]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Manage Resume</h1>

            <div className="mb-6 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Upload New Resume</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Upload your resume in PDF format. The new resume will replace the
                    current one.
                </p>
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="resumeFile"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Resume File (PDF only)
                        </label>
                        {/* Replaced Input with standard HTML input */}
                        <input
                            id="resumeFile"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="max-w-md block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-2.5"
                        />
                    </div>
                    {selectedFile && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Selected file: {selectedFile.name}
                        </p>
                    )}
                    {/* Replaced Button with standard HTML button */}
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
                    >
                        {isSaving ? "Uploading..." : "Upload Resume"}
                    </button>
                </div>
                {uploadMessage && (
                    // Replaced Alert with styled div
                    <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md dark:bg-green-900 dark:border-green-700 dark:text-green-300" role="alert">
                        <strong className="font-bold">Success!</strong>
                        <span className="block sm:inline"> {uploadMessage}</span>
                    </div>
                )}
                {uploadError && (
                    // Replaced Alert with styled div
                    <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md dark:bg-red-900 dark:border-red-700 dark:text-red-300" role="alert">
                        <strong className="font-bold">Upload Error!</strong>
                        <span className="block sm:inline"> {uploadError}</span>
                    </div>
                )}
                {saveError && !uploadError && ( // Display general save error if not specific to upload
                    // Replaced Alert with styled div
                    <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md dark:bg-red-900 dark:border-red-700 dark:text-red-300" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {saveError}</span>
                    </div>
                )}
            </div>

            {profileData?.resumeUrl && (
                <div className="mb-6 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Current Resume</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your current resume is available at:{" "}
                        <a
                            href={`${STATIC_FILES_BASE_URL}${profileData.resumeUrl.startsWith('/') ? '' : '/'}${profileData.resumeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                            {profileData.resumeUrl}
                        </a>
                    </p>
                    {/* Replaced Button with standard HTML button */}
                    <button
                        className="mt-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                        onClick={() => {
                            if (profileData?.resumeUrl) {
                                const fullResumeUrl = `${STATIC_FILES_BASE_URL}${profileData.resumeUrl.startsWith('/') ? '' : '/'}${profileData.resumeUrl}`;
                                window.open(fullResumeUrl, "_blank");
                            }
                        }}
                    >
                        View Current Resume
                    </button>
                </div>
            )}
        </div>
    );
}
