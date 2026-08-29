import { Calendar, Clock, Save, Shuffle, Zap } from "lucide-react";
import React, { useState, type DragEvent, useRef } from "react";

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
  courts: number;
  setCourts: (courts: number) => void;
}

export function Schedule({
  darkMode,
  activePlayers,
  playHistory,
  setPlayHistory,
  courts,
  setCourts,
}: ScheduleProps) {
  const [currentMatches, setCurrentMatches] = useState<Match[]>([]);
  const [draggedPlayer, setDraggedPlayer] = useState<{
    player: string;
    isResting: boolean;
    matchId?: number;
    team?: "team1" | "team2";
    playerIndex?: 0 | 1;
  } | null>(null);
  const [dragOverPlayer, setDragOverPlayer] = useState<string | null>(null);

  const dragItem = useRef<HTMLSpanElement>(null);

  // Count how many matches each player has already played, from history
  const getPlayCounts = (players: string[], history: Round[]) => {
    const counts: Record<string, number> = Object.fromEntries(
      players.map((p) => [p, 0])
    );
    history.forEach((round) => {
      round.matches.forEach((match) => {
        [...match.team1, ...match.team2].forEach((p) => {
          if (p in counts) counts[p] += 1;
        });
      });
    });
    return counts;
  };

  // Choose which players sit this round in, prioritizing those who've
  // played the fewest matches so far. Ties are broken randomly so the
  // same "fewest games" player isn't always picked first.
  const selectPlayersForRound = (
    players: string[],
    counts: Record<string, number>,
    slots: number
  ) => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const byPriority = shuffled.sort((a, b) => counts[a] - counts[b]);
    return byPriority.slice(0, slots);
  };

  // Match generation with smart pairing, capped to the number of
  // courts available and rotating players fairly based on games played
  const generateMatches = () => {
    if (activePlayers.length < 4) return;

    const maxSlots = Math.min(activePlayers.length, courts * 4);
    const slotsUsed = maxSlots - (maxSlots % 4); // must fill full courts of 4
    if (slotsUsed < 4) return;

    const counts = getPlayCounts(activePlayers, playHistory);
    const selected = selectPlayersForRound(activePlayers, counts, slotsUsed);
    const shuffled = [...selected].sort(() => Math.random() - 0.5);

    const matches = [];
    for (let i = 0; i < shuffled.length; i += 4) {
      matches.push({
        id: Date.now() + i,
        team1: [shuffled[i], shuffled[i + 1]] as [string, string],
        team2: [shuffled[i + 2], shuffled[i + 3]] as [string, string],
        court: Math.floor(i / 4) + 1,
      });
    }

    setCurrentMatches(matches);
  };

  // Fills any spare courts with matches drawn from resting players,
  // appending them to the current round rather than replacing it.
  const quickMatch = () => {
    setCurrentMatches((prevMatches) => {
      const playingPlayers = prevMatches.flatMap((match) => [
        ...match.team1,
        ...match.team2,
      ]);
      const restingPlayers = activePlayers.filter(
        (p) => !playingPlayers.includes(p)
      );

      const spareCourts = courts - prevMatches.length;
      const matchesToCreate = Math.min(
        Math.floor(restingPlayers.length / 4),
        spareCourts
      );
      if (matchesToCreate <= 0) return prevMatches;

      const slots = matchesToCreate * 4;
      const counts = getPlayCounts(activePlayers, playHistory);
      const selected = selectPlayersForRound(restingPlayers, counts, slots);
      const shuffled = [...selected].sort(() => Math.random() - 0.5);

      const usedCourts = prevMatches.map((m) => m.court);
      const nextCourtStart =
        usedCourts.length > 0 ? Math.max(...usedCourts) + 1 : 1;

      const newMatches: Match[] = [];
      for (let i = 0; i < shuffled.length; i += 4) {
        newMatches.push({
          id: Date.now() + i,
          team1: [shuffled[i], shuffled[i + 1]] as [string, string],
          team2: [shuffled[i + 2], shuffled[i + 3]] as [string, string],
          court: nextCourtStart + i / 4,
        });
      }

      return [...prevMatches, ...newMatches];
    });
  };

  const saveRound = () => {
    const roundData = {
      id: Date.now(),
      matches: currentMatches,
      timestamp: new Date().toISOString(),
    };
    setPlayHistory([...playHistory, roundData]);
    setCurrentMatches([]);
  };

  const handleDragStart = (
    event: DragEvent<HTMLSpanElement>,
    player: string,
    details:
      | { matchId: number; team: "team1" | "team2"; playerIndex: 0 | 1 }
      | { isResting: true }
  ) => {
    if ("isResting" in details) {
      setDraggedPlayer({ player, isResting: true });
    } else {
      const { matchId, team, playerIndex } = details;
      setDraggedPlayer({
        player,
        isResting: false,
        matchId,
        team,
        playerIndex,
      });
    }

    dragItem.current = event.target as HTMLSpanElement;
    dragItem.current.classList.add("dragging");
  };

  const handleDragEnter = (
    event: DragEvent<HTMLSpanElement>,
    player: string
  ) => {
    event.preventDefault();
    setDragOverPlayer(player);
  };

  const handleDragLeave = () => {
    setDragOverPlayer(null);
  };

  const handleDragOver = (event: DragEvent<HTMLSpanElement>) => {
    event.preventDefault();
  };

  const handleDrop = (
    event: DragEvent<HTMLSpanElement>,
    droppedOnPlayer: string,
    matchId: number,
    team: "team1" | "team2",
    playerIndex: 0 | 1
  ) => {
    event.preventDefault();
    if (!draggedPlayer || !droppedOnPlayer) return;

    setCurrentMatches((prevMatches) => {
      const newMatches = JSON.parse(JSON.stringify(prevMatches));

      const droppedMatchIndex = newMatches.findIndex((m: { id: number; }) => m.id === matchId);
      if (droppedMatchIndex === -1) return prevMatches;

      const draggedPlayerName = draggedPlayer.player;
      const droppedMatch = newMatches[droppedMatchIndex];

      if (draggedPlayer.isResting) {
        // Dragging a resting player onto a match player
        droppedMatch[team][playerIndex] = draggedPlayerName;
        newMatches[droppedMatchIndex] = droppedMatch;
      } else if (draggedPlayer.matchId === matchId) {
        // Swapping within the same match (already handled by swapping players)
        const match = droppedMatch; // It's the same match
        if (draggedPlayer.team && draggedPlayer.playerIndex !== undefined) {
          match[draggedPlayer.team][draggedPlayer.playerIndex] =
            droppedOnPlayer;
          match[team][playerIndex] = draggedPlayerName;
          newMatches[droppedMatchIndex] = match;
        }
      } else {
        // Swapping between different matches
        const draggedMatchIndex = newMatches.findIndex(
          (m: { id: number | undefined; }) => m.id === draggedPlayer.matchId
        );
        if (draggedMatchIndex === -1) return prevMatches;

        const draggedMatch = newMatches[draggedMatchIndex];

        if (draggedPlayer.team && draggedPlayer.playerIndex !== undefined) {
          // Update the dragged player's original spot
          draggedMatch[draggedPlayer.team][draggedPlayer.playerIndex] =
            droppedOnPlayer;

          // Update the spot where the player was dropped
          droppedMatch[team][playerIndex] = draggedPlayerName;

          newMatches[draggedMatchIndex] = draggedMatch;
          newMatches[droppedMatchIndex] = droppedMatch;
        }
      }

      return newMatches;
    });

    setDraggedPlayer(null);
    setDragOverPlayer(null);
  };

  const handleDropOnResting = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!draggedPlayer || draggedPlayer.isResting) {
      return; // Can't drop a resting player here
    }

    setCurrentMatches((prevMatches) => {
      const playingPlayers = prevMatches.flatMap((match) => [
        ...match.team1,
        ...match.team2,
      ]);
      const restingPlayers = activePlayers.filter(
        (p) => !playingPlayers.includes(p)
      );

      if (restingPlayers.length === 0) {
        return prevMatches; // No one to swap with
      }

      const newMatches = JSON.parse(JSON.stringify(prevMatches));
      const draggedMatchIndex = newMatches.findIndex(
        (m: Match) => m.id === draggedPlayer.matchId
      );
      if (draggedMatchIndex === -1) return prevMatches;

      const draggedMatch = newMatches[draggedMatchIndex];
      if (draggedPlayer.team && draggedPlayer.playerIndex !== undefined) {
        draggedMatch[draggedPlayer.team][draggedPlayer.playerIndex] =
          restingPlayers.sort()[0]; // Swap with the first available resting player
      }
      return newMatches;
    });
  };

  const handleDragEnd = () => {
    if (dragItem.current) {
      dragItem.current.classList.remove("dragging");
    }
    setDraggedPlayer(null);
    setDragOverPlayer(null);
  };

  return (
    <div className="space-y-6">
      {/* Generate Matches */}
      <div
        className={`p-6 rounded-xl ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <h2 className="text-xl font-bold">Current Round</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <label
                htmlFor="courts-select"
                className={`text-sm font-medium whitespace-nowrap ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Courts available:
              </label>
              <select
                id="courts-select"
                value={courts}
                onChange={(e) => setCourts(Number(e.target.value))}
                className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={generateMatches}
              disabled={activePlayers.length < 4}
              className={`flex w-full sm:w-auto justify-center items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activePlayers.length >= 4
                  ? `${
                      darkMode
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    } text-white shadow-lg hover:shadow-xl`
                  : `${
                      darkMode
                        ? "bg-gray-700 text-gray-500"
                        : "bg-gray-300 text-gray-500"
                    } cursor-not-allowed`
              }`}
            >
              <Shuffle className="h-4 w-4" />
              <span>Generate Matches</span>
            </button>
            {currentMatches.length > 0 && (
              <button
                onClick={saveRound}
                className={`flex w-full sm:w-auto justify-center items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  darkMode
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white shadow-lg hover:shadow-xl`}
              >
                <Save className="h-4 w-4" />
                <span>Save Round</span>
              </button>
            )}
          </div>
        </div>

        {activePlayers.length > courts * 4 && (
          <p
            className={`text-sm mb-4 ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {courts * 4} of {activePlayers.length} active players will be on
            court this round ({courts} court
            {courts > 1 ? "s" : ""} available); the others will rest and get
            priority next round.
          </p>
        )}

        {activePlayers.length < 4 && (
          <div
            className={`text-center py-8 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>You need at least 4 active players to generate matches.</p>
            <p className="text-sm mt-2">
              There are currently {activePlayers.length} active players.
            </p>
          </div>
        )}

        {currentMatches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentMatches.map((match) => (
              <div
                key={match.id}
                className={`p-4 rounded-lg ${
                  darkMode
                    ? "bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30"
                    : "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
                }`}
              >
                <div className="text-center mb-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      darkMode
                        ? "bg-purple-600 text-white"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    Court {match.court}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    {match.team1.map((player, index) => (
                      <span
                        key={`${match.id}-team1-${index}`}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, player, {
                            matchId: match.id,
                            team: "team1",
                            playerIndex: index as 0 | 1,
                          })
                        }
                        onDragEnter={
                          draggedPlayer
                            ? (e) => handleDragEnter(e, player)
                            : undefined
                        }
                        onDragLeave={
                          draggedPlayer ? handleDragLeave : undefined
                        }
                        onDragOver={draggedPlayer ? handleDragOver : undefined}
                        onDrop={(e) =>
                          handleDrop(
                            e,
                            player,
                            match.id,
                            "team1",
                            index as 0 | 1
                          )
                        }
                        onDragEnd={handleDragEnd}
                        className={`font-medium px-2 py-1 rounded cursor-move
                                                ${
                                                  darkMode
                                                    ? "bg-gray-700 text-white"
                                                    : "bg-white text-gray-900 border border-gray-300"
                                                }
                                                ${
                                                  dragOverPlayer === player
                                                    ? "border-2 border-blue-500"
                                                    : ""
                                                }
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
                        onDragStart={(e) =>
                          handleDragStart(e, player, {
                            matchId: match.id,
                            team: "team2",
                            playerIndex: index as 0 | 1,
                          })
                        }
                        onDragEnter={
                          draggedPlayer
                            ? (e) => handleDragEnter(e, player)
                            : undefined
                        }
                        onDragLeave={
                          draggedPlayer ? handleDragLeave : undefined
                        }
                        onDragOver={draggedPlayer ? handleDragOver : undefined}
                        onDrop={(e) =>
                          handleDrop(
                            e,
                            player,
                            match.id,
                            "team2",
                            index as 0 | 1
                          )
                        }
                        onDragEnd={handleDragEnd}
                        className={`font-medium px-2 py-1 rounded cursor-move
                                                ${
                                                  darkMode
                                                    ? "bg-gray-700 text-white"
                                                    : "bg-white text-gray-900 border border-gray-300"
                                                }
                                                ${
                                                  dragOverPlayer === player
                                                    ? "border-2 border-blue-500"
                                                    : ""
                                                }
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
        <div
          className={`p-6 rounded-xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg`}
        >
          {(() => {
            const playingPlayers = currentMatches.flatMap((match) => [
              ...match.team1,
              ...match.team2,
            ]);
            const restingPlayers = activePlayers.filter(
              (player) => !playingPlayers.includes(player)
            );
            const spareCourts = courts - currentMatches.length;
            const quickMatchesAvailable = Math.min(
              Math.floor(restingPlayers.length / 4),
              spareCourts
            );
            const canQuickMatch = quickMatchesAvailable > 0;

            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Resting Players</h2>
                  <button
                    onClick={quickMatch}
                    disabled={!canQuickMatch}
                    title={
                      canQuickMatch
                        ? `Create ${quickMatchesAvailable} match${
                            quickMatchesAvailable > 1 ? "es" : ""
                          } from resting players`
                        : "Needs 4+ resting players and a spare court"
                    }
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      canQuickMatch
                        ? `${
                            darkMode
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          } text-white shadow-lg hover:shadow-xl`
                        : `${
                            darkMode
                              ? "bg-gray-700 text-gray-500"
                              : "bg-gray-300 text-gray-500"
                          } cursor-not-allowed`
                    }`}
                  >
                    <Zap className="h-4 w-4" />
                    <span>Quick Match</span>
                  </button>
                </div>
                {restingPlayers.length === 0 ? (
                  <div
                    className={`text-center py-6 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <p>All active players are currently assigned to courts.</p>
                  </div>
                ) : (
                  <div
                    className="flex flex-wrap gap-2 p-2 rounded-lg min-h-[44px]"
                    onDrop={handleDropOnResting}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) =>
                      e.currentTarget.classList.add(
                        darkMode ? "bg-gray-700" : "bg-gray-100"
                      )
                    }
                    onDragLeave={(e) =>
                      e.currentTarget.classList.remove(
                        darkMode ? "bg-gray-700" : "bg-gray-100"
                      )
                    }
                  >
                    {restingPlayers.sort().map((player) => (
                      <span
                        key={player}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, player, { isResting: true })
                        }
                        onDragEnd={handleDragEnd}
                        className={`font-medium px-3 py-2 rounded-lg cursor-move ${
                          darkMode
                            ? "bg-orange-700 text-white"
                            : "bg-orange-100 text-orange-800 border border-orange-300"
                        } ${
                          dragOverPlayer === player
                            ? "border-2 border-blue-500"
                            : ""
                        }`}
                      >
                        {player}
                      </span>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Play History */}
      <div
        className={`p-6 rounded-xl ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        <h2 className="text-xl font-bold mb-4">Previous Rounds</h2>
        {playHistory.length === 0 ? (
          <div
            className={`text-center py-8 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No previous rounds saved yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {playHistory
              .slice(-5)
              .reverse()
              .map((round) => (
                <div
                  key={round.id}
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      Round {playHistory.indexOf(round) + 1}
                    </span>
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {new Date(round.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {round.matches.map(
                      (
                        match: {
                          court:
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | React.ReactPortal
                            | Promise<
                                | string
                                | number
                                | bigint
                                | boolean
                                | React.ReactPortal
                                | React.ReactElement<
                                    unknown,
                                    string | React.JSXElementConstructor<any>
                                  >
                                | Iterable<React.ReactNode>
                                | null
                                | undefined
                              >
                            | null
                            | undefined;
                          team1: any[];
                          team2: any[];
                        },
                        index: React.Key | null | undefined
                      ) => (
                        <div
                          key={index}
                          className={`text-sm p-2 rounded ${
                            darkMode ? "bg-gray-600" : "bg-white"
                          }`}
                        >
                          Court {match.court}: {match.team1.join(" & ")} vs{" "}
                          {match.team2.join(" & ")}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
