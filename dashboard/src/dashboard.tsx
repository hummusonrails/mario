'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button"
import { CoinsIcon as Coin, Flag, Flame, Sword, Trophy, Star, Eye, EyeOff } from 'lucide-react';
import { PlayerData } from "../types/game";
import { CustomTerminal } from "../components/terminal";
import { DancingMario } from '../components/dancing-mario'
import { Countdown } from "../components/countdown"
import './styles/dancing-mario.css'

// const BACKEND_URL = "http://localhost:3000";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Dashboard() {
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [isRevealed, setIsRevealed] = useState(false)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/players/all`)
        const data = await response.json()
        setPlayers(data)
      } catch (error) {
        console.error("Error fetching players:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const handleReveal = () => {
    setIsCountingDown(true)
  }

  const handleCountdownComplete = () => {
    setIsCountingDown(false)
    setIsRevealed(true)
  }

  // Calculate score consistently
  const calculateScore = (player: PlayerData) => {
    const stats = player.cumulativeStats || {};
    return (
      (stats.coinsCollected || 0) * 100 +
      (stats.enemiesDefeated || 0) * 500 +
      (stats.flagPoleHeight || 0) * 1000
    );
  };

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => calculateScore(b) - calculateScore(a));

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="spinner border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {isCountingDown ? <Countdown startFrom={10} onComplete={handleCountdownComplete} /> : null}
      <DancingMario
        characterUrls={{
          mario: "./mario-dance.png",
          luigi: "./luigi-dance.jpg",
          toad: "./toad-dance.gif",
          yoshi: "./yoshi-dance.gif",
        }}
      />
      {/* Full-width Header */}
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm w-full">
        <div className="container flex h-16 items-center justify-between px-4">
          <img src="./couchbase.svg" alt="Couchbase Logo" width={150} height={40} />
          <div className="flex items-center gap-2">
            <img src="./mario-coin.webp" alt="Mario Coin" width={30} height={30} className="animate-bounce" />
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-green-500">
              Super Mario Tournament
            </h1>
            <img src="/mario-coin.webp" alt="Mario Coin" width={30} height={30} className="animate-bounce" />
          </div>
        </div>
      </header>

      {/* Split Content Area */}
      <div className="flex flex-1">
        {/* Main Dashboard Section - 75% width */}
        <div className="w-3/4">
          <main className="container mx-auto px-4 py-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-yellow-700 text-sm font-medium">Total Coins</CardTitle>
                  <Coin className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-700">
                    {players.reduce(
                      (sum, player) => sum + (player.cumulativeStats?.coinsCollected || 0), 0
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-red-700 text-sm font-medium">Total Fireballs</CardTitle>
                  <Flame className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-700">
                    {players.reduce(
                      (sum, player) => sum + (player.cumulativeStats?.fireballsShot || 0), 0
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-purple-700 text-sm font-medium">Enemies Defeated</CardTitle>
                  <Sword className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">
                    {players.reduce(
                      (sum, player) => sum + (player.cumulativeStats?.enemiesDefeated || 0), 0
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-green-700 text-sm font-medium">Flags Reached</CardTitle>
                  <Flag className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">
                    {players.reduce(
                      (sum, player) => sum + (player.cumulativeStats?.flagPoleHeight ? 1 : 0), 0
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard */}
            <Card className="overflow-visible">
              <CardHeader className="border-b bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-red-600">
                      Tournament Leaderboard
                    </CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReveal}
                    disabled={isRevealed || isCountingDown}
                    className="flex items-center gap-2"
                  >
                    {isRevealed ? (
                      <>
                        <Eye className="h-4 w-4" />
                        Revealed
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Reveal Scores
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  {!isRevealed && !isCountingDown && (
                    <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm z-10 flex items-center justify-center">
                      <div className="relative top-1/4 w-full text-center">
                        <EyeOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-600">Scores are hidden</p>
                        <p className="text-sm text-gray-500">Waiting for the big reveal!</p>
                      </div>
                    </div>
                  )}
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rank</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Player</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                          <Coin className="h-4 w-4 inline mr-1" />
                          Coins
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                          <Flame className="h-4 w-4 inline mr-1" />
                          Fireballs
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                          <Sword className="h-4 w-4 inline mr-1" />
                          Enemies
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                          <Flag className="h-4 w-4 inline mr-1" />
                          Flag Height
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                          <Star className="h-4 w-4 inline mr-1" />
                          Score
                        </th>
                      </tr>
                    </thead>

                    <tbody className={!isRevealed ? "blur-sm" : ""}>
                      {sortedPlayers.map((player, index) => (
                        <tr key={player.name} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`
                                  w-8 h-8 rounded-full flex items-center justify-center font-bold
                                  ${
                                    index === 0
                                      ? "bg-yellow-100 text-yellow-700"
                                      : index === 1
                                        ? "bg-gray-100 text-gray-700"
                                        : index === 2
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-gray-50 text-gray-500"
                                  }
                                `}
                              >
                                #{index + 1}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{player.name}</span>
                              <span className="text-sm text-gray-500">{player.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-yellow-600">
                            {player.cumulativeStats?.coinsCollected || 0}
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-red-600">
                            {player.cumulativeStats?.fireballsShot || 0}
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-purple-600">
                            {player.cumulativeStats?.enemiesDefeated || 0}
                          </td>
                          <td className="px-4 py-4 text-center font-medium text-green-600">
                            {player.cumulativeStats?.flagPoleHeight || 0}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 ${!isRevealed ? "invisible" : ""}`}
                            >
                              {calculateScore(player)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>

        {/* Terminal Section - 25% width */}
        <div className="w-1/4 p-4 border-l">
          <CustomTerminal data={players} />
        </div>
      </div>
    </div>
  )
}