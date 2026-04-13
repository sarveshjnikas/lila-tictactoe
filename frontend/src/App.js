import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Result from './pages/Result';
import { authenticateAndConnect } from './nakama';

export default function App() {
  const [page, setPage] = useState('loading');
  const [matchId, setMatchId] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('displayName');
    if (savedName) {
      authenticateAndConnect()
        .then((sess) => {
          setUserId(sess.userId);
          setPage('lobby');
        })
        .catch((e) => {
          console.error('Auto reconnect failed:', e);
          localStorage.removeItem('displayName');
          setPage('login');
        });
    } else {
      setPage('login');
    }
  }, []);

  function goToLobby() { setPage('lobby'); }
  function goToGame(id) { setMatchId(id); setPage('game'); }
  function goToResult(result) { setGameResult(result); setPage('result'); }

  function handleLoginDone(sess) {
    setUserId(sess.userId);
    goToLobby();
  }

  return (
    <div>
      {page === 'loading' && (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4aa', fontSize: 24 }}>
          Connecting...
        </div>
      )}
      {page === 'login' && <Login onDone={handleLoginDone} />}
      {page === 'lobby' && <Lobby onMatchFound={goToGame} />}
      {page === 'game' && <Game matchId={matchId} userId={userId} onGameOver={goToResult} />}
      {page === 'result' && <Result result={gameResult} onPlayAgain={goToLobby} />}
    </div>
  );
}