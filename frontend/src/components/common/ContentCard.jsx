function ContentCard({
                         title,
                         subtitle,
                         headerActions,
                         children,
                         className = "",
                     }) {
    return (
        <section
            className={`rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm ${className}`}
        >
            {(title || subtitle || headerActions) && (
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        {title && (
                            <h2 className="text-xl font-bold text-slate-950 md:text-2xl">
                                {title}
                            </h2>
                        )}

                        {subtitle && (
                            <p className="mt-1 text-sm text-slate-500">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {headerActions && (
                        <div className="flex flex-wrap items-center gap-3">
                            {headerActions}
                        </div>
                    )}
                </div>
            )}

            {children}
        </section>
    );
}

export default ContentCard;