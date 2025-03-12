'use client';
import { useState, useEffect } from 'react';
import { socket } from '../socket';

export default function Home() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Initial fetch
    fetch('/api/clicks')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Received data:", data);
        setCount(data.count);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching count:', err);
        setError(err.message);
      });
    
    function onConnect() {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    }
    
    function onDisconnect() {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    }
    
    function onClickUpdate(data: { count: number }) {
      console.log('Received update:', data);
      setCount(data.count);
    }
    
    // Set up event listeners
    if (socket.connected) {
      onConnect();
    }
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('click-update', onClickUpdate);
    
    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('click-update', onClickUpdate);
    };
  }, []);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clicks', { method: 'POST' });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setCount(data.count);
      setError(null);
    } catch (error) {
      console.error('Error recording click:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Redis Click Counter</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      <p className="text-2xl mb-4">Count: {count}</p>
      <p className="text-sm mb-4">
        WebSocket Status: {isConnected ? 'Connected' : 'Disconnected'}
      </p>
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Clicking...' : 'Click Me!'}
      </button>
    </main>
  );
}