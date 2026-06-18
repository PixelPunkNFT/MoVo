import { BADGE_META } from '../config/badges';
import { colors } from '../config/theme';

export default function BadgeRow({ badges = [], size = 'small' }) {
  if (!badges.length) return null;

  const isLarge = size === 'large';

  return (
    <div style={{ display: 'flex', gap: isLarge ? 8 : 4, flexWrap: 'wrap', alignItems: 'center' }}>
      {badges.map(id => {
        const meta = BADGE_META[id];
        if (!meta) return null;
        if (isLarge) {
          return (
            <div key={id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 20,
              background: `${colors.gold}18`, border: `1px solid ${colors.gold}33`,
              fontSize: 12, fontWeight: 600, color: colors.goldLight,
            }} title={meta.desc}>
              <span>{meta.emoji}</span>
              <span>{meta.label}</span>
            </div>
          );
        }
        return (
          <span key={id} style={{ fontSize: 13, cursor: 'default' }} title={`${meta.label}: ${meta.desc}`}>
            {meta.emoji}
          </span>
        );
      })}
    </div>
  );
}
