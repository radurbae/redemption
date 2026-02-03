'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createHabit, updateHabit } from '@/lib/actions/habits';
import type { Habit } from '@/lib/types';

interface HabitFormProps {
    habit?: Habit;
    mode: 'create' | 'edit';
}

const STEPS = [
    { key: 'identity', label: 'Identity', description: 'Who do you want to become?' },
    { key: 'obvious', label: 'Make it Obvious', description: 'What will trigger this habit?' },
    { key: 'attractive', label: 'Make it Attractive', description: 'Pair it with something you enjoy' },
    { key: 'easy', label: 'Make it Easy', description: 'What is the 2-minute version?' },
    { key: 'satisfying', label: 'Make it Satisfying', description: 'How will you reward yourself?' },
    { key: 'schedule', label: 'Schedule', description: 'When will you do this?' },
];

const TEMPLATES = [
    {
        title: 'Reading',
        identity: 'I am a reader',
        obvious_cue: 'After I pour my morning coffee',
        attractive_bundle: 'While listening to calming music',
        easy_step: 'Read one page',
        satisfying_reward: 'Mark it off my tracker',
    },
    {
        title: 'Exercise',
        identity: 'I am someone who moves daily',
        obvious_cue: 'When I wake up, my workout clothes are ready',
        attractive_bundle: 'While listening to my favorite podcast',
        easy_step: 'Do 2 pushups',
        satisfying_reward: 'Take a refreshing shower',
    },
    {
        title: 'Study',
        identity: 'I am a lifelong learner',
        obvious_cue: 'After lunch, I open my study materials',
        attractive_bundle: 'At my favorite cafe',
        easy_step: 'Review one flashcard',
        satisfying_reward: 'Enjoy a small treat',
    },
];

