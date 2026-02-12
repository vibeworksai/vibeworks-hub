/**
 * Reusable loading and empty state components
 */

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400`}
      />
    </div>
  );
}

export function LoadingCard({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="glass-card border border-white/20 px-6 py-8 text-center">
      <LoadingSpinner size="md" />
      <p className="mt-4 text-sm text-slate-300">{message}</p>
    </div>
  );
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass-card border border-white/20 px-6 py-12 text-center">
      <div className="text-5xl">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We're having trouble loading this content. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="glass-card border border-rose-300/30 bg-rose-400/10 px-6 py-8 text-center">
      <div className="text-4xl">⚠️</div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 rounded-lg border border-cyan-300/30 bg-cyan-400/20 px-6 py-2 text-sm font-medium text-cyan-100 transition-all hover:bg-cyan-400/30 active:scale-95"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
