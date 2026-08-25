function ConfiguracaoMenu({
                              tabs,
                              activeTab,
                              onTabChange,
                          }) {
    return (
        <aside className="h-fit rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange(tab.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                            active
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        <Icon size={18} />
                        {tab.label}
                    </button>
                );
            })}
        </aside>
    );
}

export default ConfiguracaoMenu;