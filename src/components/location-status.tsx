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
      <p className="location-status-copy">預計冒險地：{locationLabel}</p>
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
