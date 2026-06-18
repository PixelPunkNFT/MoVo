const BADGE_DEFS = {
  'verified-driver': { label: 'Autista Verificato', emoji: '✅', desc: 'Identità verificata e almeno un passaggio completato' },
  'punctual': { label: 'Puntuale', emoji: '⏰', desc: 'Sempre in orario secondo le recensioni' },
  'super-host': { label: 'Super-host', emoji: '👑', desc: 'Alta valutazione e tanti passaggi completati' },
  'music-lover': { label: 'Music Lover', emoji: '🎵', desc: 'Ama viaggiare con la musica giusta' },
};

function computeBadges(user) {
  const badges = [];
  if ((user.isPhoneVerified || user.isIDVerified) && user.totalRidesAsDriver >= 1) {
    badges.push('verified-driver');
  }
  if (user.totalReviews >= 3 && user.rating >= 4.5) {
    badges.push('punctual');
  }
  if (user.totalRidesAsDriver >= 10 && user.totalReviews >= 5 && user.rating >= 4.8) {
    badges.push('super-host');
  }
  if (user.preferences?.musicPreference && user.preferences.musicPreference !== 'nessuna') {
    badges.push('music-lover');
  }
  return badges;
}

module.exports = { BADGE_DEFS, computeBadges };
