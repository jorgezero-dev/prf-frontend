import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitContactForm } from '../../services/contactService';
import { FaPaperPlane, FaSpinner, FaCheckCircle, FaExclamationCircle, FaUser, FaEnvelope, FaTag } from 'react-icons/fa';

// Zod schema for client-side validation (F-FR2.7)
const contactFormSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }).max(100),
    email: z.string().email({ message: 'Invalid email address.' }).max(100),
    subject: z.string().max(150).optional(),
    message: z.string().min(10, { message: 'Message must be at least 10 characters long.' }).max(2000),
    // captchaToken: z.string().optional(), // Placeholder for CAPTCHA if implemented
});

type ContactFormInputs = z.infer<typeof contactFormSchema>;

interface ServerErrorResponse {
    message?: string;
    errors?: Array<{ path: string; message: string } | string>; // Backend might send structured or simple errors
}

export default function ContactPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ContactFormInputs>({
        resolver: zodResolver(contactFormSchema),
    });

    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [serverError, setServerError] = useState<string | null>(null);

    const onSubmit: SubmitHandler<ContactFormInputs> = async (data) => {
        setSubmissionStatus('idle');
        setServerError(null);
        try {
            const response = await submitContactForm(data);
            setSubmissionStatus('success');
            reset(); // Clear form on success
            // Optionally display response.message if needed
            console.log('Submission successful:', response.message);
        } catch (err: unknown) {
            setSubmissionStatus('error');
            console.error("Contact form submission error:", err);
            let errorMessage = "Could not send message. Please try again."; // Default for 500 or unknown

            if (typeof err === 'object' && err !== null && 'isAxiosError' in err) {
                const axiosError = err as { isAxiosError: boolean; response?: { status: number; data?: ServerErrorResponse } };
                if (axiosError.response) {
                    const { status, data: responseData } = axiosError.response;
                    if (status === 400) {
                        if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
                            // Try to format Zod-like errors from backend
                            const formattedErrors = responseData.errors.map(e =>
                                typeof e === 'string' ? e : `${e.path}: ${e.message}`
                            ).join('; ');
                            errorMessage = `Please check your input: ${formattedErrors}`;
                        } else if (responseData?.message) {
                            errorMessage = responseData.message; // Generic 400 message from backend
                        } else {
                            errorMessage = "There was an issue with your submission. Please check the form and try again.";
                        }
                    } else if (status === 429) {
                        errorMessage = "Too many submissions. Please try again later.";
                    }
                    // Other specific status codes can be handled here
                }
            }
            setServerError(errorMessage);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 py-12 md:py-20 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-3xl">
                <header className="text-center mb-12 md:mb-16">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4 animate-fade-in-down">
                        Get In Touch
                    </h1>
                    <p className="text-lg md:text-xl text-base-content/80 max-w-xl mx-auto animate-fade-in-up delay-200">
                        Have a question, a project proposal, or just want to say hi? Fill out the form below and I'll get back to you as soon as possible.
                    </p>
                </header>

                <div className="card bg-base-100 shadow-2xl border border-base-300/30 rounded-xl transition-all duration-300 hover:shadow-primary/20 hover:border-primary/50">
                    <div className="card-body p-8 md:p-12">
                        {submissionStatus === 'success' && (
                            <div role="alert" className="alert alert-success mb-8 shadow-lg rounded-lg">
                                <FaCheckCircle className="h-6 w-6" />
                                <span className="font-medium">Your message has been sent successfully! I'll get back to you soon.</span>
                            </div>
                        )}
                        {submissionStatus === 'error' && serverError && (
                            <div role="alert" className="alert alert-error mb-8 shadow-lg rounded-lg">
                                <FaExclamationCircle className="h-6 w-6" />
                                <span className="font-medium">{serverError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
                            <div>
                                <label htmlFor="name" className="label">
                                    <span className="label-text text-base font-semibold text-base-content/90">Full Name</span>
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 pl-4 pointer-events-none text-base-content/50 group-focus-within:text-primary transition-colors duration-300">
                                        <FaUser className="h-5 w-5" />
                                    </span>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="e.g., Jane Doe"
                                        className={`input input-bordered w-full pl-12 pr-4 py-3 text-base rounded-lg focus:ring-2 focus:ring-primary/70 focus:border-primary transition-all duration-300 ease-in-out shadow-sm hover:shadow-md ${errors.name ? 'input-error border-error/50 focus:ring-error/70' : 'border-base-300/50 focus:border-primary'}`}
                                        {...register('name')}
                                    />
                                </div>
                                {errors.name && <span className="text-error text-sm mt-2.5 flex items-center"><FaExclamationCircle className="w-4 h-4 mr-1.5 shrink-0" />{errors.name.message}</span>}
                            </div>

                            <div>
                                <label htmlFor="email" className="label">
                                    <span className="label-text text-base font-semibold text-base-content/90">Email Address</span>
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 pl-4 pointer-events-none text-base-content/50 group-focus-within:text-primary transition-colors duration-300">
                                        <FaEnvelope className="h-5 w-5" />
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        className={`input input-bordered w-full pl-12 pr-4 py-3 text-base rounded-lg focus:ring-2 focus:ring-primary/70 focus:border-primary transition-all duration-300 ease-in-out shadow-sm hover:shadow-md ${errors.email ? 'input-error border-error/50 focus:ring-error/70' : 'border-base-300/50 focus:border-primary'}`}
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && <span className="text-error text-sm mt-2.5 flex items-center"><FaExclamationCircle className="w-4 h-4 mr-1.5 shrink-0" />{errors.email.message}</span>}
                            </div>

                            <div>
                                <label htmlFor="subject" className="label">
                                    <span className="label-text text-base font-semibold text-base-content/90">Subject <span className="text-xs text-base-content/60 font-normal">(Optional)</span></span>
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 pl-4 pointer-events-none text-base-content/50 group-focus-within:text-primary transition-colors duration-300">
                                        <FaTag className="h-5 w-5" />
                                    </span>
                                    <input
                                        id="subject"
                                        type="text"
                                        placeholder="e.g., Project Inquiry, Collaboration"
                                        className={`input input-bordered w-full pl-12 pr-4 py-3 text-base rounded-lg focus:ring-2 focus:ring-primary/70 focus:border-primary transition-all duration-300 ease-in-out shadow-sm hover:shadow-md ${errors.subject ? 'input-error border-error/50 focus:ring-error/70' : 'border-base-300/50 focus:border-primary'}`}
                                        {...register('subject')}
                                    />
                                </div>
                                {errors.subject && <span className="text-error text-sm mt-2.5 flex items-center"><FaExclamationCircle className="w-4 h-4 mr-1.5 shrink-0" />{errors.subject.message}</span>}
                            </div>

                            <div>
                                <label htmlFor="message" className="label">
                                    <span className="label-text text-base font-semibold text-base-content/90">Message</span>
                                </label>
                                <textarea
                                    id="message"
                                    placeholder="Please describe your inquiry in detail..."
                                    className={`textarea textarea-bordered w-full h-48 pl-4 pr-4 py-3 text-base rounded-lg focus:ring-2 focus:ring-primary/70 focus:border-primary transition-all duration-300 ease-in-out shadow-sm hover:shadow-md ${errors.message ? 'textarea-error border-error/50 focus:ring-error/70' : 'border-base-300/50 focus:border-primary'}`}
                                    {...register('message')}
                                    rows={7}
                                />
                                {errors.message && <span className="text-error text-sm mt-2.5 flex items-center"><FaExclamationCircle className="w-4 h-4 mr-1.5 shrink-0" />{errors.message.message}</span>}
                            </div>

                            <div className="card-actions justify-end pt-6">
                                <button
                                    type="submit"
                                    className=" bg-center btn btn-primary btn-lg w-full md:w-auto min-w-[200px] transform hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out shadow-lg hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/70 disabled:opacity-70 disabled:bg-base-300 disabled:shadow-none flex items-center justify-center"
                                    disabled={isSubmitting || submissionStatus === 'success'}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" /> {/* Adjusted margin */}
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <FaPaperPlane className="mr-2" /> {/* Adjusted margin */}
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <footer className="text-center mt-16 text-base-content/70">
                    <p>Alternatively, you can reach me via <a href="/contact" className="link link-hover link-primary">jorge.zegarra.dev@gmail.com</a> or connect on LinkedIn.</p>
                    <p className="mt-2 text-sm">&copy; {new Date().getFullYear()} Jorge E. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
