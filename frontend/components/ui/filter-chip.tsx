export function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted transition-colors hover:text-foreground"
    >
      {label}
      <span aria-hidden>&times;</span>
      <span className="sr-only">Clear filter</span>
    </button>
  );
}
