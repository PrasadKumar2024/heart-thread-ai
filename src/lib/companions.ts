export type CompanionMode = 'kai' | 'luna' | 'nova' | 'rex' | 'sage' | 'eden' | 'custom';

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
    id: 'rex',
    name: 'Rex',
    emoji: '🔥',
    subtitle: 'Brutal Honesty',
    description: 'The honest friend you need but rarely have.',
    colorVar: 'var(--mode-rex)',
    colorHex: '#FF6D00',
  },
  {
    id: 'sage',
    name: 'Sage',
    emoji: '😤',
    subtitle: 'Vent Mode',
    description: 'A deep river of calm that holds space for everything.',
    colorVar: 'var(--mode-sage)',
    colorHex: '#9C27B0',
  },
  {
    id: 'eden',
    name: 'Eden',
    emoji: '🧠',
    subtitle: 'Life Decisions',
    description: 'The wisest friend you\'ve ever had access to.',
    colorVar: 'var(--mode-eden)',
    colorHex: '#00BCD4',
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
