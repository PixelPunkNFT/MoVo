import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { rideService } from '../services/rideService';

const RideContext = createContext(null);

export function RideProvider({ children }) {
  const [rides, setRides] = useState([]);
  const [myRides, setMyRides] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const searchIdRef = useRef(0);
  const abortRef = useRef(null);

  const searchRides = useCallback(async (params) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const searchId = ++searchIdRef.current;
    setLoading(true);
    try {
      const res = await rideService.search(params, { signal: controller.signal });
      if (searchId !== searchIdRef.current) return;
      setRides(res.data.rides);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      throw err;
    } finally {
      if (searchId === searchIdRef.current) setLoading(false);
    }
  }, []);

  const createRide = useCallback(async (data) => {
    const res = await rideService.create(data);
    return res.data.ride;
  }, []);

  const getRideById = useCallback(async (id) => {
    const res = await rideService.getById(id);
    return res.data.ride;
  }, []);

  const getMyRidesAsDriver = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rideService.getMyRidesAsDriver();
      setMyRides(res.data.rides);
    } finally { setLoading(false); }
  }, []);

  const cancelRide = useCallback(async (id) => {
    await rideService.cancel(id);
    setMyRides(prev => prev.filter(r => r._id !== id));
  }, []);

  const createSpontaneousRide = useCallback(async (data) => {
    const res = await rideService.createSpontaneous(data);
    return res.data.ride;
  }, []);

  const joinSpontaneousRide = useCallback(async (rideId) => {
    const res = await rideService.joinSpontaneous(rideId);
    return res.data;
  }, []);

  return (
    <RideContext.Provider value={{ rides, myRides, totalPages, loading, searchRides, createRide, getRideById, getMyRidesAsDriver, cancelRide, createSpontaneousRide, joinSpontaneousRide }}>
      {children}
    </RideContext.Provider>
  );
}

export const useRides = () => useContext(RideContext);
