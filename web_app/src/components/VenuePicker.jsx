import { useState, useEffect, useRef } from 'react';
import { venueService } from '../services/venueService';
import { colors } from '../config/theme';

export default function VenuePicker({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const trimmed = query.trim();
    if (!trimmed) { setSuggestions([]); return; }
    timerRef.current = setTimeout(async () => {
      try {
        const res = await venueService.search(trimmed);
        setSuggestions(res.data.venues);
        setOpen(true);
      } catch { setSuggestions([]); }
    }, 250);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (venue) => {
    setQuery(venue.name);
    setOpen(false);
    onChange({
      name: venue.name,
      address: venue.address || '',
      city: venue.city || 'Roma',
      location: venue.location || { type: 'Point', coordinates: [12.4964, 41.9028] }
    });
  };

  const handleCreate = () => {
    const name = query.trim();
    if (!name) return;
    setOpen(false);
    onChange({
      name,
      address: '',
      city: 'Roma',
      location: { type: 'Point', coordinates: [12.4964, 41.9028] }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleCreate(); }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        style={s.input}
        type="text"
        placeholder={placeholder || 'Dove vai?'}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
        onKeyDown={handleKeyDown}
      />
      {open && suggestions.length > 0 && (
        <div style={s.dropdown}>
          {suggestions.map(v => (
            <button key={v._id} type="button" style={s.item} onClick={() => handleSelect(v)}>
              <span style={s.icon}>📍</span>
              <div>
                <div style={s.itemName}>{v.name}</div>
                {v.address && <div style={s.itemAddr}>{v.address}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
      {open && query.trim() && suggestions.length === 0 && (
        <div style={s.dropdown}>
          <button type="button" style={s.item} onClick={handleCreate}>
            <span style={s.icon}>➕</span>
            <div>
              <div style={s.itemName}>Crea "{query.trim()}"</div>
              <div style={s.itemAddr}>Nuovo locale</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

const s = {
  input: {
    width: '100%', padding: '12px 14px', border: 'none', borderRadius: 10,
    background: colors.surface, color: colors.textPrimary, fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
    marginTop: 4, borderRadius: 10, overflow: 'hidden',
    background: '#1a1d24', border: `1px solid ${colors.glassBorder}`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  item: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', border: 'none', background: 'transparent',
    color: colors.textPrimary, fontSize: 13, cursor: 'pointer',
    textAlign: 'left', fontFamily: 'inherit',
    borderBottom: `1px solid ${colors.glassBorder}`,
  },
  icon: { fontSize: 16, flexShrink: 0 },
  itemName: { fontWeight: 600 },
  itemAddr: { fontSize: 11, color: colors.textHint, marginTop: 1 },
};
