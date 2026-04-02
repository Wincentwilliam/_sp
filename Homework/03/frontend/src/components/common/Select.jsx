import { cn } from '../../utils/cn';

export default function Select({
  label,
  error,
  options = [],
  className,
  id,
  required = false,
  placeholder = 'Select an option',
  ...props
}) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors',
          'bg-white',
          error
            ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-200'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200',
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
    </div>
  );
}