export default function HabitForm({ habit, mode }: HabitFormProps) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [isPending, setIsPending] = useState(false);

    const [formData, setFormData] = useState({
        title: habit?.title || '',
        identity: habit?.identity || '',
        obvious_cue: habit?.obvious_cue || '',
        attractive_bundle: habit?.attractive_bundle || '',
        easy_step: habit?.easy_step || '',
        satisfying_reward: habit?.satisfying_reward || '',
        schedule: (habit?.schedule || 'daily') as 'daily' | 'weekdays',
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const applyTemplate = (template: typeof TEMPLATES[0]) => {
        setFormData(prev => ({
            ...prev,
            title: template.title,
            identity: template.identity,
            obvious_cue: template.obvious_cue,
            attractive_bundle: template.attractive_bundle,
            easy_step: template.easy_step,
            satisfying_reward: template.satisfying_reward,
        }));
        setStep(1);
    };

    const canProceed = () => {
        switch (step) {
            case 0: return formData.identity.length > 0;
            case 1: return true;
            case 2: return true;
            case 3: return formData.easy_step.length > 0;
            case 4: return true;
            case 5: return formData.title.length > 0;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        setIsPending(true);

        if (mode === 'create') {
            await createHabit(formData);
        } else if (habit) {
            await updateHabit(habit.id, formData);
        }

        router.push('/');
    };

    const nextStep = () => {
        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (step > 0) setStep(s => s - 1);
    };

    const inputStyle = {
        background: 'var(--background-secondary)',
        borderColor: 'var(--border)',
        color: 'var(--foreground)',
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
            {/* Progress bar */}
            <div className="border-b px-4 pt-safe" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                <div className="max-w-md mx-auto py-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                            Step {step + 1} of {STEPS.length}
                        </span>
                        <button
                            onClick={() => router.back()}
                            className="text-sm hover:opacity-70"
                            style={{ color: 'var(--foreground-muted)' }}
                        >
                            Cancel
                        </button>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--background-secondary)' }}>
                        <div
                            className="h-full bg-indigo-600 transition-all duration-300"
                            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 py-6 overflow-auto">
                <div className="max-w-md mx-auto">
                    <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                        {STEPS[step].label}
                    </h2>
                    <p className="text-sm mb-6" style={{ color: 'var(--foreground-muted)' }}>
                        {STEPS[step].description}
                    </p>

                    {/* Step content */}
                    {step === 0 && (
                        <div className="space-y-6">
                            {mode === 'create' && (
                                <div>
                                    <p className="text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
                                        Start with a template:
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {TEMPLATES.map((t) => (
                                            <button
                                                key={t.title}
                                                onClick={() => applyTemplate(t)}
                                                className="card p-3 text-center hover:border-indigo-500 transition-colors btn-press"
                                            >
                                                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{t.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2" style={{ background: 'var(--background)', color: 'var(--foreground-muted)' }}>or create your own</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                    I am a person who...
                                </label>
                                <input
                                    type="text"
                                    value={formData.identity}
                                    onChange={(e) => updateField('identity', e.target.value)}
                                    placeholder="e.g., reads every day"
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                Environmental cue (optional)
                            </label>
                            <textarea
                                value={formData.obvious_cue}
                                onChange={(e) => updateField('obvious_cue', e.target.value)}
                                placeholder="e.g., After I pour my morning coffee, I will..."
                                rows={3}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                style={inputStyle}
                            />
                            <p className="text-xs mt-2" style={{ color: 'var(--foreground-muted)' }}>
                                Tip: Use implementation intentions like &ldquo;After [CURRENT HABIT], I will [NEW HABIT]&rdquo;
                            </p>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                Temptation bundle (optional)
                            </label>
                            <textarea
                                value={formData.attractive_bundle}
                                onChange={(e) => updateField('attractive_bundle', e.target.value)}
                                placeholder="e.g., While listening to my favorite podcast"
                                rows={3}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                style={inputStyle}
                            />
                            <p className="text-xs mt-2" style={{ color: 'var(--foreground-muted)' }}>
                                Tip: Pair the habit with something you enjoy
                            </p>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                2-minute version *
                            </label>
                            <textarea
                                value={formData.easy_step}
                                onChange={(e) => updateField('easy_step', e.target.value)}
                                placeholder="e.g., Read one page of my book"
                                rows={3}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                style={inputStyle}
                            />
                            <p className="text-xs mt-2" style={{ color: 'var(--foreground-muted)' }}>
                                Make it so easy you can&apos;t say no. Scale down until it takes 2 minutes or less.
                            </p>
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                Immediate reward (optional)
                            </label>
                            <textarea
                                value={formData.satisfying_reward}
                                onChange={(e) => updateField('satisfying_reward', e.target.value)}
                                placeholder="e.g., Enjoy a piece of dark chocolate"
                                rows={3}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                style={inputStyle}
                            />
                            <p className="text-xs mt-2" style={{ color: 'var(--foreground-muted)' }}>
                                Tip: The reward should come immediately after completing the habit
                            </p>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                    Habit name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    placeholder="e.g., Daily Reading"
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                    Schedule
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => updateField('schedule', 'daily')}
                                        className="py-3 px-4 rounded-xl font-medium transition-all btn-press"
                                        style={{
                                            background: formData.schedule === 'daily' ? 'var(--primary)' : 'var(--background-secondary)',
                                            color: formData.schedule === 'daily' ? 'white' : 'var(--foreground)',
                                        }}
                                    >
                                        Every day
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateField('schedule', 'weekdays')}
                                        className="py-3 px-4 rounded-xl font-medium transition-all btn-press"
                                        style={{
                                            background: formData.schedule === 'weekdays' ? 'var(--primary)' : 'var(--background-secondary)',
                                            color: formData.schedule === 'weekdays' ? 'white' : 'var(--foreground)',
                                        }}
                                    >
                                        Weekdays
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed bottom buttons */}
            <div
                className="border-t px-4"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border)', paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
            >
                <div className="max-w-md mx-auto py-4 flex gap-3">
                    {step > 0 && (
                        <button
                            onClick={prevStep}
                            className="px-6 py-3.5 font-semibold rounded-xl btn-press"
                            style={{ background: 'var(--background-secondary)', color: 'var(--foreground)' }}
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={nextStep}
                        disabled={!canProceed() || isPending}
                        className="flex-1 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl disabled:opacity-50 btn-press"
                    >
                        {isPending ? 'Saving...' : step === STEPS.length - 1 ? (mode === 'create' ? 'Create Habit' : 'Save Changes') : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
}
