function SetupSection({
                          icon: Icon,
                          iconClassName = "bg-blue-50 text-blue-600",
                          title,
                          description,
                          children,
                      }) {
    return (
        <section>
            <div className="mb-5 flex items-center gap-3">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}
                >
                    {Icon && <Icon size={20} />}
                </div>

                <div>
                    <h2 className="text-[18px] font-bold text-slate-900">
                        {title}
                    </h2>

                    <p className="text-[13px] text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            <div className="space-y-5">
                {children}
            </div>
        </section>
    );
}

export default SetupSection;