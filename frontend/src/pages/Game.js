import React, { useState, useEffect, useRef } from 'react';
import { getSocket, getSession, sendMove } from '../nakama';

export default function Game({ matchId, userId, onGameOver }) {
  const [board, setBoard] = useState(Array(9).fill(''));
  const [status, setStatus] = useState('Waiting for opponent...');
  const [mySymbol, setMySymbol] = useState('');

  const myUserIdRef = useRef('');
  const mySymbolRef = useRef('');
  const playerXRef = useRef('');
  const playerORef = useRef('');
  const currentTurnRef = useRef('');

  useEffect(() => {
    myUserIdRef.current = userId;
    console.log('My user ID:', userId);

    const socket = getSocket();

    socket.onmatchdata = (matchData) => {
      try {
        const decoded = new TextDecoder().decode(matchData.data);
        const data = JSON.parse(decoded);
        console.log('Match data received:', data);

        if (data.type === 'game_start') {
          playerXRef.current = data.playerX;
          playerORef.current = data.playerO;
          currentTurnRef.current = data.currentTurn;

          const symbol = data.playerX === myUserIdRef.current ? 'X' : 'O';
          mySymbolRef.current = symbol;

          setBoard(data.board);
          setMySymbol(symbol);
          setStatus(data.currentTurn === myUserIdRef.current ? 'Your turn!' : "Opponent's turn...");

          console.log('I am:', myUserIdRef.current, 'Symbol:', symbol, 'PlayerX:', data.playerX, 'PlayerO:', data.playerO);
        }

        if (data.type === 'game_update') {
          currentTurnRef.current = data.currentTurn;
          setBoard(data.board);
          setStatus(data.currentTurn === myUserIdRef.current ? 'Your turn!' : "Opponent's turn...");
        }

        if (data.type === 'game_over') {
            setBoard(prev => data.board || prev);
            setTimeout(() => {
              onGameOver({
                winner: data.winner,
                reason: data.reason,
                myUserId: myUserIdRef.current,
                playerX: playerXRef.current,
                playerO: playerORef.current,
                mySymbol: mySymbolRef.current,
              });
            }, 500);
          }
      } catch (e) {
        console.error('Match data error:', e);
      }
    };

    return () => {
      if (socket) socket.onmatchdata = null;
    };
  }, [matchId]);

  function handleCellClick(index) {
    if (currentTurnRef.current !== myUserIdRef.current) {
      console.log('Not your turn. Current:', currentTurnRef.current, 'Me:', myUserIdRef.current);
      return;
    }
    if (board[index] !== '') return;
    sendMove(matchId, index);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.playerTag}>
            <span style={{ color: '#00d4aa' }}>X</span>
            <span style={styles.playerName}>
              {playerXRef.current === myUserIdRef.current ? 'You' : 'Opponent'}
            </span>
          </div>
          <div style={styles.vsText}>VS</div>
          <div style={styles.playerTag}>
            <span style={{ color: '#ff6b6b' }}>O</span>
            <span style={styles.playerName}>
              {playerORef.current === myUserIdRef.current ? 'You' : 'Opponent'}
            </span>
          </div>
        </div>

        <p style={styles.status}>{status}</p>
        <p style={styles.symbol}>
          You are: <strong style={{ color: mySymbol === 'X' ? '#00d4aa' : '#ff6b6b' }}>
            {mySymbol || '...'}
          </strong>
        </p>

        <div style={styles.board}>
          {board.map((cell, i) => (
            <div
              key={i}
              style={{ ...styles.cell, color: cell === 'X' ? '#00d4aa' : '#ff6b6b' }}
              onClick={() => handleCellClick(i)}
            >
              {cell}
            </div>
          ))}
        </div>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  playerTag: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    fontSize: 28,
    fontWeight: 'bold',
  },
  playerName: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: 'normal',
  },
  vsText: {
    color: '#555',
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    color: '#f0c040',
    fontSize: 16,
    fontWeight: '600',
  },
  symbol: {
    color: '#aaa',
    fontSize: 14,
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
    width: '100%',
  },
  cell: {
    background: '#2a2a3e',
    borderRadius: 12,
    height: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 48,
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s',
    userSelect: 'none',
  },
};