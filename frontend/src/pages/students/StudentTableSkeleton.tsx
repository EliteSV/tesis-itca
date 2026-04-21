export function StudentTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ minWidth: 'min(800px, 100%)' }}>
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            <th className="text-left py-4 px-4 w-12">
              <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </th>
            <th className="text-left py-4 px-4">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </th>
            <th className="text-left py-4 px-4">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </th>
            <th className="text-left py-4 px-4">
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </th>
            <th className="text-left py-4 px-4 hidden lg:table-cell">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </th>
            <th className="text-left py-4 px-4 hidden xl:table-cell">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </th>
            <th className="text-right py-4 px-4">
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-auto" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i}>
              <td className="py-4 px-4">
                <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </td>
              <td className="py-4 px-4">
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </td>
              <td className="py-4 px-4">
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              </td>
              <td className="py-4 px-4 hidden lg:table-cell">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </td>
              <td className="py-4 px-4 hidden xl:table-cell">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </td>
              <td className="py-4 px-4 text-right">
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

