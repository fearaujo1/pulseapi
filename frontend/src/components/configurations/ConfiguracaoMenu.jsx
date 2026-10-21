function ConfiguracaoMenu({ tabs, activeTab, onTabChange }) {
    return (
        <aside className="h-fit overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm xl:sticky xl:top-5">
            <nav className="flex min-w-max gap-1 xl:min-w-0 xl:flex-col" aria-label="Seções de configuração">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            aria-current={active ? "page" : undefined}
                            className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition xl:w-full ${
                                active
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}

export default ConfiguracaoMenu;
