import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';

interface GameTimerProps {
  darkMode: boolean;
  minutes: number;
  setMinutes: Dispatch<SetStateAction<number>>;
  isTimerActive: boolean;
  setIsTimerActive: Dispatch<SetStateAction<boolean>>;
}

export function GameTimer({
    darkMode,
    minutes,
    setMinutes,
    isTimerActive,
    setIsTimerActive
}:GameTimerProps) {
    // Timer state
    // const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20 * 60);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const resetTimer = () => {
        // setIsActive(false);
        setIsTimerActive(false);
        setTimeLeft(minutes * 60);
    };

    // Refs
    const audioRef = useRef<{ play: () => void } | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    // Initialize audio context for chime sound
    useEffect(() => {
        const createChime = () => {
            const audioContext = new ((window.AudioContext || (window as any).webkitAudioContext))();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        };

        audioRef.current = { play: createChime };
    }, []);

    useEffect(() => {
        if (isTimerActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsTimerActive(false);
                        if (audioRef.current) {
                            audioRef.current.play();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current ?? undefined);
        }

        return () => clearInterval(intervalRef.current ?? undefined);
    }, [isTimerActive, timeLeft, setIsTimerActive]);

    // Timer logic
    useEffect(() => {
        setTimeLeft(minutes * 60 );
    }, [minutes]);

    return (
        <div className="space-y-6">
            <div className={`p-8 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="text-center space-y-6">
                    <h2 className="text-2xl font-bold">Match Timer</h2>

                    {/* Timer Display */}
                    <div className={`text-8xl font-bold font-mono ${timeLeft <= 60 ? 'text-red-500' : darkMode ? 'text-purple-400' : 'text-purple-600'} transition-colors duration-500`}>
                        {formatTime(timeLeft)}
                    </div>

                    {/* Timer Controls */}
                    <div className="flex items-center justify-center space-x-4">
                        <button
                            onClick={() => setIsTimerActive(!isTimerActive)}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${isTimerActive
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-green-600 hover:bg-green-700'
                                } text-white shadow-lg hover:shadow-xl`}
                        >
                            {isTimerActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            <span>{isTimerActive ? 'Pause' : 'Start'}</span>
                        </button>

                        <button
                            onClick={resetTimer}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-600 hover:bg-gray-700'} text-white shadow-lg hover:shadow-xl`}
                        >
                            <RotateCcw className="h-5 w-5" />
                            <span>Reset</span>
                        </button>
                    </div>

                    {/* Time Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Set Timer</h3>
                        <div className="flex items-center justify-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium">Minutes:</label>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setMinutes(Math.max(0, minutes - 1))}
                                        className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-12 text-center font-mono text-lg">{minutes}</span>
                                    <button
                                        onClick={() => setMinutes(minutes + 1)}
                                        className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
