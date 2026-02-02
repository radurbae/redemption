'use client';

import { useState, useTransition } from 'react';
import type { Habit, HabitFormData, HabitTemplate } from '@/lib/types';
import { createHabit, updateHabit } from '@/lib/actions/habits';
import WizardStep from './WizardStep';

const HABIT_TEMPLATES: HabitTemplate[] = [
    {
        title: 'Reading',
        identity: 'I am a reader',
        obvious_cue: 'Keep a book on my pillow',
        attractive_bundle: 'After my morning coffee, I read 2 pages',
        easy_step: 'Read just 2 pages',
        satisfying_reward: 'Track my reading streak in the app',
        schedule: 'daily',
    },
    {
        title: 'Exercise',
        identity: 'I am an athlete',
        obvious_cue: 'Keep workout clothes next to my bed',
        attractive_bundle: 'While listening to my favorite podcast, I exercise',
        easy_step: 'Put on my workout clothes',
        satisfying_reward: 'Feel energized and proud of myself',
        schedule: 'weekdays',
    },
    {
        title: 'Study',
        identity: 'I am a lifelong learner',
        obvious_cue: 'Open my study materials at my desk each evening',
        attractive_bundle: 'After dinner, I study for a few minutes',
        easy_step: 'Open my notes and read one paragraph',
        satisfying_reward: 'Cross off the study session in my tracker',
        schedule: 'daily',
    },
];

interface HabitFormProps {
    habit?: Habit;
    mode: 'create' | 'edit';
}

