import React, { useState, useEffect } from 'react';
import { findMatch, listMatches, joinMatch } from '../nakama';

export default function Lobby({ onMatchFound }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const name = localStorage.getItem('displayName') || 'Player';

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      const result = await listMatches();
      setMatches(result.matches);
    } catch (e) {
      console.error('Failed to list matches', e);
    }
  }

  async function handleFindMatch() {
    setLoading(true);
    setStatus('Finding a match...');
    try {
      const result = await findMatch();
      await joinMatch(result.matchId);
      onMatchFound(result.matchId);
    } catch (e) {
      setStatus('Failed to find match. Try again.');
      setLoading(false);
    }
  }

  async function handleJoinMatch(matchId) {
    setLoading(true);
    setStatus('Joining match...');
    try {
      await joinMatch(matchId);
      onMatchFound(matchId);
    } catch (e) {
      setStatus('Failed to join match. Try again.');
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.welcome}>Welcome, {name}! 👋</h2>
        <h3 style={styles.title}>Lobby</h3>

        {status && <p style={styles.status}>{status}</p>}

        <button style={styles.primaryBtn} onClick={handleFindMatch} disabled={loading}>
          {loading ? 'Please wait...' : '⚡ Auto Match'}
        </button>

        <div style={styles.divider}>
          <span>or browse open rooms</span>
        </div>

        <button style={styles.refreshBtn} onClick={loadMatches}>
          🔄 Refresh Rooms
        </button>

        {matches.length === 0 ? (
          <p style={styles.noMatches}>No open rooms. Create one by clicking Auto Match!</p>
        ) : (
          <div style={styles.matchList}>
            {matches.map((match, i) => (
              <div key={match.matchId} style={styles.matchRow}>
                <span style={styles.matchInfo}>
                  Room {i + 1} — {match.players}/2 players
                </span>
                <button
                  style={styles.joinBtn}
                  onClick={() => handleJoinMatch(match.matchId)}
                  disabled={loading}
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: '#1a1a2e',
    borderRadius: 16,
    padding: 40,
    width: 400,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  welcome: {
    color: '#00d4aa',
    fontSize: 18,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
  },
  status: {
    color: '#f0c040',
    fontSize: 14,
  },
  primaryBtn: {
    background: '#00d4aa',
    color: '#0f0f1a',
    padding: '14px',
    fontSize: 18,
  },
  divider: {
    textAlign: 'center',
    color: '#555',
    fontSize: 13,
    borderTop: '1px solid #333',
    paddingTop: 16,
  },
  refreshBtn: {
    background: '#2a2a3e',
    color: '#aaa',
    fontSize: 14,
    padding: '10px',
  },
  noMatches: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
  },
  matchList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  matchRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#2a2a3e',
    borderRadius: 8,
    padding: '12px 16px',
  },
  matchInfo: {
    color: '#ccc',
    fontSize: 14,
  },
  joinBtn: {
    background: '#00d4aa',
    color: '#0f0f1a',
    padding: '8px 16px',
    fontSize: 14,
  },
};