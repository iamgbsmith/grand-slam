import { useState } from 'react';
import { Users, UserPlus, UserMinus } from 'lucide-react';

interface PlayersProps {
    darkMode: boolean;
    players: string[];
    setPlayers: (players: string[]) => void;
    activePlayers: string[];
    setActivePlayers: (activePlayers: string[]) => void;
}

export function Players({
    darkMode,
    players,
    setPlayers,
    activePlayers,
    setActivePlayers
}: PlayersProps) {

    const [showAddPlayer, setShowAddPlayer] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState<string>('');

    // Player management
    const addPlayer = () => {
        if (newPlayerName.trim() && !players.includes(newPlayerName.trim())) {
            const newPlayers = [...players, newPlayerName.trim()].sort();
            setPlayers(newPlayers);
            setNewPlayerName('');
            setShowAddPlayer(false);
        }
    };

    const removePlayer = (playerName: string) => {
        setPlayers(players.filter(p => p !== playerName));
        setActivePlayers(activePlayers.filter(p => p !== playerName));
    };

    const toggleActivePlayer = (playerName: string) => {
        if (activePlayers.includes(playerName)) {
            setActivePlayers(activePlayers.filter(p => p !== playerName));
        } else {
            setActivePlayers([...activePlayers, playerName]);
        }
    };

    return (
        <div className="space-y-6">
            {/* Add Player Section */}
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold">Club Players</h2>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {activePlayers.length} of {players.length} players active
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddPlayer(!showAddPlayer)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${darkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'} text-white shadow-lg hover:shadow-xl`}
                    >
                        <UserPlus className="h-4 w-4" />
                        <span>Add Player</span>
                    </button>
                </div>

                {showAddPlayer && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                placeholder="Enter player name"
                                className={`w-full flex-1 px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                            />
                            <button
                                onClick={addPlayer}
                                className={`w-full sm:w-auto px-6 py-2 rounded-lg ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'} text-white transition-colors`}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {players.map((player, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border transition-all duration-300 ${activePlayers.includes(player)
                                ? `border-purple-500 ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'} shadow-md`
                                : `${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activePlayers.includes(player)
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                                        : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                                        }`}>
                                        <span className="text-white font-bold">
                                            {player.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="font-medium">{player}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => toggleActivePlayer(player)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${activePlayers.includes(player)
                                            ? 'bg-green-500 text-white'
                                            : darkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                                            }`}
                                    >
                                        {activePlayers.includes(player) ? 'Active' : 'Inactive'}
                                    </button>
                                    <button
                                        onClick={() => removePlayer(player)}
                                        className={`p-2 rounded-lg transition-all duration-300 ${darkMode ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' : 'hover:bg-red-100 text-red-600 hover:text-red-700'} hover:shadow-md`}
                                        title="Delete player"
                                    >
                                        <UserMinus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {players.length === 0 && (
                    <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No players added yet. Add your first player to get started.</p>
                    </div>
                )}
            </div>
        </div>
    )



}