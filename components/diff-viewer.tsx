import React from "react";

interface DiffViewerProps {
  diff: any;
}

export function DiffViewer({ diff }: DiffViewerProps) {
  if (!diff) {
    return null;
  }

  const changes = Object.entries(diff);

  if (changes.length === 0) {
    return <span className="text-gray-500 dark:text-gray-400">No changes</span>;
  }

  return (
    <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-xs whitespace-pre-wrap break-all">
      {changes.map(([key, value]: [string, any]) => (
        <div key={key} className="mb-1 last:mb-0">
          <div className="font-semibold text-gray-700 dark:text-gray-300">
            {key}
          </div>
          <div className="pl-2">
            <span className="text-red-600 dark:text-red-400">
              <span className="font-bold mr-1">-</span>
              {JSON.stringify(value.before, null, 2)}
            </span>
          </div>
          <div className="pl-2">
            <span className="text-green-600 dark:text-green-400">
              <span className="font-bold mr-1">+</span>
              {JSON.stringify(value.after, null, 2)}
            </span>
          </div>
        </div>
      ))}
    </pre>
  );
}
