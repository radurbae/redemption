interface WizardStepProps {
    step: number;
    totalSteps: number;
    title: string;
    description: string;
    children: React.ReactNode;
    onBack?: () => void;
    onNext?: () => void;
    isLastStep?: boolean;
    isSubmitting?: boolean;
    canProceed?: boolean;
}

export default function WizardStep({
    step,
    totalSteps,
    title,
    description,
    children,
    onBack,
    onNext,
    isLastStep = false,
    isSubmitting = false,
    canProceed = true,
}: WizardStepProps) {
    return (
        <div className="w-full max-w-lg mx-auto">
            {/* Progress bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Step {step + 1} of {totalSteps}</span>
                    <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                        style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                        role="progressbar"
                        aria-valuenow={step + 1}
                        aria-valuemin={1}
                        aria-valuemax={totalSteps}
                    />
                </div>
            </div>

            {/* Step content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-600 mb-6">{description}</p>

                <div className="space-y-4">
                    {children}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
                {step > 0 ? (
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        ← Back
                    </button>
                ) : (
                    <div />
                )}

                <button
                    type="button"
                    onClick={onNext}
                    disabled={!canProceed || isSubmitting}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${isLastStep
                            ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                        }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Creating...
                        </span>
                    ) : isLastStep ? (
                        'Create Habit ✨'
                    ) : (
                        'Next →'
                    )}
                </button>
            </div>
        </div>
    );
}
