import { cn } from '~/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TaskLabel({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex text-white dark:text-neutral-100 items-center rounded-xl px-2.5 py-[3px] text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className,
      )}
      {...props}
    />
  );
}
