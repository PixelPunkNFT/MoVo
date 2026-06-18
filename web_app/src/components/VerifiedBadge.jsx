import { colors } from '../config/theme';

export default function VerifiedBadge({ size = 14 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title="Account verificato">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={colors.gold} />
        <polyline points="9 12 11 14 15 10" fill="none" stroke="#0F1115" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