export default function HabitForm({ habit, mode }: HabitFormProps) {
    const [step, setStep] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState<HabitFormData>({
        title: habit?.title || '',
        identity: habit?.identity || '',
        obvious_cue: habit?.obvious_cue || '',
        attractive_bundle: habit?.attractive_bundle || '',
        easy_step: habit?.easy_step || '',
        satisfying_reward: habit?.satisfying_reward || '',
        schedule: habit?.schedule || 'daily',
    });

    const totalSteps = 6;

    const updateField = (field: keyof HabitFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const applyTemplate = (template: HabitTemplate) => {
        setFormData(template);
        setStep(1);
    };

    const canProceed = (): boolean => {
        switch (step) {
            case 0:
                return formData.title.length >= 2 && formData.identity.length >= 2;
            case 1:
                return true; // Optional field
            case 2:
                return true; // Optional field
            case 3:
                return formData.easy_step.length >= 2;
            case 4:
                return true; // Optional field
            case 5:
                return true; // Schedule has default
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (step < totalSteps - 1) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleSubmit = () => {
        startTransition(async () => {
            try {
                if (mode === 'edit' && habit) {
                    await updateHabit(habit.id, formData);
                } else {
                    await createHabit(formData);
                }
            } catch (error) {
                console.error('Failed to save habit:', error);
            }
        });
    };

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <>
                        {/* Templates - only show on create mode at step 0 */}
                        {mode === 'create' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start with a template (optional)
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {HABIT_TEMPLATES.map((template) => (
                                        <button
                                            key={template.title}
                                            type="button"
                                            onClick={() => applyTemplate(template)}
                                            className="p-3 text-center border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <span className="text-sm font-medium text-gray-700">
                                                {template.title}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">or create your own</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Habit Name *
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={formData.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                placeholder="e.g., Morning Meditation"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                required
                                minLength={2}
                            />
                        </div>
                        <div>
                            <label htmlFor="identity" className="block text-sm font-medium text-gray-700 mb-1">
                                Identity Statement *
                            </label>
                            <input
                                type="text"
                                id="identity"
                                value={formData.identity}
                                onChange={(e) => updateField('identity', e.target.value)}
                                placeholder="e.g., I am someone who meditates daily"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                required
                                minLength={2}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Start with &ldquo;I am...&rdquo; — this shapes who you&apos;re becoming
                            </p>
                        </div>
                    </>
                );

            case 1:
                return (
                    <div>
                        <label htmlFor="obvious_cue" className="block text-sm font-medium text-gray-700 mb-1">
                            Environmental Cue
                        </label>
                        <textarea
                            id="obvious_cue"
                            value={formData.obvious_cue}
                            onChange={(e) => updateField('obvious_cue', e.target.value)}
                            placeholder="e.g., Place meditation cushion in the center of my living room"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Design your environment to make the cue visible and unavoidable
                        </p>
                    </div>
                );

            case 2:
                return (
                    <div>
                        <label htmlFor="attractive_bundle" className="block text-sm font-medium text-gray-700 mb-1">
                            Temptation Bundle
                        </label>
                        <textarea
                            id="attractive_bundle"
                            value={formData.attractive_bundle}
                            onChange={(e) => updateField('attractive_bundle', e.target.value)}
                            placeholder="e.g., After I pour my morning coffee, I will meditate for 2 minutes"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Pair your habit with something you enjoy or link it to an existing habit
                        </p>
                    </div>
                );

            case 3:
                return (
                    <div>
                        <label htmlFor="easy_step" className="block text-sm font-medium text-gray-700 mb-1">
                            2-Minute Version *
                        </label>
                        <textarea
                            id="easy_step"
                            value={formData.easy_step}
                            onChange={(e) => updateField('easy_step', e.target.value)}
                            placeholder="e.g., Sit on my cushion and take 3 deep breaths"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                            required
                            minLength={2}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Scale down to something you can do in 2 minutes or less — this is your gateway habit
                        </p>
                    </div>
                );

            case 4:
                return (
                    <div>
                        <label htmlFor="satisfying_reward" className="block text-sm font-medium text-gray-700 mb-1">
                            Immediate Reward
                        </label>
                        <textarea
                            id="satisfying_reward"
                            value={formData.satisfying_reward}
                            onChange={(e) => updateField('satisfying_reward', e.target.value)}
                            placeholder="e.g., Track my streak in the app and see it grow"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Give yourself an immediate reward — the ending of a behavior influences repetition
                        </p>
                    </div>
                );

            case 5:
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Schedule
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="schedule"
                                    value="daily"
                                    checked={formData.schedule === 'daily'}
                                    onChange={(e) => updateField('schedule', e.target.value as 'daily' | 'weekdays')}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="ml-3">
                                    <span className="font-medium text-gray-900">Every Day</span>
                                    <p className="text-sm text-gray-500">Build a daily habit, including weekends</p>
                                </div>
                            </label>
                            <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="schedule"
                                    value="weekdays"
                                    checked={formData.schedule === 'weekdays'}
                                    onChange={(e) => updateField('schedule', e.target.value as 'daily' | 'weekdays')}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="ml-3">
                                    <span className="font-medium text-gray-900">Weekdays Only</span>
                                    <p className="text-sm text-gray-500">Monday through Friday</p>
                                </div>
                            </label>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const stepInfo = [
        {
            title: 'Identity & Name',
            description: 'Define who you want to become and name your habit.',
        },
        {
            title: 'Make It Obvious',
            description: 'Law #1: Design your environment so the cue is visible.',
        },
        {
            title: 'Make It Attractive',
            description: 'Law #2: Pair your habit with something you enjoy.',
        },
        {
            title: 'Make It Easy',
            description: 'Law #3: Reduce friction with a 2-minute starter step.',
        },
        {
            title: 'Make It Satisfying',
            description: 'Law #4: Add an immediate reward to reinforce the behavior.',
        },
        {
            title: 'Schedule',
            description: 'Choose when this habit should appear.',
        },
    ];

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <WizardStep
                step={step}
                totalSteps={totalSteps}
                title={stepInfo[step].title}
                description={stepInfo[step].description}
                onBack={handleBack}
                onNext={handleNext}
                isLastStep={step === totalSteps - 1}
                isSubmitting={isPending}
                canProceed={canProceed()}
            >
                {renderStepContent()}
            </WizardStep>
        </form>
    );
}
