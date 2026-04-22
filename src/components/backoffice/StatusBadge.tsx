interface StatusBadgeProps {
  isActive: boolean;
}

export default function StatusBadge({ isActive }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-x-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        isActive
          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
