function PageHeader({
    title,
    description,
    children,
    className = "",
}) {
    return (
        <section
            className={`mb-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between ${className}`}
        >
            <div>
                <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">{title}</h1>

                {description && (
                    <p className="mt-1 text-[16px] text-slate-600">
                        {description}
                    </p>
                )}
            </div>

            {children && (
                <div className="flex flex-wrap items-center gap-3">
                    {children}
                </div>
            )}
        </section>
    );
}

export default PageHeader;