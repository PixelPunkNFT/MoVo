import { createContext, useContext, useState, useCallback } from 'react';
import { bookingService } from '../services/bookingService';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [myBookings, setMyBookings] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const bookRide = useCallback(async (rideId, data) => {
    const res = await bookingService.bookRide(rideId, data);
    return res.data.booking;
  }, []);

  const getMyBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingService.getMyBookings();
      setMyBookings(res.data.bookings);
    } finally { setLoading(false); }
  }, []);

  const getReceivedBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingService.getReceived();
      setReceivedBookings(res.data.bookings);
    } finally { setLoading(false); }
  }, []);

  const confirmBooking = useCallback(async (id) => {
    const res = await bookingService.confirm(id);
    setReceivedBookings(prev => prev.map(b => b._id === id ? res.data.booking : b));
  }, []);

  const rejectBooking = useCallback(async (id, reason) => {
    const res = await bookingService.reject(id, { reason });
    setReceivedBookings(prev => prev.map(b => b._id === id ? res.data.booking : b));
  }, []);

  const completeBooking = useCallback(async (id) => {
    const res = await bookingService.complete(id);
    setReceivedBookings(prev => prev.map(b => b._id === id ? res.data.booking : b));
  }, []);

  const cancelBooking = useCallback(async (id, reason) => {
    await bookingService.cancel(id, { reason });
    setMyBookings(prev => prev.filter(b => b._id !== id));
  }, []);

  return (
    <BookingContext.Provider value={{ myBookings, receivedBookings, loading, bookRide, getMyBookings, getReceivedBookings, confirmBooking, rejectBooking, completeBooking, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBookings = () => useContext(BookingContext);
