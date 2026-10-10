import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, CheckCircle2, XCircle, RefreshCw, Wifi } from 'lucide-react';

const API_URL = 'http://localhost:5000';

export default function LabMonitor() {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [error, setError] = useState(null);

  const fetchSystems = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL + '/api/lab-systems');
      if (!res.ok) throw new Error('Failed to load lab systems');
      const data = await res.json();
      setSystems(data);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystems();
    const interval = setInterval(() => fetchSystems(true), 30000);
    return () => clearInterval(interval);
  }, [fetchSystems]);

  const handleToggle = async (system) => {
    setToggling(system.system_no);
    try {
      const res = await fetch(API_URL + '/api/lab-systems/' + system.system_no, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!res.ok) throw new Error('Toggle failed');
      const updated = await res.json();
      setSystems(prev => prev.map(s => s.system_no === updated.system_no ? updated : s));
    } catch (err) {
      setError(err.message);
    } finally {
      setToggling(null);
    }
  };

  const occupiedCount = systems.filter(s => s.is_occupied).length;
  const availableCount = systems.length - occupiedCount;

  const formatTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const spinStyle = { animation: 'spin 1s linear infinite' };

  return (
    <div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.06); }
        }
        .sys-btn { transition: all 0.25s cubic-bezier(0.4,0,0.2,1) !important; }
        .sys-btn:not(:disabled):hover {
          transform: translateY(-4px) scale(1.03) !important;
          filter: brightness(1.12);
        }
      `}</style>

      <div style={{ marginBottom: '2rem' }}>

        {/* Title Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(6,182,212,0.4)'
            }}>
              <Monitor size={26} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f3f4f6', margin: 0 }}>
                Lab System Monitor
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>
                Click a system card to mark it occupied or release it
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchSystems()}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#9ca3af', padding: '0.55rem 1.1rem',
              borderRadius: '10px', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: '600', fontFamily: 'inherit'
            }}
          >
            <RefreshCw size={15} style={loading ? spinStyle : {}} />
            Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.28)',
            borderRadius: '12px', padding: '0.6rem 1.2rem'
          }}>
            <CheckCircle2 size={18} color="#34d399" />
            <span style={{ color: '#34d399', fontWeight: '700', fontSize: '1.15rem' }}>{availableCount}</span>
            <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Available</span>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: 'rgba(251,146,60,0.1)',
            border: '1px solid rgba(251,146,60,0.28)',
            borderRadius: '12px', padding: '0.6rem 1.2rem'
          }}>
            <XCircle size={18} color="#fb923c" />
            <span style={{ color: '#fb923c', fontWeight: '700', fontSize: '1.15rem' }}>{occupiedCount}</span>
            <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Occupied</span>
          </div>

          {lastRefreshed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#4b5563', fontSize: '0.78rem', marginLeft: 'auto' }}>
              <Wifi size={13} />
              Synced {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
          )}
        </div>

        {error && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
      </div>

      {/* Systems Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#4b5563' }}>
          <RefreshCw size={32} style={spinStyle} />
          <p style={{ marginTop: '1rem' }}>Loading systems...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', gap: '0.9rem' }}>
          {systems.map((system) => {
            const isOccupied = system.is_occupied;
            const isBusy = toggling === system.system_no;
            return (
              <button
                key={system.system_no}
                className="sys-btn"
                onClick={() => handleToggle(system)}
                disabled={isBusy}
                title={isOccupied ? 'Click to release this system' : 'Click to mark as occupied'}
                style={{
                  position: 'relative',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '0.45rem', padding: '1.2rem 0.5rem', borderRadius: '16px',
                  border: isOccupied
                    ? '2px solid rgba(251,146,60,0.55)'
                    : '2px solid rgba(16,185,129,0.4)',
                  background: isOccupied
                    ? 'linear-gradient(135deg,rgba(251,146,60,0.16) 0%,rgba(239,68,68,0.09) 100%)'
                    : 'linear-gradient(135deg,rgba(16,185,129,0.12) 0%,rgba(6,182,212,0.07) 100%)',
                  boxShadow: isOccupied
                    ? '0 4px 20px rgba(251,146,60,0.2)'
                    : '0 4px 14px rgba(16,185,129,0.1)',
                  cursor: isBusy ? 'wait' : 'pointer',
                  transform: isBusy ? 'scale(0.93)' : 'scale(1)',
                  opacity: isBusy ? 0.6 : 1,
                  fontFamily: 'inherit'
                }}
              >
                {isOccupied && (
                  <span style={{
                    position: 'absolute', inset: '-3px', borderRadius: '18px',
                    border: '2px solid rgba(251,146,60,0.4)',
                    animation: 'pulse-ring 2.2s ease-in-out infinite',
                    pointerEvents: 'none'
                  }} />
                )}

                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: isOccupied ? 'rgba(251,146,60,0.18)' : 'rgba(16,185,129,0.14)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Monitor size={22} color={isOccupied ? '#fb923c' : '#34d399'} />
                </div>

                <span style={{ fontSize: '0.95rem', fontWeight: '800', color: isOccupied ? '#fb923c' : '#34d399', letterSpacing: '-0.02em' }}>
                  Sys {system.system_no}
                </span>

                <span style={{
                  fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: isOccupied ? '#fdba74' : '#6ee7b7',
                  padding: '0.12rem 0.45rem', borderRadius: '5px',
                  background: isOccupied ? 'rgba(251,146,60,0.14)' : 'rgba(16,185,129,0.12)'
                }}>
                  {isBusy ? '...' : isOccupied ? 'Occupied' : 'Free'}
                </span>

                {isOccupied && system.occupied_at && (
                  <span style={{ fontSize: '0.6rem', color: '#6b7280' }}>
                    {formatTime(system.occupied_at)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
