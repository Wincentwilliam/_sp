import { cn } from '../../utils/cn';

export default function Loading({
  size = 'md',
  text,
  className,
}) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className={cn('spinner', sizes[size])} />
      {text && <p className="mt-3 text-gray-600">{text}</p>}
    </div>
  );
}
