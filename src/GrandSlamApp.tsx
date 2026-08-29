import { useState, useEffect } from 'react';
import { Users, Calendar, Clock, Sun, Moon, Play, StopCircle, X } from 'lucide-react';
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

    // Number of courts available, persisted via IndexedDB
    const {
        state: courts,
        setState: setCourts,
    } = useIndexedDBState<number>('courts', 4);

    // Club logo URL, persisted via IndexedDB
    const {
        state: logoUrl,
        setState: setLogoUrl,
    } = useIndexedDBState<string>('clubLogoUrl', '');

    const [showLogoModal, setShowLogoModal] = useState(false);
    const [logoInput, setLogoInput] = useState('');
    const [logoError, setLogoError] = useState('');
    const [logoBroken, setLogoBroken] = useState(false);

    // Reset the "failed to load" flag whenever the stored URL changes
    useEffect(() => {
        setLogoBroken(false);
    }, [logoUrl]);

    const isValidHttpsUrl = (value: string) => {
        try {
            return new URL(value).protocol === 'https:';
        } catch {
            return false;
        }
    };

    const openLogoModal = () => {
        setLogoInput(logoUrl);
        setLogoError('');
        setShowLogoModal(true);
    };

    const saveLogoUrl = () => {
        const trimmed = logoInput.trim();
        if (trimmed === '') {
            setLogoUrl('');
            setShowLogoModal(false);
            return;
        }
        if (!isValidHttpsUrl(trimmed)) {
            setLogoError('Enter a valid https:// URL, or clear the field to remove the logo.');
            return;
        }
        setLogoUrl(trimmed);
        setShowLogoModal(false);
    };

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
                    <div className="grid grid-cols-3 items-center">
                        <div className="flex items-center space-x-3 justify-self-start">
                            <button
                                onClick={openLogoModal}
                                title="Set club logo"
                                className={`p-2 rounded-xl transition-all duration-300 ${darkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90'} shadow-lg`}
                            >
                                <Calendar className="h-6 w-6 text-white" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Grand Slam
                                </h1>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Tennis Doubles Scheduler
                                </p>
                            </div>
                        </div>

                        <div className="justify-self-center">
                            {logoUrl && !logoBroken && (
                                <img
                                    src={logoUrl}
                                    alt="Club logo"
                                    className="h-10 max-h-10 w-auto max-w-[180px] object-contain rounded"
                                    onError={() => setLogoBroken(true)}
                                />
                            )}
                        </div>

                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-3 rounded-xl transition-all duration-300 justify-self-end ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} shadow-lg hover:shadow-xl`}
                        >
                            {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Club Logo Modal */}
            {showLogoModal && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
                    onClick={() => setShowLogoModal(false)}
                >
                    <div
                        className={`w-full max-w-md rounded-xl p-6 shadow-2xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Club Logo</h2>
                            <button
                                onClick={() => setShowLogoModal(false)}
                                className={`p-1 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Enter an https:// URL to an image file. Clear the field and save to remove the logo.
                        </p>
                        <input
                            type="text"
                            value={logoInput}
                            onChange={(e) => { setLogoInput(e.target.value); setLogoError(''); }}
                            placeholder="https://example.com/logo.png"
                            className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                            onKeyDown={(e) => e.key === 'Enter' && saveLogoUrl()}
                            autoFocus
                        />
                        {logoError && (
                            <p className="text-sm text-red-500 mt-2">{logoError}</p>
                        )}
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setShowLogoModal(false)}
                                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveLogoUrl}
                                className={`px-4 py-2 rounded-lg text-white ${darkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    <Schedule darkMode={darkMode} activePlayers={activePlayers} playHistory={playHistory} setPlayHistory={setPlayHistory} courts={courts} setCourts={setCourts}/>
                </div>

                <div style={{ display: activeTab === 'timer' ? 'block' : 'none' }}>
                    <GameTimer darkMode={darkMode} minutes={minutes} setMinutes={setMinutes} isTimerActive={isTimerActive} setIsTimerActive={setIsTimerActive} />
                </div>
            </div>

            {/* Footer */}
            <div className={`max-w-6xl mx-auto px-4 py-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="text-sm">
                    v1.3.1 © {new Date().getFullYear()} Grand Slam. All rights reserved.
                </p>
                <p className="text-xs mt-2">
                    Built with ☕️ in New Zealand by <a href="https://github.com/iamgbsmith?ref=grandslam" target="_blank" className="text-blue-500 hover:underline">Greg Smith</a>.
                </p>
            </div>
       
        </div>
    );
};

export default GrandSlamApp;