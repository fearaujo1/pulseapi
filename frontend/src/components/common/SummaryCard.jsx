function SummaryCard({ title, value, subtitle, icon, className = "" }) {
    return (
        <div
            className={`rounded-3xl border p-7 bg-white min-h-[170px] flex flex-col justify-between shadow-sm ${className}`}
        >
           <div className="flex items-start justify-between">
               <div>
                   <p className="text-[16px] font-medium text-slate-700">{title}</p>
                   <h3 className="mt-3 text-[48px] leading-none font-bold text-slate-900">{value}</h3>
               </div>
               <div className="text-slate-500">{icon}</div>
           </div>
           <p className="text-[15px] text-slate-500">{subtitle}</p>
        </div>
    );
}

export default SummaryCard;