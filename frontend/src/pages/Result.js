import React, { useState, useEffect } from 'react';
import { getSession } from '../nakama';

export default function Result({ result, onPlayAgain }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const session = getSession();
  const myUserId = session?.userId;
  const myName = localStorage.getItem('displayName') || 'You';

  const isWinner = result?.winner === myUserId;
  const isDraw = result?.winner === 'draw';
  const opponentLeft = result?.reason === 'opponent_left';

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch(
          'http://localhost:7350/v2/leaderboard/tictactoe_wins?limit=5',
          {
            headers: {
              Authorization: 'Bearer ' + session.token,
            },
          }
        );
        const data = await response.json();
        setLeaderboard(data.records || []);
      } catch (e) {
        console.error('Failed to fetch leaderboard', e);
      }
    }
    fetchLeaderboard();
  }, [session]);

  function getResultText() {
    if (isDraw) return "It's a Draw! 🤝";
    if (opponentLeft) return 'Opponent Left! 🏃';
    if (isWinner) return 'You Win! 🎉';
    return 'You Lose! 😞';
  }

  function getResultColor() {
    if (isDraw) return '#f0c040';
    if (isWinner || opponentLeft) return '#00d4aa';
    return '#ff6b6b';
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={{ ...styles.resultText, color: getResultColor() }}>
          {getResultText()}
        </h1>

        <div style={styles.divider} />

        <h3 style={styles.leaderboardTitle}>🏆 Leaderboard</h3>

        {leaderboard.length === 0 ? (
          <p style={styles.noData}>No leaderboard data yet</p>
        ) : (
          <div style={styles.leaderboardList}>
            {leaderboard.map((record, i) => (
              <div
                key={record.ownerId}
                style={{
                  ...styles.leaderboardRow,
                  background: record.ownerId === myUserId ? '#1e3a2e' : '#2a2a3e',
                }}
              >
                <span style={styles.rank}>#{i + 1}</span>
                <span style={styles.playerName}>
                  {record.ownerId === myUserId ? myName : record.username || 'Player'}
                </span>
                <span style={styles.score}>{record.score} wins</span>
              </div>
            ))}
          </div>
        )}

        <button style={styles.playAgainBtn} onClick={onPlayAgain}>
          Play Again
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
    padding: 40,
    width: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  resultText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    background: '#333',
  },
  leaderboardTitle: {
    color: '#ffffff',
    fontSize: 20,
    alignSelf: 'flex-start',
  },
  noData: {
    color: '#555',
    fontSize: 14,
  },
  leaderboardList: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  leaderboardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    padding: '12px 16px',
  },
  rank: {
    color: '#f0c040',
    fontWeight: 'bold',
    fontSize: 16,
    width: 30,
  },
  playerName: {
    color: '#ccc',
    fontSize: 14,
    flex: 1,
    paddingLeft: 8,
  },
  score: {
    color: '#00d4aa',
    fontWeight: 'bold',
    fontSize: 14,
  },
  playAgainBtn: {
    background: '#00d4aa',
    color: '#0f0f1a',
    padding: '14px 40px',
    fontSize: 18,
    width: '100%',
    marginTop: 8,
  },
};