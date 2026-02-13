'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
        <p className="text-sm text-gray-600">
          Error: {error.message}
        </p>
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60 whitespace-pre-wrap">
          {error.stack}
        </pre>
        {error.digest && (
          <p className="text-xs text-gray-400">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
