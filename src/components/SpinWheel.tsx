'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  wheelSegments, 
  canUserSpin, 
  spinWheel, 
  getUserSpinData, 
  getTimeUntilNextSpin, 
  formatTimeUntilNextSpin,
  createWheelTransaction
} from '@/services/SpinWheelService';
import { Coins, RotateCw, Clock, Gift, AlertTriangle } from 'lucide-react';

// Define spin wheel props
interface SpinWheelProps {
  onSpin?: (reward: number) => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ onSpin }) => {
  const authContext = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [canSpin, setCanSpin] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [reward, setReward] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const spinButtonRef = useRef<HTMLButtonElement>(null);
  const resultTimeout = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!authContext || !authContext.user) {
      return;
    }
    
    // Check if user can spin
    const userCanSpin = canUserSpin(authContext.user.id);
    setCanSpin(userCanSpin);
    
    // If user can't spin, start countdown
    if (!userCanSpin) {
      updateCountdown();
      countdownInterval.current = setInterval(updateCountdown, 1000);
    }
    
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
      if (resultTimeout.current) {
        clearTimeout(resultTimeout.current);
      }
    };
  }, [authContext]);
  
  // Update countdown timer
  const updateCountdown = () => {
    if (!authContext || !authContext.user) {
      return;
    }
    
    const timeUntilNextSpin = getTimeUntilNextSpin(authContext.user.id);
    const formattedTime = formatTimeUntilNextSpin(timeUntilNextSpin);
    setCountdown(formattedTime);
    
    // If time is up, allow spinning
    if (timeUntilNextSpin <= 0) {
      setCanSpin(true);
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    }
  };
  
  // Handle wheel spin
  const handleSpin = async () => {
    if (!authContext || !authContext.user || isSpinning || !canSpin) {
      return;
    }
    
    try {
      setIsSpinning(true);
      setError(null);
      setShowResult(false);
      
      // Get spin result
      const result = spinWheel(authContext.user.id);
      if (!result) {
        setError('Çark çevirme işlemi şu anda gerçekleştirilemiyor. Lütfen daha sonra tekrar deneyin.');
        setIsSpinning(false);
        return;
      }
      
      // Find the selected segment
      const segmentIndex = wheelSegments.findIndex(seg => seg.id === result.segmentId);
      setSelectedSegment(segmentIndex);
      setReward(result.reward);
      
      // Calculate rotation to land on the selected segment
      // We need to rotate several full turns + the angle to the segment
      const segmentAngle = 360 / wheelSegments.length;
      const segmentPosition = 360 - (segmentAngle * segmentIndex + segmentAngle / 2); // Center of segment
      const fullTurns = 5 * 360; // 5 full rotations for effect
      const newRotation = fullTurns + segmentPosition + Math.random() * 5; // Small random adjustment
      
      setRotation(newRotation);
      
      // Wait for animation to complete then show result
      setTimeout(async () => {
        setShowResult(true);
        
        // Update user's JackPoints
        try {
          if (authContext && authContext.user) {
            const transaction = createWheelTransaction(authContext.user.id, result.reward);
            await authContext.updateJackPoints(result.reward, transaction.description, 'bonus');
            if (onSpin) {
              onSpin(result.reward);
            }
          }
        } catch (error) {
          console.error('Error updating JackPoints:', error);
          setError('JackPoint ödülünüz eklenirken bir hata oluştu.');
        }
        
        // Reset wheel after showing result for a while
        resultTimeout.current = setTimeout(() => {
          setShowResult(false);
          setIsSpinning(false);
          setCanSpin(false);
          updateCountdown();
          countdownInterval.current = setInterval(updateCountdown, 1000);
        }, 3000);
      }, 5000); // Wait 5 seconds for wheel animation
    } catch (error) {
      console.error('Error during spin:', error);
      setError('Çark çevirme sırasında bir hata oluştu.');
      setIsSpinning(false);
    }
  };
  
  // Calculate each segment's size
  const segmentAngle = 360 / wheelSegments.length;
  
  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold text-center mb-4">Çark Çevir</h2>
      <p className="text-center text-gray-300 mb-6">
        Her 24 saatte bir çarkı çevirerek JackCoin kazanabilirsiniz!
      </p>
      
      {error && (
        <div className="bg-red-900/30 text-red-300 border border-red-800 p-3 rounded-md mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="relative mb-4" style={{ width: '300px', height: '300px' }}>
        {/* Wheel Marker/Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-l-transparent border-r-transparent border-t-[#FF6B00]"></div>
        </div>
        
        {/* Wheel */}
        <div 
          ref={wheelRef}
          className="w-full h-full rounded-full overflow-hidden relative transition-transform duration-5000 ease-out"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isSpinning ? '5s' : '0s',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          {wheelSegments.map((segment, index) => {
            // Calculate rotation for this segment
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            
            // Create a conical gradient for each segment
            return (
              <div 
                key={segment.id}
                className="absolute top-0 left-0 w-full h-full flex items-center justify-center font-bold"
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180)}%)`,
                  backgroundColor: segment.color,
                }}
              >
                <div 
                  className="absolute text-white font-bold text-lg"
                  style={{ 
                    transform: `rotate(${segmentAngle / 2 + segmentAngle * index - 90}deg) translateX(100px)` 
                  }}
                >
                  {segment.label || segment.value}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Center button */}
        <button
          ref={spinButtonRef}
          onClick={handleSpin}
          disabled={!canSpin || isSpinning}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 rounded-full flex items-center justify-center text-white font-bold transition-all ${
            canSpin && !isSpinning ? 'bg-[#FF6B00] hover:bg-[#FF8800] cursor-pointer' : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          {isSpinning ? (
            <RotateCw className="w-6 h-6 animate-spin" />
          ) : canSpin ? (
            <span>ÇEVİR</span>
          ) : (
            <Clock className="w-6 h-6" />
          )}
        </button>
      </div>
      
      {/* Results or Timer */}
      {showResult ? (
        <div className="mt-4 bg-green-900/30 border border-green-800 rounded-lg p-4 text-center">
          <h3 className="text-xl font-bold text-green-300 flex items-center justify-center mb-2">
            <Gift className="w-6 h-6 mr-2" />
            Tebrikler!
          </h3>
          <p className="text-white mb-1">Ödülünüz:</p>
          <div className="flex items-center justify-center text-2xl font-bold text-yellow-400">
            <Coins className="w-6 h-6 mr-2" />
            {reward} JackCoin
          </div>
        </div>
      ) : !canSpin && !isSpinning ? (
        <div className="mt-4 bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <h3 className="text-md font-semibold text-gray-300 mb-1">Sonraki Çevirme:</h3>
          <div className="text-xl font-bold text-white">{countdown}</div>
        </div>
      ) : null}
      
      {/* Recent Wins/History (Optional) */}
      {authContext && authContext.user && (
        <div className="mt-6 w-full">
          <h3 className="text-lg font-semibold mb-2">Son Kazançlarınız</h3>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {getUserSpinData(authContext.user.id).spinHistory.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {getUserSpinData(authContext.user.id).spinHistory.slice(0, 5).map((result) => (
                  <div key={result.id} className="p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <Coins className="w-5 h-5 text-yellow-400 mr-2" />
                      <span className="font-semibold">{result.reward} JackCoin</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-4 text-center text-gray-400">Henüz çark çevirmediniz.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinWheel; 