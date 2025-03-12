'use client';
import { useState, useEffect } from 'react';
export default function Home() {
  const [clickCount, setClickCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClickCount();


    const intervalId = setInterval(() => {
      fetchClickCount();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchClickCount = async () => {
    try {
      const response = await fetch('/api/clicks');
      const data = await response.json();
      setClickCount(data.count);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching click count:', error);
      setLoading(false);
    }
  };

  const handleClick = async () => {
    try {
      const response = await fetch('/api/clicks', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setClickCount(data.count);
        setRemainingAttempts(data.remainingAttempts);
      } else {
        setIsRateLimited(true);
        setRemainingAttempts(data.remainingAttempts);

        // Reset rate limited status after a delay
        setTimeout(() => {
          setIsRateLimited(false);
        }, 10000);
      }
    } catch (error) {
      console.error('Error recording click:', error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Redis Click Counter</h1>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="text-6xl font-bold mb-2">{clickCount}</div>
              <p className="text-xl">Total Clicks</p>
            </div>

            <div className="flex flex-col items-center">
              <button
                onClick={handleClick}
                disabled={isRateLimited}
                className={`px-6 py-3 rounded-lg text-white font-bold text-lg transition-colors ${isRateLimited
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                Click Me!
              </button>

              {isRateLimited && (
                <p className="mt-4 text-red-500">
                  Rate limited! Too many clicks too quickly.
                </p>
              )}

              <p className="mt-2">
                Remaining attempts: {remainingAttempts}/10
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}