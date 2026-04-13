import React, { useState } from 'react';
import { authenticateAndConnect, setDisplayName } from '../nakama';

export default function Login({ onDone }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!name.trim()) { setError('Please enter a name'); return; }
    setLoading(true);
    try {
      const sess = await authenticateAndConnect();
      await setDisplayName(name.trim());
      localStorage.setItem('displayName', name.trim());
      console.log("Calling onDone with sess:", sess);
      onDone(sess);
    } catch (e) {
      console.error("Login error:", e);
      setError('Connection failed. Is Nakama running?');
      setLoading(false);
    }
  }
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>✕ ○</h1>
        <h2 style={styles.subtitle}>Tic Tac Toe</h2>
        <p style={styles.label}>Enter your nickname</p>
        <input
          style={styles.input}
          placeholder="Your nickname"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Connecting...' : 'Play'}
        </button>
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
    padding: 48,
    width: 360,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: 48,
    textAlign: 'center',
    color: '#00d4aa',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 24,
    color: '#ffffff',
  },
  label: {
    color: '#aaa',
    fontSize: 14,
  },
  input: {},
  error: {
    color: '#ff6b6b',
    fontSize: 14,
  },
  button: {
    background: '#00d4aa',
    color: '#0f0f1a',
    padding: '14px',
    fontSize: 18,
    borderRadius: 8,
    marginTop: 8,
  },
};