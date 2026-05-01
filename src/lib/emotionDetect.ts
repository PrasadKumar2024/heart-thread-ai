const SAD_WORDS = /\b(sad|hurt|crying|miss|alone|broken|lost|tired|pain|lonely|depressed|anxious|scared|afraid)\b/i;
const HAPPY_WORDS = /\b(amazing|love|excited|happy|great|yes|omg|wow|awesome|fantastic|wonderful|yay)\b/i;

export type Emotion = 'sad' | 'excited' | 'neutral';

export function detectEmotion(text: string): Emotion {
  if (SAD_WORDS.test(text)) return 'sad';
  if (HAPPY_WORDS.test(text)) return 'excited';
  return 'neutral';
}

export function getSendEmoji(text: string): string | null {
  const len = text.trim().length;
  if (len > 300) return '🌿';
  if (len > 100) return '📤';
  if (SAD_WORDS.test(text)) return '❤️';
  if (HAPPY_WORDS.test(text)) return '✨';
  return null;
}
