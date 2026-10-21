function SetupSection({
                          icon: Icon,
                          iconClassName = "bg-blue-50 text-blue-600",
                          title,
                          description,
                          children,
                      }) {
    return (
        <section>
            <header className="mb-5 flex items-start gap-3">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
                >
                    {Icon && (
                        <Icon
                            size={18}
                            strokeWidth={1.8}
                        />
                    )}
                </div>

                <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold text-slate-900">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-1 text-[11px] leading-5 text-slate-500">
                            {description}
                        </p>
                    )}
                </div>
            </header>

            {children}
        </section>
    );
}

export default SetupSection;