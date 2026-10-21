function ContentCard({
                         title,
                         subtitle,
                         headerActions,
                         children,
                         className = "",
                         contentClassName = "",
                     }) {
    return (
        <section
            className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 ${className}`}
        >
            {(title || subtitle || headerActions) && (
                <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        {title && (
                            <h2 className="text-base font-bold text-slate-900">
                                {title}
                            </h2>
                        )}

                        {subtitle && (
                            <p className="mt-1 text-xs text-slate-500">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {headerActions && (
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                            {headerActions}
                        </div>
                    )}
                </header>
            )}

            <div className={contentClassName}>{children}</div>
        </section>
    );
}

export default ContentCard;
