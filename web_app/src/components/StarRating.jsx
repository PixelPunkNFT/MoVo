import { colors } from '../config/theme';

export default function StarRating({ rating, max = 5, size = 16, interactive = false, onChange }) {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    const filled = i <= Math.round(rating);
    stars.push(
      <span
        key={i}
        style={{ cursor: interactive ? 'pointer' : 'default', fontSize: size, color: filled ? '#FFD23F' : colors.textHint }}
        onClick={() => interactive && onChange?.(i)}
      >
        ★
      </span>
    );
  }
  return <div style={{ display: 'inline-flex', gap: 2 }}>{stars}</div>;
}
