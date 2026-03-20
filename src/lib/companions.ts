export type CompanionMode = 'kai' | 'luna' | 'nova' | 'sage' | 'spark' | 'custom';

export interface Companion {
  id: CompanionMode;
  name: string;
  emoji: string;
  subtitle: string;
  description: string;
  colorVar: string;
  colorHex: string;
}

export const companions: Companion[] = [
  {
    id: 'kai',
    name: 'Kai',
    emoji: '😄',
    subtitle: 'Best Friend',
    description: 'Your ride-or-die who keeps it real and makes everything lighter.',
    colorVar: 'var(--mode-kai)',
    colorHex: '#F5A623',
  },
  {
    id: 'luna',
    name: 'Luna',
    emoji: '💔',
    subtitle: 'Heartbreak',
    description: 'A gentle presence when your heart needs holding.',
    colorVar: 'var(--mode-luna)',
    colorHex: '#E91E8C',
  },
  {
    id: 'nova',
    name: 'Nova',
    emoji: '🌙',
    subtitle: 'Lonely Company',
    description: 'Warm company when the world feels too quiet.',
    colorVar: 'var(--mode-nova)',
    colorHex: '#3D5AFE',
  },
  {
    id: 'sage',
    name: 'Sage',
    emoji: '😤',
    subtitle: 'Vent Mode',
    description: 'A still, present listener who lets you be completely heard.',
    colorVar: 'var(--mode-sage)',
    colorHex: '#9C27B0',
  },
  {
    id: 'spark',
    name: 'Spark',
    emoji: '🤯',
    subtitle: 'Mind Blowing Facts',
    description: 'Jaw-dropping facts that make you see the world differently.',
    colorVar: 'var(--mode-spark)',
    colorHex: '#FFD700',
  },
];

export const customCompanion: Companion = {
  id: 'custom',
  name: 'My Person',
  emoji: '👤',
  subtitle: 'Custom',
  description: 'Create your own companion, exactly the way you need.',
  colorVar: 'var(--mode-kai)',
  colorHex: '#F5A623',
};

export function getCompanion(id: CompanionMode): Companion {
  if (id === 'custom') return customCompanion;
  return companions.find(c => c.id === id) || companions[0];
}
