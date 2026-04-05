import type { DestinyCard } from './types';

export const destinyCards: DestinyCard[] = [
  {
    id: 'swift-wind',
    name: '疾風祝福',
    type: 'filter',
    description: '只從近距離據點中抽出今日遠征地。',
    filter: {
      distanceLevel: ['near'],
    },
    allowReroll: false,
  },
  {
    id: 'golden-famine',
    name: '黃金匱乏',
    type: 'filter',
    description: '命運要求今日先以省錢為上，優先低價據點。',
    filter: {
      priceLevel: ['low'],
    },
    allowReroll: false,
  },
  {
    id: 'flame-summoning',
    name: '熾焰召喚',
    type: 'filter',
    description: '今天只對熱食有回應，冰冷選項全部退下。',
    filter: {
      requiredTags: ['hot'],
    },
    allowReroll: false,
  },
  {
    id: 'mist-shroud',
    name: '迷霧籠罩',
    type: 'flavor',
    description: '迷霧遮蔽前路，今日結果完全交給命運。',
    allowReroll: false,
  },
  {
    id: 'ancient-whisper',
    name: '古神低語',
    type: 'flavor',
    description: '古老低語已降下旨意，請不要質疑命運。',
    allowReroll: false,
  },
  {
    id: 'festival-day',
    name: '慶典之日',
    type: 'flavor',
    description: '今天適合熱鬧揭曉，目的地仍由命運決定。',
    allowReroll: false,
  },
  {
    id: 'fate-reroll',
    name: '宿命重骰',
    type: 'reroll',
    description: '若第一次結果不合天意，本局可逆天改命一次。',
    allowReroll: true,
  },
];
