import type { CardBackRecord } from '../features/card-backs/deck';
import type { ExpeditionPhase } from '../features/spin/useExpedition';

interface DestinyCardViewProps {
  cardBack: CardBackRecord;
  backdropUrl: string;
  categoryLabel: string;
  destinationName?: string;
  phase: ExpeditionPhase;
}

export function DestinyCardView({
  cardBack,
  backdropUrl,
  categoryLabel,
  destinationName,
  phase,
}: DestinyCardViewProps) {
  const isShowingFront = phase === 'spinning' || phase === 'result';
  const backLabel = `遠征卡背 ${cardBack.id}`;

  return (
    <article
      className={`expedition-card-stage expedition-card-rarity-${cardBack.rarity} expedition-card-stage-${phase}`}
    >
      {isShowingFront ? (
        <div className="expedition-card expedition-card-front" aria-label="遠征結果卡">
          <div className="expedition-card-frame">
            <img alt="" className="expedition-card-scene" src={backdropUrl} />
            <div className="expedition-card-front-shade" />
            <div className="expedition-card-front-cloud expedition-card-front-cloud-left" />
            <div className="expedition-card-front-cloud expedition-card-front-cloud-right" />
            <div className="expedition-card-front-glow" />
            <div className="expedition-card-front-content">
              <p className="expedition-card-kicker">今日遠征地</p>
              <h2>{destinationName}</h2>
              <p className="expedition-card-subcopy">{categoryLabel}遠征已揭曉，直接出發。</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="expedition-card expedition-card-back" aria-label={backLabel}>
          <div className="expedition-card-frame">
            <img alt="" className="expedition-card-back-image" src={cardBack.imageUrl} />
            <div className="expedition-card-back-shade" />
            <div className="expedition-card-back-glow" />
            <div className="expedition-card-back-copy">
              <p className="expedition-card-back-title">
                {phase === 'revealing' ? '遠征占卜中' : '等待遠征啟動'}
              </p>
              <p className="expedition-card-back-subcopy">
                {phase === 'revealing'
                  ? '牌面正在洗出今日目的地'
                  : '按下啟動鈕，讓牌面替你決定今天吃哪裡'}
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
