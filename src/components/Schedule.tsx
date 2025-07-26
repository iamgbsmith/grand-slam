import { Calendar, Clock, Save, Shuffle } from 'lucide-react';
import React, { useState, type DragEvent, useRef } from 'react';

interface Match {
    id: number;
    team1: [string, string];
    team2: [string, string];
    court: number;
}

interface Round {
    id: number;
    matches: Match[];
    timestamp: string;
}

interface ScheduleProps {
    darkMode: boolean;
    activePlayers: string[];
    playHistory: Round[];
    setPlayHistory: (playHistory: Round[]) => void;
}

export function Schedule({
    darkMode,
    activePlayers,
    playHistory,
    setPlayHistory
}: ScheduleProps) {

    const [currentMatches, setCurrentMatches] = useState<Match[]>([]);
    const [draggedPlayer, setDraggedPlayer] = useState<{
        player: string;
        matchId: number;
        team: 'team1' | 'team2';
        playerIndex: 0 | 1;
    } | null>(null);
    const [dragOverPlayer, setDragOverPlayer] = useState<string | null>(null);

    const dragItem = useRef<HTMLSpanElement>(null);
    
    // Match generation with smart pairing
    const generateMatches = () => {
        if (activePlayers.length < 4) return;

        const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
        const matches = [];

        for (let i = 0; i < shuffled.length; i += 4) {
            if (i + 3 < shuffled.length) {
                matches.push({
                    id: Date.now() + i,
                    team1: [shuffled[i], shuffled[i + 1]] as [string, string],
                    team2: [shuffled[i + 2], shuffled[i + 3]] as [string, string],
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

    const handleDragStart = (event: DragEvent<HTMLSpanElement>, player: string, matchId: number, team: 'team1' | 'team2', playerIndex: 0 | 1) => {
        setDraggedPlayer({ player, matchId, team, playerIndex });
        dragItem.current = event.target as HTMLSpanElement;
        dragItem.current.classList.add('dragging');
    };

    const handleDragEnter = (event: DragEvent<HTMLSpanElement>, player: string) => {
        event.preventDefault();
        setDragOverPlayer(player);
    };

    const handleDragLeave = () => {
        setDragOverPlayer(null);
    };

    const handleDragOver = (event: DragEvent<HTMLSpanElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: DragEvent<HTMLSpanElement>, droppedOnPlayer: string, matchId: number, team: 'team1' | 'team2', playerIndex: 0 | 1) => {
        event.preventDefault();
        if (!draggedPlayer || !droppedOnPlayer) return;

        setCurrentMatches(prevMatches => {
            const newMatches = [...prevMatches];
            
            // Find the indices of both matches
            const draggedMatchIndex = newMatches.findIndex(m => m.id === draggedPlayer.matchId);
            const droppedMatchIndex = newMatches.findIndex(m => m.id === matchId);
            
            if (draggedMatchIndex === -1 || droppedMatchIndex === -1) return prevMatches;

            // Create deep copies of the matches
            const draggedMatch = { ...newMatches[draggedMatchIndex] };
            const droppedMatch = { ...newMatches[droppedMatchIndex] };
            
            // Create copies of the teams
            draggedMatch.team1 = [...draggedMatch.team1] as [string, string];
            draggedMatch.team2 = [...draggedMatch.team2] as [string, string];
            droppedMatch.team1 = [...droppedMatch.team1] as [string, string];
            droppedMatch.team2 = [...droppedMatch.team2] as [string, string];

            if (draggedPlayer.matchId === matchId) {
                // Swapping within the same match
                const match = droppedMatch;
                const draggedPlayerName = draggedPlayer.player;
                
                // Simple swap within the same match
                match[draggedPlayer.team][draggedPlayer.playerIndex] = droppedOnPlayer;
                match[team][playerIndex] = draggedPlayerName;
                
                newMatches[droppedMatchIndex] = match;
            } else {
                // Swapping between different matches
                const draggedPlayerName = draggedPlayer.player;
                
                // Update the dragged player's position
                draggedMatch[draggedPlayer.team][draggedPlayer.playerIndex] = droppedOnPlayer;
                
                // Update the dropped-on player's position
                droppedMatch[team][playerIndex] = draggedPlayerName;
                
                // Update both matches in the array
                newMatches[draggedMatchIndex] = draggedMatch;
                newMatches[droppedMatchIndex] = droppedMatch;
            }
            
            return newMatches;
        });
        
        setDraggedPlayer(null);
        setDragOverPlayer(null);
    };

    const handleDragEnd = () => {
        if (dragItem.current) {
            dragItem.current.classList.remove('dragging');
        }
        setDraggedPlayer(null);
        setDragOverPlayer(null);
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
                                        {match.team1.map((player, index) => (
                                            <span
                                                key={`${match.id}-team1-${index}`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, player, match.id, 'team1', index as 0 | 1)}
                                                onDragEnter={draggedPlayer ? (e) => handleDragEnter(e, player) : undefined}
                                                onDragLeave={draggedPlayer ? handleDragLeave : undefined}
                                                onDragOver={draggedPlayer ? handleDragOver : undefined}
                                                onDrop={(e) => handleDrop(e, player, match.id, 'team1', index as 0 | 1)}
                                                onDragEnd={handleDragEnd}
                                                className={`font-medium px-2 py-1 rounded cursor-move
                                                ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border border-gray-300'}
                                                ${dragOverPlayer === player ? 'border-2 border-blue-500' : ''}
                                                `}
                                            >
                                                {player}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-center text-sm font-bold">VS</div>
                                    <div className="flex items-center justify-center space-x-2">
                                        {match.team2.map((player, index) => (
                                            <span
                                                key={`${match.id}-team2-${index}`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, player, match.id, 'team2', index as 0 | 1)}
                                                onDragEnter={draggedPlayer ? (e) => handleDragEnter(e, player) : undefined}
                                                onDragLeave={draggedPlayer ? handleDragLeave : undefined}
                                                onDragOver={draggedPlayer ? handleDragOver : undefined}
                                                onDrop={(e) => handleDrop(e, player, match.id, 'team2', index as 0 | 1)}
                                                onDragEnd={handleDragEnd}
                                                className={`font-medium px-2 py-1 rounded cursor-move
                                                ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border border-gray-300'}
                                                ${dragOverPlayer === player ? 'border-2 border-blue-500' : ''}
                                                `}
                                            >
                                                {player}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

{/* Resting Players */}
            {currentMatches.length > 0 && (
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <h2 className="text-xl font-bold mb-4">Resting Players</h2>
                    {(() => {
                        const playingPlayers = currentMatches.flatMap(match => [
                            ...match.team1,
                            ...match.team2
                        ]);
                        const restingPlayers = activePlayers.filter(player => 
                            !playingPlayers.includes(player)
                        );

                        return restingPlayers.length === 0 ? (
                            <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <p>All active players are currently assigned to courts.</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {restingPlayers.map((player) => (
                                    <span
                                        key={player}
                                        className={`font-medium px-3 py-2 rounded-lg ${
                                            darkMode 
                                                ? 'bg-orange-700 text-white' 
                                                : 'bg-orange-100 text-orange-800 border border-orange-300'
                                        }`}
                                    >
                                        {player}
                                    </span>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            )}

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