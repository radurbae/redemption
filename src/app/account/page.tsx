import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';

export default async function AccountPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <AppShell>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Account</h1>

            <div className="card divide-y divide-gray-100">
                {/* Email akun */}
                <div className="p-4">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                </div>

                {/* Jadi member sejak */}
                <div className="p-4">
                    <p className="text-sm text-gray-500 mb-1">Member since</p>
                    <p className="text-gray-900 font-medium">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
            </div>

            {/* Keluar akun */}
            <form action="/auth/signout" method="post" className="mt-6">
                <button
                    type="submit"
                    formAction={async () => {
                        'use server';
                        const supabase = await createClient();
                        await supabase.auth.signOut();
                        redirect('/login');
                    }}
                    className="w-full py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                    Sign Out
                </button>
            </form>

            {/* Kutipan footer */}
            <p className="mt-8 text-center text-sm text-gray-400 italic">
                &ldquo;You do not rise to the level of your goals.<br />
                You fall to the level of your systems.&rdquo;
            </p>
        </AppShell>
    );
}
