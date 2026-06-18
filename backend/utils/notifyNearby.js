const User = require('../models/User.model');
const Notification = require('../models/Notification.model');
const { emitToUser } = require('../sockets/socketState');

async function notifyNearbyUsers(ride) {
  try {
    const departureCoords = ride.departure?.location?.coordinates;
    if (!departureCoords || departureCoords[0] === 0) return;

    const nearbyUsers = await User.find({
      _id: { $ne: ride.driver },
      nearbyAlerts: true,
      lastLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: departureCoords },
          $maxDistance: 5000,
        },
      },
    });

    const destName = ride.destination?.name || ride.destination?.address || 'un locale';
    const time = ride.departure?.dateTime
      ? new Date(ride.departure.dateTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      : '';
    const seats = ride.remainingSeats || ride.availableSeats || '?';

    const title = ride.spontaneous
      ? `⚡ Passaggio per ${destName}!`
      : `🚗 Passaggio per ${destName}`;
    const message = ride.spontaneous
      ? `${ride.driver?.firstName} va al ${destName} stasera${time ? ' alle ' + time : ''}! ${seats} posti liberi.`
      : `${ride.driver?.firstName} parte${time ? ' alle ' + time : ''} per ${destName} da ${ride.departure?.address}. ${seats} posti a ${ride.pricePerSeat}€.`;

    const notifications = nearbyUsers.map(u => ({
      user: u._id,
      type: 'ride_imminent',
      title,
      message,
      data: { rideId: ride._id, destination: destName },
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      for (const u of nearbyUsers) {
        emitToUser(u._id, 'notification', {
          type: 'ride_imminent',
          title,
          message,
          data: { rideId: ride._id, destination: destName },
        });
      }
    }
  } catch (err) {
    console.error('Errore notifyNearbyUsers:', err.message);
  }
}

module.exports = { notifyNearbyUsers };
