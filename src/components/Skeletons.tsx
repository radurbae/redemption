export function HabitCardSkeleton() {
    return (
        <div className="card p-4">
            <div className="flex items-start gap-3">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0">
                    <div className="skeleton h-5 w-3/4 mb-2" />
                    <div className="skeleton h-4 w-1/2 mb-3" />
                    <div className="flex gap-2">
                        <div className="skeleton h-12 w-24 rounded-xl" />
                        <div className="skeleton h-12 w-16 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ProgressSkeleton() {
    return (
        <div className="card p-4">
            <div className="skeleton h-4 w-1/3 mb-3" />
            <div className="skeleton h-2 w-full rounded-full" />
        </div>
    );
}

export function TrackerGridSkeleton() {
    return (
        <div className="card p-4">
            <div className="flex justify-between mb-4">
                <div className="skeleton h-8 w-8 rounded-lg" />
                <div className="skeleton h-6 w-32" />
                <div className="skeleton h-8 w-8 rounded-lg" />
            </div>
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="skeleton h-8 rounded-md" />
                ))}
            </div>
        </div>
    );
}

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="card p-4">
                <div className="skeleton h-4 w-2/3 mb-2" />
                <div className="skeleton h-8 w-12" />
            </div>
            <div className="card p-4">
                <div className="skeleton h-4 w-2/3 mb-2" />
                <div className="skeleton h-8 w-12" />
            </div>
        </div>
    );
}
