function PageHeader({
                        title,
                        description,
                        children,
                        className = "",
                    }) {
    return (
        <section
            className={`mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}
        >
            <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-[28px]">
                    {title}
                </h1>

                {description && (
                    <p className="mt-1 text-xs text-slate-500 md:text-[13px]">
                        {description}
                    </p>
                )}
            </div>

            {children && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {children}
                </div>
            )}
        </section>
    );
}

export default PageHeader;
