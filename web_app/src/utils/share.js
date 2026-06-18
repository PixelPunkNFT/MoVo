const APP_URL = window.location.origin;

export function buildShareText(ride) {
  const dest = ride.destination?.name || 'un locale';
  const date = ride.departure?.dateTime
    ? new Date(ride.departure.dateTime).toLocaleString('it-IT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
    : '';
  const seats = ride.remainingSeats || ride.availableSeats || '?';
  const link = `${APP_URL}/rides/${ride._id}`;

  if (ride.spontaneous) {
    return `⚡ Vado al ${dest} stasera ${date ? 'alle ' + date : ''}! ${seats} posti liberi, chi viene? ${link}`;
  }
  return `🚗 Passaggio per ${dest}${date ? ' il ' + date : ''} - ${seats} posti a ${ride.pricePerSeat}€. ${link}`;
}

export function shareRide(ride) {
  const text = buildShareText(ride);
  const url = `${APP_URL}/rides/${ride._id}`;

  if (navigator.share) {
    navigator.share({ title: 'Passaggio Movo', text, url }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }
}

export function shareWhatsApp(ride) {
  const text = buildShareText(ride);
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

export function shareTelegram(ride) {
  const text = buildShareText(ride);
  const url = `${APP_URL}/rides/${ride._id}`;
  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
}
