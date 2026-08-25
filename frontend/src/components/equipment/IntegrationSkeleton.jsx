function IntegrationSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="mb-3 h-10 w-72 rounded-xl bg-slate-200" />
            <div className="mb-8 h-5 w-96 max-w-full rounded-lg bg-slate-200" />

            <div className="mb-6 h-28 rounded-[28px] border border-slate-200 bg-white" />

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-36 rounded-[24px] border border-slate-200 bg-white"
                    />
                ))}
            </div>

            <div className="h-64 rounded-[28px] border border-slate-200 bg-white" />
        </div>
    );
}

export default IntegrationSkeleton;