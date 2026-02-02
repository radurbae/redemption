import NavBar from '@/components/NavBar';
import HabitForm from '@/components/HabitForm';

export default function NewHabitPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            <NavBar />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Create a New Habit
                    </h1>
                    <p className="text-gray-600">
                        Use the 4 Laws of Behavior Change to build a habit that sticks
                    </p>
                </div>

                <HabitForm mode="create" />
            </main>
        </div>
    );
}
