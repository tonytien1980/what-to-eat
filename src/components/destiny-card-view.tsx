import { gameArt } from '../assets/game-art';
import { DestinyCardArtView } from '../features/destiny/card-art';
import type { DestinyCard } from '../features/destiny/types';

interface DestinyCardViewProps {
  card: DestinyCard;
  phaseLabel: string;
  meta: string[];
  isRevealing: boolean;
}

export function DestinyCardView({
  card,
  phaseLabel,
  meta,
  isRevealing,
}: DestinyCardViewProps) {
  return (
    <article
      className={
        isRevealing
          ? `destiny-card destiny-card-${card.accent} destiny-card-revealing`
          : `destiny-card destiny-card-${card.accent}`
      }
    >
      <div className="destiny-card-frame">
        <div className="destiny-card-header">
          <p className="phase-badge">{phaseLabel}</p>
          <span className="destiny-card-subtitle">{card.subtitle}</span>
        </div>

        <div className="destiny-card-illustration">
          <img
            alt=""
            className="destiny-card-scene"
            src={gameArt.forestRuinsBackground}
          />
          {card.art === 'dice' ? (
            <img
              alt=""
              className="destiny-card-item"
              src={gameArt.healingPotionIcon}
            />
          ) : (
            <DestinyCardArtView art={card.art} />
          )}
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
    </article>
  );
}
