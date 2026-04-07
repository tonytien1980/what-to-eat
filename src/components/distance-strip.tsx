interface DistanceStripProps {
  status: 'idle' | 'requesting' | 'ready' | 'unsupported' | 'denied' | 'unavailable';
  label: string;
  onRequest: () => void;
}

export function DistanceStrip({
  status,
  label,
  onRequest,
}: DistanceStripProps) {
  return (
    <div className="distance-strip" aria-live="polite">
      {status === 'idle' || status === 'denied' || status === 'unavailable' ? (
        <button
          className="distance-strip-trigger"
          type="button"
          onClick={onRequest}
        >
          {label}
        </button>
      ) : (
        <p className="distance-strip-copy">{label}</p>
      )}
    </div>
  );
}
