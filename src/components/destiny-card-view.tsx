import { DestinyCardArtView } from '../features/destiny/card-art';
import type { DestinyCard } from '../features/destiny/types';

interface DestinyCardViewProps {
  card: DestinyCard;
  backdropUrl: string;
  phaseLabel: string;
  meta: string[];
  isRevealing: boolean;
}

export function DestinyCardView({
  card,
  backdropUrl,
  phaseLabel,
  meta,
  isRevealing,
}: DestinyCardViewProps) {
  return (
    <article
      className={
        isRevealing
          ? `destiny-card destiny-card-${card.accent} destiny-card-revealing`
          : `destiny-card destiny-card-${card.accent} destiny-card-revealed`
      }
    >
      {isRevealing ? (
        <div className="tarot-card tarot-card-back" aria-label="命運卡卡背">
          <div className="tarot-card-shell">
            <div className="tarot-back-border" />
            <div className="tarot-back-core">
              <span className="tarot-rarity">命運祭壇</span>
              <div className="tarot-back-sigil" aria-hidden="true">
                <span className="tarot-back-ring tarot-back-ring-outer" />
                <span className="tarot-back-ring tarot-back-ring-inner" />
                <span className="tarot-back-star" />
              </div>
              <div className="tarot-back-copy">
                <strong>命運之輪</strong>
                <span>{phaseLabel}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="tarot-card tarot-card-front">
          <div className="tarot-card-shell">
            <div className="tarot-card-banner">
              <span className="phase-badge">{phaseLabel}</span>
              <span className="destiny-card-subtitle">{card.subtitle}</span>
            </div>

            <div className="destiny-card-illustration">
              <img alt="" className="destiny-card-scene" src={backdropUrl} />
              <DestinyCardArtView art={card.art} />
            </div>

            <div className="destiny-card-body">
              <h2>命運卡：{card.name}</h2>
              <p className="card-description">{card.description}</p>
              <div className="card-meta-row">
                {meta.map((item) => (
                  <span key={item} className="card-meta-pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
