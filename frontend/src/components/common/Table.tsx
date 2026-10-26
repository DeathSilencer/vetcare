import React from 'react';
import { Loader2, Inbox } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No se encontraron registros en el sistema.',
  onRowClick,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-12 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-3" />
        <p className="text-sm font-medium text-slate-500">Cargando registros desde la base de datos...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-12 flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
          <Inbox className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-600 mb-1">Sin resultados</p>
        <p className="text-xs text-slate-400 max-w-sm text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} scope="col" className={`px-5 py-3.5 font-semibold ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-100 hover:bg-slate-50/80 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-5 py-4 ${col.className || ''}`}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : col.accessor
                      ? (row[col.accessor] as React.ReactNode)
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
