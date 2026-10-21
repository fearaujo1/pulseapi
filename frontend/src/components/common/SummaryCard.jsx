// SummaryCard.jsx
import React from "react";

// Agora o componente recebe diretamente a lista estruturada de itens que deve renderizar
function SummaryCard({ items }) {
    return (
        <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {items.map(({ label, value, detail, icon: Icon, color }) => (
                <article key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                        <Icon size={17} />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                        <div className="mt-0.5 flex items-baseline gap-1.5">
                            <strong className="text-lg text-slate-900">{value}</strong>
                            <span className="text-[11px] text-slate-500">{detail}</span>
                        </div>
                    </div>
                </article>
            ))}
        </section>
    );
}

export default SummaryCard;
