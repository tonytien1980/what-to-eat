import type { DestinyCardArt } from './types';

interface CardArtProps {
  art: DestinyCardArt;
}

export function DestinyCardArtView({ art }: CardArtProps) {
  return (
    <svg
      aria-hidden="true"
      className="destiny-card-art"
      viewBox="0 0 240 240"
      fill="none"
    >
      <circle cx="120" cy="120" r="108" className="card-art-orb" />
      <circle cx="120" cy="120" r="84" className="card-art-ring" />
      {art === 'wind' ? (
        <>
          <path
            className="card-art-stroke"
            d="M48 118c24-34 54-49 90-49 22 0 41 7 56 22"
          />
          <path
            className="card-art-stroke"
            d="M66 144c20-18 41-27 64-27 30 0 52 13 64 38"
          />
          <path
            className="card-art-stroke"
            d="M89 89c10-22 27-34 52-34 13 0 25 4 36 13"
          />
        </>
      ) : null}
      {art === 'gold' ? (
        <>
          <circle cx="120" cy="100" r="34" className="card-art-fill" />
          <path
            className="card-art-stroke"
            d="M82 138h76v20c0 17-17 30-38 30s-38-13-38-30v-20Z"
          />
          <path className="card-art-detail" d="M102 100h36M120 82v36" />
        </>
      ) : null}
      {art === 'flame' ? (
        <>
          <path
            className="card-art-fill"
            d="M119 44c19 26 32 47 32 68 0 23-14 40-31 40-18 0-31-16-31-37 0-12 5-24 15-37 6 8 11 13 15 13 6 0 10-8 10-18 0-8-3-17-10-29Z"
          />
          <path
            className="card-art-stroke"
            d="M119 124c13 14 20 27 20 39 0 17-10 29-22 29s-22-12-22-28c0-10 5-19 15-28 4 6 7 9 10 9 4 0 8-5 8-12 0-3-1-6-3-9"
          />
        </>
      ) : null}
      {art === 'mist' ? (
        <>
          <path
            className="card-art-fill"
            d="M82 126c0-27 21-49 48-49 23 0 42 16 47 38 18 2 32 17 32 35 0 20-16 36-36 36H88c-19 0-34-15-34-34 0-15 10-27 24-31 1 2 4 5 4 5Z"
          />
          <path className="card-art-detail" d="M71 165h100M83 146h76" />
        </>
      ) : null}
      {art === 'eye' ? (
        <>
          <path
            className="card-art-stroke"
            d="M45 120c22-32 47-48 75-48s53 16 75 48c-22 32-47 48-75 48s-53-16-75-48Z"
          />
          <circle cx="120" cy="120" r="24" className="card-art-fill" />
          <circle cx="120" cy="120" r="10" className="card-art-detail-fill" />
        </>
      ) : null}
      {art === 'festival' ? (
        <>
          <path
            className="card-art-fill"
            d="M120 52 133 88l38 2-29 24 9 37-31-19-31 19 9-37-29-24 38-2 13-36Z"
          />
          <path className="card-art-detail" d="M60 176c16-13 34-19 54-19s38 6 54 19" />
        </>
      ) : null}
      {art === 'dice' ? (
        <>
          <rect x="76" y="76" width="88" height="88" rx="18" className="card-art-fill" />
          <circle cx="103" cy="103" r="7" className="card-art-detail-fill" />
          <circle cx="137" cy="103" r="7" className="card-art-detail-fill" />
          <circle cx="103" cy="137" r="7" className="card-art-detail-fill" />
          <circle cx="137" cy="137" r="7" className="card-art-detail-fill" />
          <path className="card-art-detail" d="M88 63l16-14M152 191l15-13" />
        </>
      ) : null}
    </svg>
  );
}
