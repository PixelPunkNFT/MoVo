import { colors } from '../config/theme';

export default function LoadingSpinner({ text }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 0', gap: 16,
    }}>
      <img src="/Movo.png" alt="Caricamento..." style={styles.spinner} />
      {text && <span style={{ fontSize: 13, color: colors.textHint }}>{text}</span>}
    </div>
  );
}

const styles = {
  spinner: {
    width: 192, height: 192, objectFit: 'contain',
    animation: 'spin 1s linear infinite',
  },
};
