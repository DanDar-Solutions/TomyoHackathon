// components/dashboard-skeleton.tsx
export function DashboardSkeleton() {
    return (
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-10 animate-pulse">
            <div className="h-10 w-1/3 bg-muted rounded mb-4" />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 h-64 bg-muted rounded-xl" />
                <div className="h-64 bg-muted rounded-xl" />
            </div>
        </div>
    );
}