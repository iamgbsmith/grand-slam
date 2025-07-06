import { Calendar, Clock, Save, Shuffle } from 'lucide-react';
import React, { useState } from 'react';

interface ScheduleProps {
    darkMode: boolean;
    activePlayers: string[];
    playHistory: any[];
    setPlayHistory: (playHistory: any[]) => void;
}

export function Schedule({
    darkMode,
    activePlayers,
    playHistory,
    setPlayHistory
}: ScheduleProps) {

    const [currentMatches, setCurrentMatches] = useState<any[]>([]);

    // Match generation with smart pairing
    const generateMatches = () => {
        if (activePlayers.length < 4) return;

        const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
        const matches = [];

        for (let i = 0; i < shuffled.length; i += 4) {
            if (i + 3 < shuffled.length) {
                matches.push({
                    id: Date.now() + i,
                    team1: [shuffled[i], shuffled[i + 1]],
                    team2: [shuffled[i + 2], shuffled[i + 3]],
                    court: Math.floor(i / 4) + 1
                });
            }
        }

        setCurrentMatches(matches);
    };

    const saveRound = () => {
        const roundData = {
            id: Date.now(),
            matches: currentMatches,
            timestamp: new Date().toISOString()
        };
        setPlayHistory([...playHistory, roundData]);
        setCurrentMatches([]);
    };

    return (
        <div className="space-y-6">
            {/* Generate Matches */}
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                    <h2 className="text-xl font-bold">Current Round</h2>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            onClick={generateMatches}
                            disabled={activePlayers.length < 4}
                            className={`flex w-full sm:w-auto justify-center items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${activePlayers.length >= 4
                                ? `${darkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'} text-white shadow-lg hover:shadow-xl`
                                : `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                                }`}
                        >
                            <Shuffle className="h-4 w-4" />
                            <span>Generate Matches</span>
                        </button>
                        {currentMatches.length > 0 && (
                            <button
                                onClick={saveRound}
                                className={`flex w-full sm:w-auto justify-center items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'} text-white shadow-lg hover:shadow-xl`}
                            >
                                <Save className="h-4 w-4" />
                                <span>Save Round</span>
                            </button>
                        )}
                    </div>
                </div>

                {activePlayers.length < 4 && (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>You need at least 4 active players to generate matches.</p>
                        <p className="text-sm mt-2">There are currently {activePlayers.length} active players.</p>
                    </div>
                )}

                {currentMatches.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentMatches.map((match) => (
                            <div key={match.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'}`}>
                                <div className="text-center mb-3">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'}`}>
                                        Court {match.court}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center space-x-2">
                                        <span className="font-medium">{match.team1.join(' & ')}</span>
                                    </div>
                                    <div className="text-center text-sm font-bold">VS</div>
                                    <div className="flex items-center justify-center space-x-2">
                                        <span className="font-medium">{match.team2.join(' & ')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Play History */}
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h2 className="text-xl font-bold mb-4">Previous Rounds</h2>
                {playHistory.length === 0 ? (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No previous rounds saved yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {playHistory.slice(-5).reverse().map((round) => (
                            <div key={round.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">Round {playHistory.indexOf(round) + 1}</span>
                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {new Date(round.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {round.matches.map((match: { court: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; team1: any[]; team2: any[]; }, index: React.Key | null | undefined) => (
                                        <div key={index} className={`text-sm p-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                                            Court {match.court}: {match.team1.join(' & ')} vs {match.team2.join(' & ')}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}