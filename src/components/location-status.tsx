interface LocationStatusProps {
  locationLabel: string;
  triggerLabel: string;
  onOpen: () => void;
}

export function LocationStatus({
  locationLabel,
  triggerLabel,
  onOpen,
}: LocationStatusProps) {
  return (
    <div className="location-status">
      <p className="location-status-copy">
        <span className="location-status-label">預計冒險地：</span>
        <span className="location-status-value">{locationLabel}</span>
      </p>
      <button
        className="location-status-trigger"
        type="button"
        onClick={onOpen}
      >
        {triggerLabel}
      </button>
    </div>
  );
}
