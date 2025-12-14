import { useState } from 'react';
import { Users, Calendar, Clock, Sun, Moon, Play, StopCircle } from 'lucide-react';
import { GameTimer } from './components/GameTimer';
import { Players } from './components/Players';
import { Schedule } from './components/Schedule';
import ReloadPrompt from './components/ReloadPrompt';
import { useIndexedDBState } from './hooks/useIndexedDBState';

const GrandSlamApp = () => {
    // Core state
    const [minutes, setMinutes] = useState(20);
    const {
        state: players,
        setState: setPlayers,
        isLoading,
        error,
    } = useIndexedDBState<string[]>('playerList', []); // Array of player names
    
    const [activePlayers, setActivePlayers] = useState<string[]>([]);
    const [playHistory, setPlayHistory] = useState<any[]>([]);
    const [isTimerActive, setIsTimerActive] = useState(false);

    // UI state
     const {
        state: darkMode,
        setState: setDarkMode,
    } = useIndexedDBState<boolean>('darkMode', false);
    const [activeTab, setActiveTab] = useState('players');

    return (
        <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900'}`}>
            <ReloadPrompt />
            {/* Header */}
            <div className={`sticky top-0 z-50 backdrop-blur-lg ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-xl ${darkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'} shadow-lg`}>
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Grand Slam
                                </h1>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Tennis Doubles Scheduler
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-3 rounded-xl transition-all duration-300 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} shadow-lg hover:shadow-xl`}
                        >
                            {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className={`flex items-center space-x-2 p-1 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    {[
                        { key: 'players', label: 'Players', icon: Users },
                        { key: 'schedule', label: 'Draw', icon: Calendar },
                        { key: 'timer', label: 'Timer', icon: Clock }
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${activeTab === key
                                    ? `${darkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white shadow-lg`
                                    : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{label}</span>
                        </button>
                    ))}
                    {/* Timer Indicator: Timer is running */}
                    <div className="ml-auto flex flex-shrink-0 items-center justify-center p-2">
                        {isTimerActive ? <Play className='h-5 w-5 text-green-500' /> : <StopCircle className='h-5 w-5 text-red-600' />}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 pb-8">
                <div style={{ display: activeTab === 'players' ? 'block' : 'none' }}>
                    {isLoading && <div className={`text-center p-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading players...</div>}
                    {error && <div className={`text-center p-8 text-red-500`}>Error loading players: {error.message}</div>}
                    {!isLoading && !error && (
                        <Players
                            darkMode={darkMode}
                            players={players}
                            setPlayers={setPlayers}
                            activePlayers={activePlayers}
                            setActivePlayers={setActivePlayers}
                        />
                    )}
                </div>

                <div style={{ display: activeTab === 'schedule' ? 'block' : 'none' }}>
                    <Schedule darkMode={darkMode} activePlayers={activePlayers} playHistory={playHistory} setPlayHistory={setPlayHistory}/>
                </div>

                <div style={{ display: activeTab === 'timer' ? 'block' : 'none' }}>
                    <GameTimer darkMode={darkMode} minutes={minutes} setMinutes={setMinutes} isTimerActive={isTimerActive} setIsTimerActive={setIsTimerActive} />
                </div>
            </div>

            {/* Footer */}
            <div className={`max-w-6xl mx-auto px-4 py-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="text-sm">
                    v1.2.1 © {new Date().getFullYear()} Grand Slam. All rights reserved.
                </p>
                <p className="text-xs mt-2">
                    Built with ☕️ in New Zealand by <a href="https://github.com/iamgbsmith?ref=grandslam" target="_blank" className="text-blue-500 hover:underline">Greg Smith</a>.
                </p>
            </div>
       
        </div>
    );
};

export default GrandSlamApp;