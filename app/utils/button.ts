import { cn } from './cn';

const baseClasses =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0';

const variantClasses = {
  default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
  destructive:
    'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
  outline:
    'border border-input shadow-sm hover:bg-accent hover:text-accent-foreground',
  'outline-nohover': 'border border-input shadow-sm',
  secondary:
    'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
  accent: 'bg-accent text-accent-foreground shadow-sm hover:bg-accent/80',
};

const sizeClasses = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'h-9 w-9',
};

export interface ButtonVariants {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
}

export const buttonVariants = ({
  variant = 'default',
  size = 'default',
}: ButtonVariants) => {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size]);
};
