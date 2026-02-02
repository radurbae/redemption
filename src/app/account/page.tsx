import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NavBar from '@/components/NavBar';

async function signOut() {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}

export default async function AccountPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <NavBar />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Account</h1>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    {/* User info */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Email
                        </label>
                        <p className="text-gray-900 font-medium">{user.email}</p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Member since
                        </label>
                        <p className="text-gray-900">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>

                    {/* Logout button */}
                    <form action={signOut}>
                        <button
                            type="submit"
                            className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        >
                            Sign out
                        </button>
                    </form>
                </div>

                {/* Atomic Habits tip */}
                <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <h3 className="font-semibold text-indigo-900 mb-2">💡 Atomic Habits Tip</h3>
                    <p className="text-sm text-indigo-800">
                        &ldquo;Habits are the compound interest of self-improvement. The same way that money
                        multiplies through compound interest, the effects of your habits multiply as you
                        repeat them.&rdquo;
                    </p>
                </div>
            </main>
        </div>
    );
}
