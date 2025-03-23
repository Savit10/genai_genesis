export function StatusBadge({ status }: { status: 'pending' | 'processing' | 'completed' | 'error' }) {
  const statusConfig = {
    pending: { color: 'bg-yellow-500', text: 'Pending' },
    processing: { color: 'bg-blue-500', text: 'Processing' },
    completed: { color: 'bg-green-500', text: 'Completed' },
    error: { color: 'bg-red-500', text: 'Error' }
  };

  const config = statusConfig[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${config.color}`}>
      {config.text}
    </span>
  );
} 