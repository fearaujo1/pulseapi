import { Settings } from "lucide-react";

function EmBreveTab({ tab }) {
    const Icon = tab?.icon || Settings;

    return (
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Icon size={26} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
                {tab?.label}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
                Esta seção será implementada em uma próxima etapa.
            </p>
        </div>
    );
}

export default EmBreveTab;