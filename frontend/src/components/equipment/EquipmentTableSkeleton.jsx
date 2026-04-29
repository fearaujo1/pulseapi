function EquipmentTableSkeleton() {
    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm animate-pulse">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-left">
                        <th className="px-6 py-4">
                            <div className="h-4 w-16 rounded bg-slate-200" />
                        </th>
                        <th className="px-6 py-4">
                            <div className="h-4 w-16 rounded bg-slate-200" />
                        </th>
                        <th className="px-6 py-4">
                            <div className="h-4 w-12 rounded bg-slate-200" />
                        </th>
                        <th className="px-6 py-4">
                            <div className="h-4 w-14 rounded bg-slate-200" />
                        </th>
                        <th className="px-6 py-4">
                            <div className="h-4 w-14 rounded bg-slate-200" />
                        </th>
                        <th className="px-6 py-4">
                            <div className="h-4 w-14 rounded bg-slate-200" />
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {[...Array(5)].map((_, index) => (
                        <tr key={index} className="border-b border-slate-100 last:border-b-0">
                            <td className="px-6 py-5">
                                <div className="h-4 w-40 rounded bg-slate-200" />
                            </td>
                            <td className="px-6 py-5">
                                <div className="h-4 w-24 rounded bg-slate-200" />
                            </td>
                            <td className="px-6 py-5">
                                <div className="h-4 w-32 rounded bg-slate-200" />
                            </td>
                            <td className="px-6 py-5">
                                <div className="h-4 w-24 rounded bg-slate-200" />
                            </td>
                            <td className="px-6 py-5">
                                <div className="h-8 w-28 rounded-full bg-slate-200" />
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                    <div className="h-9 w-9 rounded-xl bg-slate-200" />
                                    <div className="h-9 w-9 rounded-xl bg-slate-200" />
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default EquipmentTableSkeleton;