import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch' // Corrected path to index
import { useAppSelector } from '../../hooks/useAppSelector'; // Corrected path to index
import {
    fetchSubmissions,
    markSubmissionAsRead,
    deleteSubmission,
    setCurrentSubmission,
    clearContactAdminError,
    clearContactAdminMessage,
} from '../../store/features/contact/contactSlice';
import type { IContactSubmission } from '../../types';
import type { RootState } from '../../store/store'; // For typing state in useAppSelector
import { FiEye, FiTrash2, FiCheckCircle, FiCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import type { Action, UnknownAction } from '@reduxjs/toolkit'; // For typing the action in .then()

const ContactSubmissionsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        submissions,
        isLoading,
        error,
        message,
        currentPage,
        totalPages,
        currentSubmission,
    } = useAppSelector((state: RootState) => state.contactAdmin);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        dispatch(fetchSubmissions({ page: currentPage, limit: 10 }));
    }, [dispatch, currentPage]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearContactAdminError());
        }
        if (message) {
            toast.success(message);
            dispatch(clearContactAdminMessage());
        }
    }, [error, message, dispatch]);

    const handleToggleReadStatus = (id: string, isRead: boolean) => {
        dispatch(markSubmissionAsRead({ id, isRead: !isRead }))
            .then((action: Action) => {
                if (markSubmissionAsRead.fulfilled.match(action as UnknownAction)) {
                    // Refetch submissions for the current page to update the UI
                    dispatch(fetchSubmissions({ page: currentPage, limit: 10 }));
                    // Optionally, you can add a toast message here if the slice doesn't set one
                    // toast.success(`Submission marked as ${!isRead ? 'Read' : 'Unread'}.`);
                } else if (markSubmissionAsRead.rejected.match(action as UnknownAction)) {
                    // Optionally, handle specific error toast for this action if not covered by global error handling
                    // toast.error("Failed to update submission status.");
                }
            });
    };

    const handleDeleteClick = (id: string) => {
        setSubmissionToDelete(id);
        setShowConfirmModal(true);
    };

    const confirmDelete = () => {
        if (submissionToDelete) {
            dispatch(deleteSubmission(submissionToDelete)).then((action: Action) => {
                if (deleteSubmission.fulfilled.match(action as UnknownAction)) {
                    // Fetch submissions for the current page if it's still valid
                    // The slice already handles the logic for adjusting currentPage if needed
                    dispatch(fetchSubmissions({ page: currentPage, limit: 10 }));
                }
            });
        }
        setShowConfirmModal(false);
        setSubmissionToDelete(null);
    };

    const handleViewDetails = (submission: IContactSubmission) => {
        dispatch(setCurrentSubmission(submission));
        setShowDetailModal(true);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage !== currentPage) {
            dispatch(fetchSubmissions({ page: newPage, limit: 10 }));
        }
    };

    if (isLoading && submissions.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="ml-4 text-xl">Loading submissions...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 bg-base-100 min-h-screen">
            <h1 className="text-4xl font-bold mb-8 text-center text-primary">Contact Submissions</h1>

            <div className="overflow-x-auto shadow-2xl rounded-xl bg-base-200">
                <table className="table w-full table-zebra">
                    <thead className="bg-neutral text-neutral-content">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">Name</th>
                            <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">Email</th>
                            <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">Subject</th>
                            <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider">Received At</th>
                            <th className="p-4 text-center text-sm font-semibold uppercase tracking-wider">Status</th>
                            <th className="p-4 text-center text-sm font-semibold uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map((submission: IContactSubmission) => (
                            <tr key={submission._id} className="hover:bg-base-300 transition-colors duration-150">
                                <td className="p-4 align-middle">{submission.name}</td>
                                <td className="p-4 align-middle">{submission.email}</td>
                                <td className="p-4 align-middle truncate max-w-sm">{submission.subject || 'N/A'}</td>
                                <td className="p-4 align-middle whitespace-nowrap">{new Date(submission.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 text-center align-middle">
                                    <button
                                        onClick={() => handleToggleReadStatus(submission._id, submission.isRead)}
                                        className={`btn btn-sm transition-colors duration-200 ease-in-out ${submission.isRead
                                            ? 'btn-ghost text-success hover:bg-success hover:text-success-content focus:ring-2 focus:ring-success/50'
                                            : 'btn-warning hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-500/50'
                                            }`}
                                        aria-label={submission.isRead ? 'Mark as Unread' : 'Mark as Read'}
                                    >
                                        {submission.isRead ? <FiCheckCircle size={18} className="mr-1.5" /> : <FiCircle size={18} className="mr-1.5" />}
                                        {submission.isRead ? 'Read' : 'Unread'}
                                    </button>
                                </td>
                                <td className="p-4 text-center align-middle space-x-2">
                                    <button
                                        onClick={() => handleViewDetails(submission)}
                                        className="btn btn-sm btn-outline btn-info hover:bg-info hover:text-info-content hover:scale-105 transform transition-all duration-150 ease-in-out"
                                        aria-label="View Details"
                                    >
                                        <FiEye size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(submission._id)}
                                        className="btn btn-sm btn-outline btn-error hover:bg-error hover:text-error-content hover:scale-105 transform transition-all duration-150 ease-in-out"
                                        aria-label="Delete Submission"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {submissions.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-xl text-base-content/70">
                                    <div className="flex flex-col items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-base-content/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        No submissions found.
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="join mt-8 flex justify-center shadow-md rounded-lg">
                    <button
                        className="join-item btn btn-md bg-base-200 hover:bg-base-300"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        «
                    </button>
                    {[...Array(totalPages).keys()].map((p) => (
                        <button
                            key={p + 1}
                            className={`join-item btn btn-md ${currentPage === p + 1 ? 'btn-active btn-primary' : ''}`}
                            onClick={() => handlePageChange(p + 1)}
                        >
                            {p + 1}
                        </button>
                    ))}
                    <button
                        className="join-item btn btn-md bg-base-200 hover:bg-base-300"
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        »
                    </button>
                </div>
            )}

            {showDetailModal && currentSubmission && (
                <div className="modal modal-open modal-bottom sm:modal-middle animate-fade-in-up">
                    <div className="modal-box w-11/12 max-w-2xl bg-base-200 shadow-xl rounded-lg">
                        <h3 className="font-bold text-2xl mb-6 text-primary">Submission Details</h3>
                        <div className="space-y-3">
                            <p><strong>Name:</strong> <span className="text-base-content/90">{currentSubmission.name}</span></p>
                            <p><strong>Email:</strong> <a href={`mailto:${currentSubmission.email}`} className="text-info hover:underline">{currentSubmission.email}</a></p>
                            <p><strong>Subject:</strong> <span className="text-base-content/90">{currentSubmission.subject || 'N/A'}</span></p>
                            <p className="mt-3"><strong>Message:</strong></p>
                            <div className="p-4 bg-base-300 rounded-lg whitespace-pre-wrap max-h-72 overflow-y-auto text-base-content/80 leading-relaxed">
                                {currentSubmission.message}
                            </div>
                            <p className="mt-3 text-sm text-base-content/60"><strong>Received:</strong> {new Date(currentSubmission.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="modal-action mt-8">
                            <button onClick={() => { setShowDetailModal(false); dispatch(setCurrentSubmission(null)); }} className="btn btn-primary">Close</button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => { setShowDetailModal(false); dispatch(setCurrentSubmission(null)); }}>close</button>
                    </form>
                </div>
            )}

            {showConfirmModal && (
                <div className="modal modal-open modal-bottom sm:modal-middle animate-fade-in-up">
                    <div className="modal-box bg-base-200 shadow-xl rounded-lg">
                        <h3 className="font-bold text-xl text-error mb-4">Confirm Deletion</h3>
                        <p className="py-4 text-base-content/80">Are you sure you want to delete this submission? This action cannot be undone.</p>
                        <div className="modal-action mt-6">
                            <button onClick={() => setShowConfirmModal(false)} className="btn btn-ghost mr-2">Cancel</button>
                            <button onClick={confirmDelete} className="btn btn-error">Delete</button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setShowConfirmModal(false)}>close</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ContactSubmissionsPage;
