import type { LocationOptionGroup } from '../features/location/types';

interface LocationSheetProps {
  isOpen: boolean;
  cityGroups: LocationOptionGroup[];
  districtOptions: string[];
  draftCity: string;
  draftDistrict: string | null;
  onCityChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onSkipDistrict: () => void;
  onClose: () => void;
  onSave: () => void;
}

export function LocationSheet({
  isOpen,
  cityGroups,
  districtOptions,
  draftCity,
  draftDistrict,
  onCityChange,
  onDistrictChange,
  onSkipDistrict,
  onClose,
  onSave,
}: LocationSheetProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <section className="location-sheet" aria-label="更改預計冒險地">
      <div className="location-sheet-head">
        <div>
          <p className="location-sheet-kicker">預計冒險地設定</p>
          <h2 className="location-sheet-title">更改預計冒險地</h2>
        </div>
        <button
          className="location-sheet-close"
          type="button"
          onClick={onClose}
        >
          關閉
        </button>
      </div>

      <div className="location-sheet-grid">
        <label className="location-field">
          <span className="location-field-label">城市</span>
          <select
            aria-label="城市"
            className="location-select"
            value={draftCity}
            onChange={(event) => onCityChange(event.target.value)}
          >
            {cityGroups.map((group) => (
              <option key={group.city} value={group.city}>
                {group.city}
              </option>
            ))}
          </select>
        </label>

        <label className="location-field">
          <span className="location-field-label">地區</span>
          <select
            aria-label="地區"
            className="location-select"
            value={draftDistrict ?? ''}
            onChange={(event) => onDistrictChange(event.target.value)}
          >
            {districtOptions.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="location-sheet-actions">
        <button
          className="location-text-button"
          type="button"
          onClick={onSkipDistrict}
        >
          略過地區
        </button>
        <button
          className="location-save-button"
          type="button"
          onClick={onSave}
        >
          儲存並套用
        </button>
      </div>
    </section>
  );
}
