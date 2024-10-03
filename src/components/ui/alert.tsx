import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { IconX } from '@tabler/icons-react';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 flex items-center gap-2.5 [&>svg]:size-[18px] [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        destructive: 'border-destructive text-destructive bg-destructive/10',
        success: 'border-emerald-500 text-emerald-500 bg-emerald-500/10',
      },
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      'font-medium text-[15px] leading-none tracking-tight',
      className
    )}
    {...props}
  >
    {children}
  </h5>
));
AlertTitle.displayName = 'AlertTitle';

const AlertCancel = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn('focus:outline-none ml-auto', className)}
    {...props}
  >
    <IconX className="shrink-0 size-[18px]" />
  </button>
));
AlertCancel.displayName = 'AlertCancel';

export { Alert, AlertTitle, AlertCancel };
