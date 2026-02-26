'use client';
import Link from 'next/link';
import { WalletButton } from '@/components/WalletButton';

const MOCK_LEADERBOARD = [
  { rank: 1, wallet: 'GDBLUIMXTGNKDTSUXMF2UY3OC4I4TBJLMKJCQMLF5HYPN7RFGSIHLX6J', earned: 12500, wins: 23, total: 31 },
  { rank: 2, wallet: 'GCXKDRU2IQHZRG5Y7XMOQFWZSAEF7XLKDSWCBCRWNZ54NHMQVPBQXYZD', earned: 9800, wins: 18, total: 28 },
  { rank: 3, wallet: 'GDQFKBHTYYLSWPYFTMPOHAAZQCLKS4GREVQ7DPBIMTQBCMQDXGHFN3RE5', earned: 7200, wins: 14, total: 25 },
  { rank: 4, wallet: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQHMAXMMQCDSYHLYSTMJWFKNOBEZLGT', earned: 5100, wins: 11, total: 22 },
  { rank: 5, wallet: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR', earned: 3400, wins: 8, total: 19 },
];

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <span className="text-2xl">🚦</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">TrafficPulse</h1>
                <p className="text-cyan-400/80 text-sm font-medium">Leaderboard</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
              ← Back to Game
            </Link>
            <WalletButton />
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 card-hover">
            <div className="text-slate-400 text-sm font-medium mb-1">Total Players</div>
            <div className="text-3xl font-bold text-white">5</div>
          </div>
          <div className="glass-card p-6 card-hover">
            <div className="text-slate-400 text-sm font-medium mb-1">Total Distributed</div>
            <div className="text-3xl font-bold text-white">38,000 <span className="text-lg text-cyan-400">PULSE</span></div>
          </div>
          <div className="glass-card p-6 card-hover">
            <div className="text-slate-400 text-sm font-medium mb-1">Avg Win Rate</div>
            <div className="text-3xl font-bold text-white">59.2<span className="text-lg text-cyan-400">%</span></div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="glass-strong-card overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              Top Players
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Wallet</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Earned</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Wins</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_LEADERBOARD.map((player) => (
                  <tr key={player.rank} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {player.rank <= 3 ? (
                          <span className="text-xl">{player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}</span>
                        ) : (
                          <span className="text-slate-500 font-mono w-7 text-center">#{player.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-cyan-300">{player.wallet.slice(0, 6)}...{player.wallet.slice(-4)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-white font-semibold">{player.earned.toLocaleString()}</span>
                      <span className="text-cyan-400 text-sm ml-1">PULSE</span>
                    </td>
                    <td className="px-6 py-4 text-right text-white">{player.wins}/{player.total}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${(player.wins / player.total) * 100 >= 60 ? 'text-green-400' : (player.wins / player.total) * 100 >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {((player.wins / player.total) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="text-center text-slate-500 text-sm py-8">
          <p>Powered by Stellar • Contract: <span className="font-mono text-cyan-400/80">CDTUC...EHCWECC</span></p>
        </footer>
      </div>
    </main>
  );
}
