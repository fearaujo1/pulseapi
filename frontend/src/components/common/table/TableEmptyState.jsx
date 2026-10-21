import {
    Inbox,
} from "lucide-react";

function TableEmptyState({
                             title = "Nenhum registro encontrado",
                             description =
                             "Não existem registros para exibir.",
                             icon: Icon = Inbox,
                         }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <Icon size={19} />
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-700">
                {title}
            </p>

            {description && (
                <p className="mt-1 text-[11px] text-slate-500">
                    {description}
                </p>
            )}
        </div>
    );
}

export default TableEmptyState;