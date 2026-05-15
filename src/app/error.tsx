'use client';

import { useEffect } from 'react';
import { Button } from '~/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  const isServerActionError = error.message.includes('Failed to find Server Action');

  return (
    <div className="flex min-h-[400px] h-full w-full flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4 text-center p-8 bg-card rounded-xl shadow-sm border max-w-md">
        <h2 className="text-xl font-semibold text-destructive">
          {isServerActionError ? 'Application Updated' : 'Something went wrong!'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isServerActionError
            ? 'The application has been updated with a new version. Please refresh the page to continue using the latest features.'
            : 'An unexpected error occurred. Please try again or contact support if the issue persists.'}
        </p>
        <Button
          onClick={() => {
            if (isServerActionError) {
              window.location.reload();
            } else {
              reset();
            }
          }}
          className="mt-4"
        >
          {isServerActionError ? 'Refresh Page' : 'Try again'}
        </Button>
      </div>
    </div>
  );
}
