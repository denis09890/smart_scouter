import React, { useState, useEffect, useRef } from 'react';
import {
  Star, UserRound, Search, MessageSquare, Scale, LayoutList,
  Send, Bot, History, X, Clock, ChevronLeft,
  TrendingUp, LogOut, UserCog, Mail, ShieldCheck, Lock, Filter,
  ChevronDown, Euro, CalendarDays, Goal, Sparkles, FileText, Activity, AlertCircle, FolderPlus, Folder, Trash2, CheckSquare, Square, MoreHorizontal, Pin, Copy, Move, Timer, Shield, Zap, ArrowLeft, Trophy, BarChart2, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import Flag from 'react-world-flags';

// --- 0. PLAYER REPORT PAGE ---
const PlayerReportPage = ({ player, onBack, onSaveToWatchlist, isInWatchlist }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('en-US', { day:'2-digit', month:'short', year:'numeric' });

  useEffect(() => {
    setLoading(true);
    setReport(null);
    fetch(`http://localhost:8000/report/${player.id}`)
      .then(r => r.json())
      .then(d => { setReport(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [player.id]);

  const AttrBox = ({ label, value }) => {
    const color = value >= 75 ? 'text-[#00ff88]' : value >= 50 ? 'text-white' : 'text-red-400';
    return (
      <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-4 flex flex-col items-center gap-1">
        <span className={`text-3xl font-black ${color}`}>{value}</span>
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
    );
  };

  const StatBar = ({ label, value, max, unit = '' }) => {
    const pct = Math.min(100, (value / Math.max(max, 0.01)) * 100);
    return (
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider w-36 shrink-0">{label}</span>
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#00ff88] rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-[11px] font-black text-white w-14 text-right">{value}{unit}</span>
      </div>
    );
  };

  const RiskCard = ({ risk }) => {
    const styles = {
      danger:  'border-red-500/40 bg-red-500/5 text-red-400',
      warning: 'border-orange-400/40 bg-orange-400/5 text-orange-400',
      info:    'border-yellow-400/40 bg-yellow-400/5 text-yellow-300',
      success: 'border-[#00ff88]/40 bg-[#00ff88]/5 text-[#00ff88]',
    };
    const icons = {
      danger:  <AlertTriangle size={14}/>,
      warning: <AlertCircle size={14}/>,
      info:    <Info size={14}/>,
      success: <CheckCircle size={14}/>,
    };
    const cls = styles[risk.type] || styles.info;
    return (
      <div className={`border rounded-2xl px-5 py-3 flex items-start gap-3 ${cls}`}>
        <span className="mt-0.5 shrink-0">{icons[risk.type] || icons.info}</span>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider">{risk.title}</span>
          <span className="text-gray-400 text-[10px] font-normal normal-case not-italic ml-2">— {risk.desc}</span>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="fixed inset-0 z-[600] bg-[#05070a] flex flex-col items-center justify-center gap-6 font-sans">
      <div className="w-12 h-12 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-white font-black uppercase text-lg tracking-tighter">{player.name}</p>
        <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mt-1">Generating AI report...</p>
      </div>
    </div>
  );

  if (!report || report.error) return (
    <div className="fixed inset-0 z-[600] bg-[#05070a] flex flex-col items-center justify-center gap-4 font-sans">
      <AlertTriangle size={48} className="text-red-500" />
      <p className="text-white font-black uppercase">Report unavailable</p>
      <button onClick={onBack} className="text-[#00ff88] text-xs font-black uppercase tracking-widest">← Back</button>
    </div>
  );

  const { player: pd, attributes: attrs, overall, analysis } = report;
  const s = pd.season;
  const c = pd.career;
  const gpm = s.matches > 0 ? (s.goals / s.matches).toFixed(2) : '0.00';
  const apm = s.matches > 0 ? (s.assists / s.matches).toFixed(2) : '0.00';
  const mpm = s.matches > 0 ? Math.round(s.minutes / s.matches) : 0;
  const initials = pd.name.split(' ').slice(0, 2).map(w => w[0]).join('');
  const gradeColor = overall >= 80 ? '#00ff88' : overall >= 65 ? '#facc15' : '#f87171';

  // compatibilitate cu vechiul câmp "riscuri"
  const riscuriTransfer = analysis.riscuriTransfer || analysis.riscuri || [];
  const riscuriAccidentare = analysis.riscuriAccidentare || [];

  // contract urgency
  const contractRaw = pd.contractExpiration && pd.contractExpiration !== 'nan' ? pd.contractExpiration : null;
  const contractMonths = contractRaw
    ? Math.round((new Date(contractRaw) - new Date()) / (1000 * 60 * 60 * 24 * 30))
    : null;
  const contractColor = contractMonths === null ? 'text-gray-500'
    : contractMonths <= 6  ? 'text-red-400'
    : contractMonths <= 12 ? 'text-orange-400'
    : 'text-[#00ff88]';

  // market value chart
  const valuations = pd.valuations || [];
  const maxVal = valuations.length > 0 ? Math.max(...valuations.map(v => v.value)) : 1;

  return (
    <div className="fixed inset-0 z-[600] bg-[#05070a] font-sans text-white overflow-y-auto not-italic normal-case font-normal tracking-normal">

      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-[#05070a]/95 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-[#00ff88] transition-colors text-[11px] font-black uppercase tracking-widest">
            <ArrowLeft size={16}/> Back to gallery
          </button>
          <span className="text-gray-700">|</span>
          <span className="text-white font-black uppercase text-sm tracking-tight">Player Profile</span>
        </div>
        <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">AI Generated • {today}</span>
      </div>

      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="w-72 shrink-0 sticky top-[57px] h-[calc(100vh-57px)] bg-[#0d1117] border-r border-gray-800 flex flex-col p-8 gap-6 overflow-y-auto scrollbar-hide">
          <div className="text-center">
            <div className="text-6xl font-black" style={{ color: gradeColor }}>{overall}</div>
            <div className="inline-block bg-[#161b22] border border-gray-700 rounded-full px-4 py-1 text-[11px] font-black text-gray-300 uppercase tracking-widest mt-2">{pd.position}</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-28 h-28 rounded-full bg-[#161b22] border-4 border-[#00ff88]/60 flex items-center justify-center text-[#00ff88] font-black text-3xl overflow-hidden shrink-0 shadow-[0_0_20px_rgba(0,255,136,0.3)]">
              {pd.imageUrl && pd.imageUrl !== 'nan' && pd.imageUrl !== '' ? (
                <img src={pd.imageUrl} alt={pd.name} referrerPolicy="no-referrer" className="w-full h-full object-cover bg-white" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pd.name)}&background=161b22&color=00ff88`; }} />
              ) : (
                initials
              )}
            </div>
            <div className="text-center">
              <p className="text-white font-black text-base leading-tight">{pd.name.split(' ')[0]}</p>
              <p className="text-[#00ff88] font-black text-lg leading-tight">{pd.name.split(' ').slice(1).join(' ')}</p>
              <p className="text-gray-500 text-[11px] font-bold mt-2 uppercase tracking-widest">{pd.club}</p>
            </div>
            {pd.countryCode && <Flag code={pd.countryCode} className="h-5 rounded-sm opacity-80 mt-1" />}
          </div>
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 100 60" className="w-40 h-24">
              <path d="M 5,55 A 45,45 0 0 1 95,55" stroke="#1f2937" strokeWidth="6" fill="none" strokeLinecap="round"/>
              <path d="M 5,55 A 45,45 0 0 1 95,55" stroke="#00ff88" strokeWidth="6" fill="none" strokeLinecap="round"
                style={{ strokeDasharray: 142, strokeDashoffset: 142 - (player.match / 100) * 142 }}/>
            </svg>
            <div className="bg-[#00ff88] text-black font-black text-[10px] px-4 py-1 rounded-full -mt-7 z-10 uppercase tracking-tighter shadow-lg">{player.match}% AI MATCH</div>
          </div>
          <div className="space-y-3 text-[10px] font-bold border-t border-gray-800 pt-4">
            {[
              ['Age',        `${pd.age} yrs`],
              ['Market Val', pd.marketValue],
              ['Max Val',    pd.highestValue],
              ['Foot',       pd.foot || '—'],
              ['Height',     pd.height ? `${pd.height} cm` : '—'],
              ['Int. Caps',  pd.internationalCaps || '0'],
              ['Season',     s.year || pd.lastSeason || '—'],
              ['G / A sezon', `${s.goals}G / ${s.assists}A`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center">
                <span className="text-gray-500 uppercase tracking-wider text-[11px]">{k}</span>
                <span className="text-white font-black text-xs">{v}</span>
              </div>
            ))}
            {contractRaw && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 uppercase tracking-wider text-[11px]">Contract</span>
                <span className={`font-black text-xs ${contractColor}`}>{String(contractRaw).split('T')[0]}</span>
              </div>
            )}
          </div>
          <button onClick={() => onSaveToWatchlist(player)} className={`w-full py-3.5 font-black uppercase text-[11px] tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all mt-2 ${isInWatchlist ? 'bg-[#161b22] border border-[#00ff88] text-[#00ff88]' : 'bg-[#00ff88] text-black shadow-[0_0_15px_rgba(0,255,136,0.3)]'}`}>
            {isInWatchlist ? '★ In Watchlist' : '+ Add to Watchlist'}
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8 overflow-x-hidden">
          <div className="max-w-4xl mx-auto space-y-8">

          {/* 1. ATRIBUTE CHEIE */}
          <section>
            <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">Key Attributes</h2>
            <div className="grid grid-cols-3 gap-3">
              {[['Pace', attrs.viteza], ['Dribbling', attrs.dribling], ['Passing', attrs.pasare],
                ['Shooting', attrs.finalizare], ['Physical', attrs.fizic], ['Defending', attrs.aparare]].map(([l, v]) => (
                <AttrBox key={l} label={l} value={v} />
              ))}
            </div>
          </section>

          {/* 2. STATISTICI SEZON + SUMAR CARIERĂ */}
          <section>
            <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">
              Season Stats {s.year || pd.lastSeason}
            </h2>
            <div className="bg-[#0d1117] border border-gray-800 rounded-3xl p-6 space-y-4">
              <StatBar label="Goals" value={s.goals} max={40} />
              <StatBar label="Assists" value={s.assists} max={25} />
              <StatBar label="Matches" value={s.matches} max={50} />
              <StatBar label="Goals / match" value={gpm} max={1.0} />
              <StatBar label="Assists / match" value={apm} max={0.7} />
              <StatBar label="Min / meci" value={mpm} max={90} unit=" min" />
              <div className="border-t border-gray-800 pt-4 grid grid-cols-4 gap-3">
                {[
                  ['Career Goals', c.goals, 'text-[#00ff88]'],
                  ['Career Assists', c.assists, 'text-blue-400'],
                  ['Career Matches', c.matches, 'text-white'],
                  ['Yellow Cards', c.yellowCards, 'text-yellow-400'],
                ].map(([label, val, cls]) => (
                  <div key={label} className="text-center">
                    <div className={`text-2xl font-black ${cls}`}>{val}</div>
                    <div className="text-[8px] text-gray-600 uppercase tracking-wider mt-0.5 leading-tight">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3. EVOLUȚIE PE SEZOANE */}
          {pd.seasonBreakdown && pd.seasonBreakdown.length > 0 && (
            <section>
              <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">Season Breakdown</h2>
              <div className="bg-[#0d1117] border border-gray-800 rounded-3xl overflow-hidden">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Year', 'Matches', 'Goals', 'Assists', 'Min/match', 'Yellows', 'Reds'].map(h => (
                        <th key={h} className="text-gray-600 font-black uppercase tracking-wider px-4 py-3 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pd.seasonBreakdown.map((row, i) => {
                      const mpmRow = row.matches > 0 ? Math.round(row.minutes / row.matches) : 0;
                      const lowMinutes = mpmRow < 60 && row.matches > 3;
                      return (
                        <tr key={i} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                          <td className="px-4 py-3 font-black text-white">{row.year}</td>
                          <td className="px-4 py-3 text-gray-300">{row.matches}</td>
                          <td className="px-4 py-3 font-black text-[#00ff88]">{row.goals}</td>
                          <td className="px-4 py-3 text-blue-400">{row.assists}</td>
                          <td className={`px-4 py-3 font-black ${lowMinutes ? 'text-orange-400' : 'text-gray-300'}`}>
                            {mpmRow}'
                            {lowMinutes && <span className="ml-1 text-orange-400 text-[8px]">▼</span>}
                          </td>
                          <td className="px-4 py-3 text-yellow-400">{row.yellowCards}</td>
                          <td className="px-4 py-3 text-red-400">{row.redCards || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 4. PASAPORT FINANCIAR */}
          <section>
            <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">Pasaport Financiar</h2>
            <div className="bg-[#0d1117] border border-gray-800 rounded-3xl p-6 space-y-6">
              {/* Cotă actuală vs maximă */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#161b22] rounded-2xl p-4">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Cotă actuală</p>
                  <p className="text-2xl font-black text-[#00ff88]">{pd.marketValue}</p>
                </div>
                <div className="bg-[#161b22] rounded-2xl p-4">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Cotă maximă carieră</p>
                  <p className="text-2xl font-black text-yellow-400">{pd.highestValue}</p>
                </div>
              </div>

              {/* Analiză AI financiară */}
              {(analysis.pasaportFinanciar || analysis.potentialFinanciar) && (
                <div>
                  <p className="text-[9px] font-black text-yellow-400 uppercase tracking-widest mb-2">Financial Analysis</p>
                  <p className="text-gray-300 text-sm normal-case font-normal leading-relaxed">
                    {analysis.pasaportFinanciar || analysis.potentialFinanciar}
                  </p>
                </div>
              )}

              {/* Grafic evoluție valoare */}
              {valuations.length > 1 && (
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Market Value Evolution</p>
                  <div className="flex items-end gap-0.5 h-16">
                    {valuations.slice(-16).map((v, i, arr) => {
                      const h = Math.max(4, Math.round((v.value / maxVal) * 60));
                      const isLast = i === arr.length - 1;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <div
                            className={`w-full rounded-t-sm transition-all ${isLast ? 'bg-[#00ff88]' : 'bg-[#00ff88]/40'}`}
                            style={{ height: `${h}px` }}
                          />
                          {(i === 0 || isLast) && (
                            <span className="text-[7px] text-gray-700">{v.date?.slice(0, 4)}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Istoric transferuri */}
              {pd.transfers && pd.transfers.length > 0 && (
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Transfer History</p>
                  <div className="space-y-2">
                    {pd.transfers.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 text-[10px] min-w-0">
                        <span className="text-gray-600 font-bold w-16 shrink-0">{(t.date || '').slice(0, 7)}</span>
                        <span className="text-gray-400 truncate flex-1 min-w-0">{t.fromClub || '—'}</span>
                        <span className="text-gray-700 shrink-0">→</span>
                        <span className="text-white font-black truncate flex-1 min-w-0">{t.toClub || '—'}</span>
                        <span className={`ml-auto shrink-0 font-black ${t.fee > 0 ? 'text-[#00ff88]' : 'text-gray-600'}`}>
                          {t.fee > 0 ? t.feeFormatted : 'free'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 5. MECIURI REMARCABILE */}
          {pd.topGames && pd.topGames.length > 0 && (
            <section>
              <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">Remarkable Matches (Career)</h2>
              <div className="space-y-2">
                {pd.topGames.map((g, i) => (
                  <div key={i} className="bg-[#0d1117] border border-gray-800 rounded-2xl px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Trophy size={14} className="text-[#00ff88] shrink-0" />
                      <span className="text-gray-400 text-[10px] font-bold uppercase">{g.date}</span>
                      <span className="text-gray-600 text-[9px] uppercase">{g.competition}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-black">
                      {g.goals > 0 && <span className="text-[#00ff88]">{g.goals} {g.goals === 1 ? 'goal' : 'goals'}</span>}
                      {g.assists > 0 && <span className="text-blue-400">{g.assists} {g.assists === 1 ? 'assist' : 'assists'}</span>}
                      <span className="text-gray-500">{g.minutes} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 6. ANALIZĂ AI — STIL DE JOC */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">AI Analysis — Playstyle & 4-3-3 Fit</h2>
            </div>
            <div className="bg-[#0d1117] border border-gray-800 rounded-3xl p-6 space-y-4">
              <div>
                <p className="text-[9px] font-black text-[#00ff88] uppercase tracking-widest mb-2">Playstyle</p>
                <p className="text-gray-300 text-sm normal-case font-normal leading-relaxed">{analysis.stilDeJoc}</p>
              </div>
              <div className="border-t border-gray-800 pt-4">
                <p className="text-[9px] font-black text-[#00ff88] uppercase tracking-widest mb-2">4-3-3 Fit</p>
                <p className="text-gray-300 text-sm normal-case font-normal leading-relaxed">{analysis.potrivire443}</p>
              </div>
            </div>
          </section>

          {/* 7. RISCURI TRANSFER */}
          {riscuriTransfer.length > 0 && (
            <section>
              <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">Transfer Risks</h2>
              <div className="space-y-2">
                {riscuriTransfer.map((r, i) => <RiskCard key={i} risk={r} />)}
              </div>
            </section>
          )}

          {/* 8. RISCURI ACCIDENTARE & DISPONIBILITATE */}
          {riscuriAccidentare.length > 0 && (
            <section>
              <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">Injury Risks & Availability</h2>
              <div className="space-y-2">
                {riscuriAccidentare.map((r, i) => <RiskCard key={i} risk={r} />)}
              </div>
            </section>
          )}

          {/* 9. VERDICT */}
          <section className="pb-12">
            <div className="bg-[#0d1117] border border-gray-800 rounded-3xl p-6 flex items-start gap-6">
              <div className="text-5xl font-black shrink-0" style={{ color: gradeColor }}>{analysis.verdictGrade}</div>
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Verdict</p>
                <p className="text-gray-200 text-sm normal-case font-normal leading-relaxed">{analysis.verdictText}</p>
              </div>
            </div>
          </section>

          </div>
        </main>
      </div>
    </div>
  );
};

// --- 1. LOGIN PAGE ---
const LoginPage = ({ onLogin }) => {
  const handleSubmit = (e) => { e.preventDefault(); onLogin(); };
  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 font-sans text-white text-center">
      <div className="w-full max-w-md bg-[#0d1117] border border-gray-800 rounded-[3rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="flex items-center justify-center gap-4 mb-2">
          <img src="/logo.svg" alt="U Cluj Logo" className="w-12 h-12 object-contain drop-shadow-md" />
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-0"><span className="text-white text-5xl">SCOUT</span></h1>
        </div>
        <p className="text-gray-500 font-bold text-[10px] tracking-widest uppercase mb-10 opacity-50">Scouting Management System</p>
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="space-y-2 text-left"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Email Address</label><input type="email" placeholder="scout@u-cluj.ro" className="w-full bg-[#161b22] border border-gray-800 rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-[#00ff88] transition-all" required /></div>
          <div className="space-y-2 text-left"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Password</label><input type="password" placeholder="••••••••" className="w-full bg-[#161b22] border border-gray-800 rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-[#00ff88] transition-all" required /></div>
          <button type="submit" className="w-full py-4 bg-[#00ff88] text-black font-black uppercase text-xs rounded-2xl shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:scale-[1.02] active:scale-95 transition-all">Login</button>
        </form>
      </div>
    </div>
  );
};

// --- 2. PLAYER CARD ---
const PlayerCard = ({ player, compact = false, isFavoriteDefault = true, isInWatchlist, disableFavorite = false, onOpenReport, onFavoriteClick, isPinned, onPinToggle, onAddToOtherFolder, showOptions = false, isSlideshow = false, showMatchScore = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const starred = isInWatchlist !== undefined ? isInWatchlist : isFavoriteDefault;
  const [isStarred, setIsStarred] = useState(starred);

  useEffect(() => {
    setIsStarred(isInWatchlist !== undefined ? isInWatchlist : isFavoriteDefault);
  }, [isInWatchlist, isFavoriteDefault]);

  if (!player) return null;
  const arcLength = 142; 
  const dashOffset = arcLength - (player.match / 100) * arcLength;

  return (
    <div className={`relative w-full ${compact ? 'h-[380px]' : 'h-[460px]'} perspective-1000 font-sans`}>
      <div className={`relative w-full h-full transition-all duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
        <div className="absolute w-full h-full backface-hidden bg-[#0d1117] border border-gray-800 rounded-[2.5rem] p-7 shadow-2xl flex flex-col justify-between text-left text-white">
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <span className="bg-[#00ff88] text-black text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-tighter w-fit shadow-md">{player.position}</span>
              {!isSlideshow && (
                <div className="flex items-center gap-2 bg-[#161b22] p-1.5 rounded-lg border border-gray-800 w-fit font-bold italic shadow-sm">
                  <Flag code={player.countryCode} className="w-5 h-3.5 object-cover rounded-sm" />
                  <span className="text-[11px] font-black text-gray-400 uppercase">{player.countryCode}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-3 no-flip font-bold italic">
              {isSlideshow && (
                <div className="flex items-center gap-2 bg-[#161b22] p-1.5 rounded-lg border border-gray-800 w-fit font-bold italic shadow-sm">
                  <Flag code={player.countryCode} className="w-5 h-3.5 object-cover rounded-sm" />
                  <span className="text-[11px] font-black text-gray-400 uppercase">{player.countryCode}</span>
                </div>
              )}
              <div className="flex flex-col items-center gap-2 pr-2">
              {showOptions && (
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className={`p-1.5 rounded-full transition-all ${isMenuOpen ? 'bg-[#00ff88] text-black' : 'text-gray-500 hover:text-white'}`}><MoreHorizontal size={18} /></button>
                  {isMenuOpen && (
                    <div className="absolute top-0 right-full mr-2 w-48 bg-[#161b22] border border-gray-800 rounded-2xl shadow-2xl z-[50] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={(e) => { e.stopPropagation(); onPinToggle(); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase text-white hover:bg-white/5 border-b border-gray-800/50">
                            <Pin size={14} className={isPinned ? "text-[#00ff88] fill-[#00ff88]" : "text-gray-500"} /> {isPinned ? 'Unpin' : 'Pin Card'}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onAddToOtherFolder(); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase text-white hover:bg-white/5">
                            <FolderPlus size={14} className="text-gray-500" /> Move Player
                        </button>
                    </div>
                  )}
                </div>
              )}
              {!disableFavorite && <button onClick={(e) => { e.stopPropagation(); if (isInWatchlist === undefined) setIsStarred(s => !s); onFavoriteClick(player); }}><Star size={compact ? 22 : 28} fill={isStarred ? "#00ff88" : "transparent"} color={isStarred ? "#00ff88" : "#374151"} className="transition-all hover:scale-125" /></button>}
              {isPinned && !isMenuOpen && <Pin size={14} className="text-[#00ff88] fill-[#00ff88] mt-1" />}
              </div>
            </div>
          </div>
          <div className="relative flex flex-col items-center">
            {showMatchScore ? (
              <>
                <svg viewBox="0 0 100 55" className={`${compact ? 'w-[120px] h-[66px]' : 'w-[160px] h-[88px]'} overflow-visible`}>
                  <path d="M 5,50 A 45,45 0 0 1 95,50" stroke="#1f2937" strokeWidth="6" fill="none" strokeLinecap="round" />
                  <path d="M 5,50 A 45,45 0 0 1 95,50" stroke="#00ff88" strokeWidth="6" fill="none" strokeLinecap="round" style={{ strokeDasharray: arcLength, strokeDashoffset: dashOffset, transition: 'stroke-dashoffset 1.5s ease-out' }} />
                </svg>
                <div className={`${compact ? 'w-24 h-24 -mt-[54px] border-[5px]' : 'w-32 h-32 -mt-[72px] border-[8px]'} rounded-full bg-[#161b22] border-[#0d1117] flex items-center justify-center overflow-hidden z-10 shadow-lg`}>
                  {player.imageUrl && player.imageUrl !== 'nan' && player.imageUrl !== '' ? (
                    <img src={player.imageUrl} alt={player.name} referrerPolicy="no-referrer" className="w-full h-full object-cover bg-white" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=161b22&color=00ff88`; }} />
                  ) : (
                    <UserRound size={compact ? 56 : 72} color="#374151" className="opacity-40" />
                  )}
                </div>
                <div className="bg-[#00ff88] text-black font-black text-[10px] px-4 py-1 rounded-full shadow-[0_0_15px_rgba(0,255,136,0.4)] uppercase tracking-tighter -mt-3 z-20">
                    {player.match}% Match
                </div>
              </>
            ) : (
              <div className={`mt-3 ${compact ? 'w-28 h-28 border-[6px]' : 'w-36 h-36 border-[8px]'} rounded-full bg-[#161b22] border-[#0d1117] flex items-center justify-center overflow-hidden z-10 shadow-xl`}>
                {player.imageUrl && player.imageUrl !== 'nan' && player.imageUrl !== '' ? (
                  <img src={player.imageUrl} alt={player.name} referrerPolicy="no-referrer" className="w-full h-full object-cover bg-white" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=161b22&color=00ff88`; }} />
                ) : (
                  <UserRound size={compact ? 64 : 80} color="#374151" className="opacity-40" />
                )}
              </div>
            )}
          </div>
          <div className="text-center mt-2">
            <h2 className={`${compact ? 'text-base' : 'text-2xl'} font-black text-white leading-[0.9] tracking-tighter uppercase italic text-center`}>{player.name.split(' ')[0]}<br /><span className="text-[#00ff88]">{player.name.split(' ')[1]}</span></h2>
            <p className="text-gray-500 text-[8px] font-bold mt-2 uppercase tracking-widest text-center">{player.club} • {player.age} ANI</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800/50 flex justify-between items-end text-white text-left italic font-bold">
            <div className="flex flex-col text-left"><span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter mb-0.5">Value</span><span className={`${compact ? 'text-lg' : 'text-3xl'} font-black text-white tracking-tighter`}>{player.value}</span></div>
            <div className="flex gap-2 bg-black/20 p-2 rounded-xl border border-gray-800/40 font-bold italic">
              <div className={`w-4 h-6 rounded-sm border ${player.foot === 'left' || player.foot === 'both' ? 'bg-[#00ff88] border-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.4)]' : 'bg-transparent border-[#00ff88]/30 border-dashed'}`} />
              <div className={`w-4 h-6 rounded-sm border ${player.foot === 'right' || player.foot === 'both' ? 'bg-[#00ff88] border-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.4)]' : 'bg-transparent border-[#00ff88]/30 border-dashed'}`} />
            </div>
          </div>
        </div>
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#161b22] border-2 border-[#00ff88]/50 rounded-[2.5rem] p-4 shadow-2xl flex flex-col justify-between text-left text-white font-sans font-black italic">
          {(() => {
            const pos = player.position || '';
            const mc = player.matchesPlayed || 0;
            const gpm = mc > 0 ? (player.goals / mc).toFixed(2) : '0.00';
            const apm = mc > 0 ? (player.assists / mc).toFixed(2) : '0.00';
            const h = player.height ? `${player.height}cm` : 'N/A';
            const NA = 'N/A';

            const ico = (name, sz = 14) => {
              const map = { goal: <Goal size={sz}/>, spark: <Sparkles size={sz}/>, cal: <CalendarDays size={sz}/>, trend: <TrendingUp size={sz}/>, timer: <Timer size={sz}/>, zap: <Zap size={sz}/>, shield: <Shield size={sz}/>, trophy: <Trophy size={sz}/>, bar: <BarChart2 size={sz}/>, alert: <AlertTriangle size={sz}/>, user: <UserRound size={sz}/>, activity: <Activity size={sz}/> };
              return map[name] || <Activity size={sz}/>;
            };
            const Yel = <Square size={12} className="fill-yellow-400 text-yellow-400"/>;
            const Red = <Square size={12} className="fill-red-500 text-red-500"/>;

            const attr = player.attributes || {};

            let title, titleIcon, stats;

            if (['CF','SS','FW','ST','AT'].includes(pos)) {
              title = 'Striker'; titleIcon = ico('goal');
              stats = [
                { label: 'Goals',         val: player.goals ?? 0,         color: 'text-[#00ff88]',  icon: ico('goal') },
                { label: 'Assists',       val: player.assists ?? 0,       color: 'text-blue-400',   icon: ico('spark') },
                { label: 'Dribbling',     val: attr.dribling ?? NA,       color: 'text-purple-400', icon: ico('zap') },
                { label: 'Shooting',      val: attr.finalizare ?? NA,     color: 'text-yellow-400', icon: ico('bar') },
                { label: 'Height',        val: h,                         color: 'text-gray-400',   icon: ico('user') },
                { label: 'Matches',       val: mc,                        color: 'text-gray-500',   icon: ico('cal') },
              ];
            } else if (['LW','RW'].includes(pos)) {
              title = 'Winger'; titleIcon = ico('zap');
              stats = [
                { label: 'Pace',          val: attr.viteza ?? NA,         color: 'text-yellow-400', icon: ico('zap') },
                { label: 'Goals',         val: player.goals ?? 0,         color: 'text-[#00ff88]',  icon: ico('goal') },
                { label: 'Crossing',      val: attr.pasare ?? NA,         color: 'text-blue-400',   icon: ico('trend') },
                { label: 'Dribbling',     val: attr.dribling ?? NA,       color: 'text-pink-400',   icon: ico('spark') },
                { label: 'Matches',       val: mc,                        color: 'text-gray-500',   icon: ico('cal') },
                { label: 'Assists',       val: player.assists ?? 0,       color: 'text-purple-400', icon: ico('spark') },
              ];
            } else if (['LM','RM'].includes(pos)) {
              title = 'Wide Midfielder'; titleIcon = ico('zap');
              stats = [
                { label: 'Pace',          val: attr.viteza ?? NA,         color: 'text-yellow-400', icon: ico('zap') },
                { label: 'Goals',         val: player.goals ?? 0,         color: 'text-[#00ff88]',  icon: ico('goal') },
                { label: 'Ball Control',  val: attr.dribling ?? NA,       color: 'text-blue-400',   icon: ico('trend') },
                { label: 'Crossing',      val: attr.pasare ?? NA,         color: 'text-pink-400',   icon: ico('bar') },
                { label: 'Matches',       val: mc,                        color: 'text-gray-500',   icon: ico('cal') },
                { label: 'Assists',       val: player.assists ?? 0,       color: 'text-purple-400', icon: ico('spark') },
              ];
            } else if (['AM','CAM'].includes(pos)) {
              title = 'Attacking Mid.'; titleIcon = ico('spark');
              stats = [
                { label: 'Passing',       val: attr.pasare ?? NA,         color: 'text-blue-400',   icon: ico('trend') },
                { label: 'Goals',         val: player.goals ?? 0,         color: 'text-[#00ff88]',  icon: ico('goal') },
                { label: 'Vision',        val: attr.pasare ?? NA,         color: 'text-pink-400',   icon: ico('spark') },
                { label: 'Dribbling',     val: attr.dribling ?? NA,       color: 'text-purple-400', icon: ico('zap') },
                { label: 'Assists',       val: player.assists ?? 0,       color: 'text-yellow-400', icon: ico('spark') },
                { label: 'Matches',       val: mc,                        color: 'text-gray-500',   icon: ico('cal') },
              ];
            } else if (['CM','MF'].includes(pos)) {
              title = 'Midfielder'; titleIcon = ico('spark');
              stats = [
                { label: 'Passing',       val: attr.pasare ?? NA,         color: 'text-blue-400',   icon: ico('trend') },
                { label: 'Goals',         val: player.goals ?? 0,         color: 'text-[#00ff88]',  icon: ico('goal') },
                { label: 'Physical',      val: attr.fizic ?? NA,          color: 'text-pink-400',   icon: ico('shield') },
                { label: 'Dribbling',     val: attr.dribling ?? NA,       color: 'text-purple-400', icon: ico('zap') },
                { label: 'Assists',       val: player.assists ?? 0,       color: 'text-yellow-400', icon: ico('spark') },
                { label: 'Matches',       val: mc,                        color: 'text-gray-500',   icon: ico('cal') },
              ];
            } else if (['LB','RB','LWB','RWB'].includes(pos)) {
              title = 'Fullback'; titleIcon = ico('shield');
              stats = [
                { label: 'Pace',          val: attr.viteza ?? NA,         color: 'text-yellow-400', icon: ico('zap') },
                { label: 'Defending',     val: attr.aparare ?? NA,        color: 'text-purple-400', icon: ico('shield') },
                { label: 'Crossing',      val: attr.pasare ?? NA,         color: 'text-blue-400',   icon: ico('trend') },
                { label: 'Ball Control',  val: attr.dribling ?? NA,       color: 'text-pink-400',   icon: ico('bar') },
                { label: 'Passing',       val: attr.pasare ?? NA,         color: 'text-[#00ff88]',  icon: ico('trend') },
                { label: 'Matches',       val: mc,                        color: 'text-gray-500',   icon: ico('cal') },
              ];
            } else if (['CB','SW','DEF','CDM','DM'].includes(pos)) {
              title = pos === 'CDM' || pos === 'DM' ? 'Defensive Mid.' : 'Center Back'; titleIcon = ico('shield');
              stats = [
                { label: 'Tackling',      val: attr.aparare ?? NA,        color: 'text-[#00ff88]',  icon: ico('shield') },
                { label: 'Physical',      val: attr.fizic ?? NA,          color: 'text-blue-400',   icon: ico('activity') },
                { label: 'Yellows',       val: player.yellowCards ?? 0,   color: 'text-yellow-400', icon: Yel },
                { label: 'Passing',       val: attr.pasare ?? NA,         color: 'text-purple-400', icon: ico('trend') },
                { label: 'Height',        val: h,                         color: 'text-purple-400', icon: ico('user') },
                { label: 'Matches',       val: mc,                        color: 'text-gray-500',   icon: ico('cal') },
              ];
            } else if (pos === 'GK') {
              title = 'Goalkeeper'; titleIcon = ico('trophy');
              stats = [
                { label: 'Height',        val: h,                         color: 'text-purple-400', icon: ico('user') },
                { label: 'Reflexes',      val: attr.aparare ?? NA,        color: 'text-[#00ff88]',  icon: ico('shield') },
                { label: 'Positioning',   val: attr.fizic ?? NA,          color: 'text-yellow-400', icon: ico('activity') },
                { label: 'Handling',      val: attr.pasare ?? NA,         color: 'text-blue-400',   icon: ico('activity') },
                { label: 'Diving',        val: attr.viteza ?? NA,         color: 'text-pink-400',   icon: ico('zap') },
                { label: 'Matches',       val: mc,                        color: 'text-gray-500',   icon: ico('cal') },
              ];
            } else {
              title = 'Stats'; titleIcon = ico('activity');
              stats = [
                { label: 'Goals',         val: player.goals ?? 0,         color: 'text-[#00ff88]',  icon: ico('goal') },
                { label: 'Assists',       val: player.assists ?? 0,       color: 'text-blue-400',   icon: ico('spark') },
                { label: 'Pace',          val: attr.viteza ?? NA,         color: 'text-yellow-400', icon: ico('zap') },
                { label: 'Passing',       val: attr.pasare ?? NA,         color: 'text-purple-400', icon: ico('trend') },
                { label: 'Physical',      val: attr.fizic ?? NA,          color: 'text-pink-400',   icon: ico('shield') },
                { label: 'Matches',       val: mc,                        color: 'text-gray-500',   icon: ico('cal') },
              ];
            }

            return (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[#00ff88] font-black uppercase text-[9px] tracking-widest">{title}</h3>
                  <span className="text-[#00ff88]">{titleIcon}</span>
                </div>
                <div className="flex-1 flex flex-col gap-1 justify-center">
                  {stats.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-black/30 px-3 py-1.5 rounded-xl border border-gray-800/60">
                      <div className="flex items-center gap-2">
                        <span className={s.color}>{s.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-tight text-gray-400">{s.label}</span>
                      </div>
                      <span className={`font-black text-[13px] ${s.color}`}>{s.val}</span>
                    </div>
                  ))}
                </div>
                <button onClick={(e) => { e.stopPropagation(); onOpenReport(player); }} className="mt-2 w-full py-2 bg-ucluj-green text-black font-black uppercase text-[9px] tracking-widest rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 font-sans">Report</button>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

// --- 3. SEARCHABLE SELECT ---
const SearchablePlayerSelect = ({ players, selectedPlayerId, onSelect, colorClass, placeholder }) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const filtered = players.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    useEffect(() => {
        const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
    }, []);
    const sel = players.find(p => p.id === Number(selectedPlayerId));
    return (
        <div className="relative w-full max-w-xs" ref={dropdownRef}>
            <div className={`flex items-center bg-[#0d1117] border border-gray-800 rounded-2xl px-6 py-4 focus-within:border-${colorClass} transition-all`}>
                <input type="text" placeholder={placeholder} value={isOpen ? query : (sel?.name || "")} onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }} onFocus={() => { setQuery(""); setIsOpen(true); }} className="bg-transparent border-none text-base font-black uppercase text-white outline-none w-full placeholder:text-gray-600 tracking-widest" />
                <ChevronDown size={20} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#0d1117] border border-gray-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="max-h-60 overflow-y-auto scrollbar-hide">
                        {filtered.length > 0 ? filtered.map(p => (
                            <button key={p.id} onClick={() => { onSelect(p.id); setIsOpen(false); setQuery(""); }} className="w-full text-left px-6 py-4 text-sm font-black uppercase text-white hover:bg-white/5 transition-all border-b border-gray-800/30 tracking-widest font-sans">{p.name} <span className="text-[9px] text-gray-500 ml-2 italic">({p.club})</span></button>
                        )) : <div className="p-4 text-xs text-gray-600 italic uppercase">No player found</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 4. MAIN APP ---
const SHOWCASE_PLAYERS = [
  { id: 28003, name: "Lionel Messi", position: "CF", club: "Inter Miami", age: 37, goals: 11, assists: 14, matchesPlayed: 19, match: 99, value: "€10M", countryCode: "AR", foot: "left", imageUrl: "http://localhost:8000/player-image/28003" },
  { id: 8198, name: "Cristiano Ronaldo", position: "ST", club: "Al Nassr", age: 39, goals: 35, assists: 11, matchesPlayed: 40, match: 97, value: "€15M", countryCode: "PT", foot: "right", imageUrl: "http://localhost:8000/player-image/8198" },
  { id: 342229, name: "Kylian Mbappé", position: "ST", club: "Real Madrid", age: 25, goals: 31, assists: 7, matchesPlayed: 36, match: 98, value: "€180M", countryCode: "FR", foot: "right", imageUrl: "http://localhost:8000/player-image/342229" },
  { id: 418560, name: "Erling Haaland", position: "ST", club: "Man City", age: 23, goals: 27, assists: 5, matchesPlayed: 31, match: 97, value: "€200M", countryCode: "NO", foot: "left", imageUrl: "http://localhost:8000/player-image/418560" },
  { id: 371998, name: "Vinicius Jr", position: "LW", club: "Real Madrid", age: 23, goals: 24, assists: 11, matchesPlayed: 39, match: 96, value: "€180M", countryCode: "BR", foot: "right", imageUrl: "http://localhost:8000/player-image/371998" },
  { id: 8163, name: "Rodri", position: "CM", club: "Man City", age: 27, goals: 8, assists: 9, matchesPlayed: 35, match: 95, value: "€120M", countryCode: "ES", foot: "right", imageUrl: "http://localhost:8000/player-image/8163" },
  { id: 581678, name: "Jude Bellingham", position: "CAM", club: "Real Madrid", age: 20, goals: 23, assists: 13, matchesPlayed: 42, match: 96, value: "€180M", countryCode: "GB-ENG", foot: "right", imageUrl: "http://localhost:8000/player-image/581678" },
  { id: 148455, name: "Mohamed Salah", position: "RW", club: "Liverpool", age: 31, goals: 29, assists: 13, matchesPlayed: 51, match: 94, value: "€60M", countryCode: "EG", foot: "left", imageUrl: "http://localhost:8000/player-image/148455" },
  { id: 132098, name: "Harry Kane", position: "ST", club: "Bayern Munich", age: 30, goals: 36, assists: 10, matchesPlayed: 43, match: 95, value: "€100M", countryCode: "GB-ENG", foot: "right", imageUrl: "http://localhost:8000/player-image/132098" },
  { id: 683840, name: "Pedri", position: "CM", club: "Barcelona", age: 21, goals: 6, assists: 8, matchesPlayed: 28, match: 93, value: "€120M", countryCode: "ES", foot: "right", imageUrl: "http://localhost:8000/player-image/683840" },
  { id: 406635, name: "Phil Foden", position: "AM", club: "Man City", age: 23, goals: 19, assists: 8, matchesPlayed: 35, match: 94, value: "€150M", countryCode: "GB-ENG", foot: "left", imageUrl: "http://localhost:8000/player-image/406635" },
  { id: 937958, name: "Lamine Yamal", position: "RW", club: "Barcelona", age: 16, goals: 15, assists: 10, matchesPlayed: 37, match: 95, value: "€180M", countryCode: "ES", foot: "right", imageUrl: "http://localhost:8000/player-image/937958" },
  { id: 433177, name: "Bukayo Saka", position: "RW", club: "Arsenal", age: 22, goals: 16, assists: 11, matchesPlayed: 41, match: 93, value: "€150M", countryCode: "GB-ENG", foot: "left", imageUrl: "http://localhost:8000/player-image/433177" },
  { id: 598577, name: "Florian Wirtz", position: "CAM", club: "Bayer Leverkusen", age: 20, goals: 18, assists: 20, matchesPlayed: 40, match: 94, value: "€130M", countryCode: "DE", foot: "right", imageUrl: "http://localhost:8000/player-image/598577" },
  { id: 357662, name: "Declan Rice", position: "CM", club: "Arsenal", age: 25, goals: 7, assists: 9, matchesPlayed: 38, match: 91, value: "€100M", countryCode: "GB-ENG", foot: "right", imageUrl: "http://localhost:8000/player-image/357662" },
  { id: 580195, name: "Jamal Musiala", position: "AM", club: "Bayern Munich", age: 21, goals: 12, assists: 10, matchesPlayed: 29, match: 93, value: "€130M", countryCode: "DE", foot: "right", imageUrl: "http://localhost:8000/player-image/580195" },

  { id: 258004, name: "Rúben Dias", position: "CB", club: "Man City", age: 26, goals: 3, assists: 2, matchesPlayed: 33, match: 93, value: "€80M", countryCode: "PT", foot: "right", imageUrl: "http://localhost:8000/player-image/258004" },
  { id: 139208, name: "Virgil van Dijk", position: "CB", club: "Liverpool", age: 32, goals: 4, assists: 2, matchesPlayed: 38, match: 92, value: "€45M", countryCode: "NL", foot: "right", imageUrl: "http://localhost:8000/player-image/139208" },
  { id: 314353, name: "Trent Alexander-Arnold", position: "RB", club: "Real Madrid", age: 25, goals: 5, assists: 18, matchesPlayed: 36, match: 92, value: "€80M", countryCode: "GB-ENG", foot: "right", imageUrl: "http://localhost:8000/player-image/314353" },
  { id: 105470, name: "Alisson Becker", position: "GK", club: "Liverpool", age: 31, goals: 0, assists: 0, matchesPlayed: 37, match: 93, value: "€50M", countryCode: "BR", foot: "right", imageUrl: "http://localhost:8000/player-image/105470" },
  { id: 17259, name: "Manuel Neuer", position: "GK", club: "Bayern Munich", age: 37, goals: 0, assists: 0, matchesPlayed: 28, match: 90, value: "€10M", countryCode: "DE", foot: "right", imageUrl: "http://localhost:8000/player-image/17259" },
  { id: 125781, name: "Antoine Griezmann", position: "CF", club: "Atletico Madrid", age: 32, goals: 16, assists: 12, matchesPlayed: 38, match: 91, value: "€30M", countryCode: "FR", foot: "left", imageUrl: "http://localhost:8000/player-image/125781" },
  { id: 406625, name: "Lautaro Martínez", position: "ST", club: "Inter Milan", age: 26, goals: 24, assists: 7, matchesPlayed: 33, match: 93, value: "€110M", countryCode: "AR", foot: "right", imageUrl: "http://localhost:8000/player-image/406625" },
  { id: 502670, name: "Khvicha Kvaratskhelia", position: "LW", club: "Paris SG", age: 22, goals: 14, assists: 17, matchesPlayed: 35, match: 92, value: "€100M", countryCode: "GE", foot: "right", imageUrl: "http://localhost:8000/player-image/502670" },
  { id: 369081, name: "Federico Valverde", position: "CM", club: "Real Madrid", age: 25, goals: 10, assists: 9, matchesPlayed: 41, match: 91, value: "€120M", countryCode: "UY", foot: "right", imageUrl: "http://localhost:8000/player-image/369081" },
  { id: 241641, name: "Bernardo Silva", position: "CM", club: "Man City", age: 29, goals: 10, assists: 12, matchesPlayed: 40, match: 92, value: "€80M", countryCode: "PT", foot: "right", imageUrl: "http://localhost:8000/player-image/241641" },
  { id: 240306, name: "Bruno Fernandes", position: "CAM", club: "Man United", age: 29, goals: 15, assists: 14, matchesPlayed: 35, match: 90, value: "€70M", countryCode: "PT", foot: "right", imageUrl: "http://localhost:8000/player-image/240306" },
  { id: 91845, name: "Heung-min Son", position: "LW", club: "Tottenham", age: 31, goals: 17, assists: 10, matchesPlayed: 38, match: 90, value: "€40M", countryCode: "KR", foot: "left", imageUrl: "http://localhost:8000/player-image/91845" },
  { id: 88755, name: "Kevin De Bruyne", position: "CAM", club: "Man City", age: 32, goals: 5, assists: 10, matchesPlayed: 18, match: 95, value: "€40M", countryCode: "BE", foot: "right", imageUrl: "http://localhost:8000/player-image/88755" },
  { id: 709187, name: "Nico Williams", position: "LW", club: "Athletic Bilbao", age: 21, goals: 12, assists: 13, matchesPlayed: 36, match: 91, value: "€80M", countryCode: "ES", foot: "right", imageUrl: "http://localhost:8000/player-image/709187" },
  { id: 293385, name: "Dani Olmo", position: "AM", club: "Barcelona", age: 26, goals: 8, assists: 8, matchesPlayed: 21, match: 90, value: "€60M", countryCode: "ES", foot: "right", imageUrl: "http://localhost:8000/player-image/293385" },
  { id: 82442, name: "Olivier Giroud", position: "ST", club: "LA Galaxy", age: 37, goals: 10, assists: 3, matchesPlayed: 22, match: 82, value: "€2M", countryCode: "FR", foot: "right", imageUrl: "http://localhost:8000/player-image/82442" },
  { id: 38253, name: "Robert Lewandowski", position: "ST", club: "Barcelona", age: 35, goals: 26, assists: 8, matchesPlayed: 35, match: 91, value: "€20M", countryCode: "PL", foot: "right", imageUrl: "http://localhost:8000/player-image/38253" },
  { id: 181767, name: "Marquinhos", position: "CB", club: "Paris SG", age: 29, goals: 4, assists: 1, matchesPlayed: 36, match: 91, value: "€55M", countryCode: "BR", foot: "right", imageUrl: "http://localhost:8000/player-image/181767" },
  { id: 411295, name: "Raphinha", position: "RW", club: "Barcelona", age: 27, goals: 27, assists: 15, matchesPlayed: 42, match: 92, value: "€70M", countryCode: "BR", foot: "left", imageUrl: "http://localhost:8000/player-image/411295" },
  { id: 288230, name: "Ousmane Dembélé", position: "RW", club: "Paris SG", age: 27, goals: 8, assists: 12, matchesPlayed: 30, match: 89, value: "€60M", countryCode: "FR", foot: "left", imageUrl: "http://localhost:8000/player-image/288230" },
  { id: 258923, name: "Marcus Rashford", position: "LW", club: "Aston Villa", age: 26, goals: 8, assists: 4, matchesPlayed: 19, match: 85, value: "€45M", countryCode: "GB-ENG", foot: "right", imageUrl: "http://localhost:8000/player-image/258923" },
  { id: 655488, name: "Gabriel Martinelli", position: "LW", club: "Arsenal", age: 22, goals: 10, assists: 6, matchesPlayed: 31, match: 88, value: "€80M", countryCode: "BR", foot: "right", imageUrl: "http://localhost:8000/player-image/655488" },
  { id: 434675, name: "Cody Gakpo", position: "LW", club: "Liverpool", age: 24, goals: 17, assists: 6, matchesPlayed: 39, match: 88, value: "€70M", countryCode: "NL", foot: "right", imageUrl: "http://localhost:8000/player-image/434675" },
  { id: 486031, name: "Nicolás González", position: "LW", club: "Fiorentina", age: 26, goals: 9, assists: 5, matchesPlayed: 26, match: 84, value: "€28M", countryCode: "AR", foot: "right", imageUrl: "http://localhost:8000/player-image/486031" },
  { id: 406040, name: "Ademola Lookman", position: "RW", club: "Atalanta", age: 26, goals: 15, assists: 9, matchesPlayed: 38, match: 88, value: "€50M", countryCode: "NG", foot: "left", imageUrl: "http://localhost:8000/player-image/406040" },
  { id: 270541, name: "Serhou Guirassy", position: "ST", club: "Borussia Dortmund", age: 28, goals: 20, assists: 4, matchesPlayed: 28, match: 87, value: "€40M", countryCode: "GN", foot: "right", imageUrl: "http://localhost:8000/player-image/270541" },
  { id: 533738, name: "Jonathan David", position: "ST", club: "Lille", age: 24, goals: 25, assists: 5, matchesPlayed: 33, match: 90, value: "€70M", countryCode: "CA", foot: "right", imageUrl: "http://localhost:8000/player-image/533738" },
  { id: 401923, name: "Victor Osimhen", position: "ST", club: "Galatasaray", age: 25, goals: 17, assists: 3, matchesPlayed: 24, match: 89, value: "€75M", countryCode: "NG", foot: "right", imageUrl: "http://localhost:8000/player-image/401923" },
  { id: 343537, name: "Artem Dovbyk", position: "ST", club: "Roma", age: 27, goals: 17, assists: 5, matchesPlayed: 30, match: 86, value: "€38M", countryCode: "UA", foot: "right", imageUrl: "http://localhost:8000/player-image/343537" },
  { id: 576028, name: "Thiago Almada", position: "CAM", club: "Lyon", age: 23, goals: 7, assists: 6, matchesPlayed: 22, match: 83, value: "€25M", countryCode: "AR", foot: "right", imageUrl: "http://localhost:8000/player-image/576028" },
  { id: 122155, name: "Willian José", position: "ST", club: "Real Betis", age: 32, goals: 12, assists: 3, matchesPlayed: 29, match: 78, value: "€5M", countryCode: "BR", foot: "right", imageUrl: "http://localhost:8000/player-image/122155" },
  { id: 607223, name: "Rayan Cherki", position: "AM", club: "Borussia Dortmund", age: 21, goals: 5, assists: 9, matchesPlayed: 24, match: 86, value: "€50M", countryCode: "FR", foot: "right", imageUrl: "http://localhost:8000/player-image/607223" },
  { id: 810092, name: "Warren Zaïre-Emery", position: "CM", club: "Paris SG", age: 18, goals: 3, assists: 5, matchesPlayed: 28, match: 84, value: "€50M", countryCode: "FR", foot: "right", imageUrl: "http://localhost:8000/player-image/810092" },
  { id: 801734, name: "Mathys Tel", position: "FW", club: "Bayern Munich", age: 19, goals: 10, assists: 4, matchesPlayed: 24, match: 83, value: "€60M", countryCode: "FR", foot: "right", imageUrl: "http://localhost:8000/player-image/801734" },
  { id: 971570, name: "Endrick", position: "ST", club: "Real Madrid", age: 18, goals: 5, assists: 2, matchesPlayed: 20, match: 82, value: "€60M", countryCode: "BR", foot: "right", imageUrl: "http://localhost:8000/player-image/971570" },
  { id: 617074, name: "Ilaix Moriba", position: "CM", club: "Genk", age: 21, goals: 4, assists: 6, matchesPlayed: 28, match: 78, value: "€12M", countryCode: "GN", foot: "right", imageUrl: "http://localhost:8000/player-image/617074" },
  { id: 648046, name: "Evan Ferguson", position: "ST", club: "Brighton", age: 20, goals: 5, assists: 2, matchesPlayed: 18, match: 80, value: "€40M", countryCode: "IE", foot: "right", imageUrl: "http://localhost:8000/player-image/648046" },
  { id: 811779, name: "Alejandro Garnacho", position: "LW", club: "Man United", age: 20, goals: 8, assists: 5, matchesPlayed: 30, match: 82, value: "€60M", countryCode: "AR", foot: "left", imageUrl: "http://localhost:8000/player-image/811779" },

  { id: 503987, name: "Noni Madueke", position: "RW", club: "Chelsea", age: 22, goals: 9, assists: 5, matchesPlayed: 30, match: 81, value: "€40M", countryCode: "GB-ENG", foot: "left", imageUrl: "http://localhost:8000/player-image/503987" },
  { id: 487465, name: "Pedro Neto", position: "RW", club: "Chelsea", age: 24, goals: 5, assists: 8, matchesPlayed: 27, match: 85, value: "€60M", countryCode: "PT", foot: "left", imageUrl: "http://localhost:8000/player-image/487465" },
  { id: 39728, name: "Mats Hummels", position: "CB", club: "Roma", age: 35, goals: 2, assists: 1, matchesPlayed: 24, match: 83, value: "€3M", countryCode: "DE", foot: "right", imageUrl: "http://localhost:8000/player-image/39728" },
  { id: 111455, name: "Granit Xhaka", position: "CM", club: "Bayer Leverkusen", age: 31, goals: 5, assists: 9, matchesPlayed: 39, match: 88, value: "€18M", countryCode: "CH", foot: "left", imageUrl: "http://localhost:8000/player-image/111455" },
];

export default function App() {
  const [auth, setAuth] = useState(false);
  const [tab, setTab] = useState('search');
  const [search, setSearch] = useState("");
  const [isHist, setIsHist] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPlayerForReport, setSelectedPlayerForReport] = useState(null);
  const [compareMode, setCompareMode] = useState('between');

  const [watchlistData, setWatchlistData] = useState([]);
  const [folders, setFolders] = useState(["Strikers", "Midfielders", "General"]);
  const [selectedFolder, setSelectedFolder] = useState("ALL");
  const [folderSearch, setFolderSearch] = useState("");
  const [isFolderListOpen, setIsFolderListOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [playerToSave, setPlayerToSave] = useState(null);
  const [newFolderMode, setNewFolderMode] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [moveCopyConfig, setMoveCopyConfig] = useState(null);

  const allPlayers = [...new Map(watchlistData.map(i => [i.player.id, i.player])).values()];
  const [player1Id, setPlayer1Id] = useState(null);
  const [player2Id, setPlayer2Id] = useState(null);

  const p1 = allPlayers.find(p => p.id === Number(player1Id)) || allPlayers[0];
  const p2 = allPlayers.find(p => p.id === Number(player2Id)) || allPlayers[1];

  const handlePinToggle = (playerId, folder) => {
    setWatchlistData(prev => prev.map(i =>
      i.player.id === playerId && i.folder === folder ? { ...i, isPinned: !i.isPinned } : i
    ));
  };

  const handleSaveFolder = (folder) => {
    if (!watchlistData.find(i => i.player.id === playerToSave.id && i.folder === folder)) {
      setWatchlistData(prev => [...prev, { player: playerToSave, folder, isPinned: false }]);
    }
    setPlayerToSave(null);
    setNewFolderMode(false);
  };

  const handleQuickAdd = (p) => {
    const folder = folders.includes('General') ? 'General' : folders[0] || 'General';
    if (!folders.includes(folder)) setFolders(prev => [...prev, folder]);
    if (!watchlistData.find(i => i.player.id === p.id && i.folder === folder)) {
      setWatchlistData(prev => [...prev, { player: p, folder, isPinned: false }]);
    }
  };

  const finalizeMoveCopy = (deleteFromSource) => {
    if (!moveCopyConfig) return;
    const { player, currentFolder, targetFolder } = moveCopyConfig;
    if (!watchlistData.find(i => i.player.id === player.id && i.folder === targetFolder)) {
      setWatchlistData(prev => [...prev, { player, folder: targetFolder, isPinned: false }]);
    }
    if (deleteFromSource) {
      setWatchlistData(prev => prev.filter(i => !(i.player.id === player.id && i.folder === currentFolder)));
    }
    setMoveCopyConfig(null);
  };

  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Salut! Sunt Scout AI. Întreabă-mă despre orice jucător de fotbal — îți ofer statistici reale din baza de date Transfermarkt.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [recommendedPlayers, setRecommendedPlayers] = useState([]);
  const chatEndRef = useRef(null);

  const [dbSearch, setDbSearch] = useState('');
  const [dbResults, setDbResults] = useState([]);
  const [isDbSearching, setIsDbSearching] = useState(false);

  const [searchTabQuery, setSearchTabQuery] = useState('');
  const [searchTabResults, setSearchTabResults] = useState([]);
  const [isSearchTabSearching, setIsSearchTabSearching] = useState(false);

  useEffect(() => {
    if (!searchTabQuery.trim()) { setSearchTabResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearchTabSearching(true);
      try {
        const res = await fetch(`http://localhost:8000/search?q=${encodeURIComponent(searchTabQuery)}&limit=20`);
        const data = await res.json();
        setSearchTabResults(data.players || []);
      } catch {
        setSearchTabResults([]);
      } finally {
        setIsSearchTabSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTabQuery]);

  useEffect(() => {
    if (!dbSearch.trim()) { setDbResults([]); return; }
    const timer = setTimeout(async () => {
      setIsDbSearching(true);
      try {
        const res = await fetch(`http://localhost:8000/search?q=${encodeURIComponent(dbSearch)}&limit=10`);
        const data = await res.json();
        setDbResults(data.players || []);
      } catch {
        setDbResults([]);
      } finally {
        setIsDbSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [dbSearch]);

  const sendMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || isChatLoading) return;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsChatLoading(true);
    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'ai', text: data.response }]);
      if (data.players && data.players.length > 0) {
        setRecommendedPlayers(data.players);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Error: Cannot contact AI server. Ensure the backend is running on port 8000.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const [tempPos, setTempPos] = useState('ALL');
  const [tempMinAge, setTempMinAge] = useState(15);
  const [tempMaxAge, setTempMaxAge] = useState(45);
  const [tempMinGoals, setTempMinGoals] = useState(0);
  const [tempMaxGoals, setTempMaxGoals] = useState(100);
  const [tempMinAssists, setTempMinAssists] = useState(0);
  const [tempMaxAssists, setTempMaxAssists] = useState(100);
  const [tempFolders, setTempFolders] = useState([]);

  const [appPos, setAppPos] = useState('ALL');
  const [appMinAge, setAppMinAge] = useState(15);
  const [appMaxAge, setAppMaxAge] = useState(45);
  const [appMinGoals, setAppMinGoals] = useState(0);
  const [appMaxGoals, setAppMaxGoals] = useState(100);
  const [appMinAssists, setAppMinAssists] = useState(0);
  const [appMaxAssists, setAppMaxAssists] = useState(100);
  const [appFolders, setAppFolders] = useState([]);
  const [filtersActive, setFiltersActive] = useState(false);

  useEffect(() => {
    setIsFilterOpen(false);
    setIsHist(false);
    setSearch("");
    setFolderSearch("");
  }, [tab]);

  const handleApply = () => {
    setAppPos(tempPos); setAppMinAge(tempMinAge); setAppMaxAge(tempMaxAge);
    setAppMinGoals(tempMinGoals); setAppMaxGoals(tempMaxGoals);
    setAppMinAssists(tempMinAssists); setAppMaxAssists(tempMaxAssists);
    setAppFolders(tempFolders);
    setFiltersActive(true);
    setIsFilterOpen(false); 
  };

  const filteredWatchlist = (() => {
    const filtered = watchlistData
      .filter(i => selectedFolder === "ALL" || i.folder === selectedFolder)
      .filter(i => {
        if (!filtersActive) return i.player.name.toLowerCase().includes(search.toLowerCase());
        const matchPos = appPos === 'ALL' || i.player.position === appPos;
        const age = i.player.age;
        const matchAge = age == null || (age >= appMinAge && age <= appMaxAge);
        const goals = i.player.goals ?? 0;
        const matchGoals = goals >= appMinGoals && goals <= appMaxGoals;
        const assists = i.player.assists ?? 0;
        const matchAssists = assists >= appMinAssists && assists <= appMaxAssists;
        const matchFolders = appFolders.length === 0 || appFolders.includes(i.folder);
        return matchPos && matchAge && matchGoals && matchAssists && matchFolders && i.player.name.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

    if (selectedFolder !== "ALL") return filtered;

    const seen = new Set();
    return filtered.filter(i => {
      if (seen.has(i.player.id)) return false;
      seen.add(i.player.id);
      return true;
    });
  })();

  if (!auth) return <LoginPage onLogin={() => setAuth(true)} />;

  return (
    <div className="min-h-screen bg-[#05070a] flex text-white font-sans overflow-hidden select-none tracking-tighter text-left uppercase italic font-bold">
      <aside className="w-64 bg-[#0d1117] border-r border-gray-800 flex flex-col fixed h-full z-50 p-8 shadow-2xl text-left">
        <div className="flex items-center gap-3 mb-10">
          <img src="/logo.svg" alt="U Cluj Logo" className="w-12 h-12 object-contain drop-shadow-md" />
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-0"><span className="text-white text-4xl">SCOUT</span></h1>
        </div>
        <nav className="flex-1 space-y-2.5">
          {[{ id: 'search', label: 'Search Players', icon: <Search size={20}/> }, { id: 'ai', label: 'AI Chat Assist', icon: <MessageSquare size={20}/> }, { id: 'compare', label: 'Head to Head', icon: <Scale size={20}/> }, { id: 'watchlist', label: 'Watchlist', icon: <LayoutList size={20}/> }].map(i => (
            <button key={i.id} onClick={() => setTab(i.id)} className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl font-bold transition-all text-left ${tab===i.id?'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]':'text-gray-500 hover:text-white'}`}>
              <div className="shrink-0">{i.icon}</div><span className="text-xs uppercase whitespace-nowrap leading-none tracking-widest text-left font-black">{i.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={() => setAuth(false)} className="mt-4 flex items-center gap-4 px-4 py-3 text-red-500 font-bold text-xs hover:bg-red-500/10 rounded-xl transition-all uppercase italic tracking-widest"><LogOut size={18}/>Log Out</button>
      </aside>

      <main className={`flex-1 ml-64 p-10 transition-all duration-500 ${isFilterOpen || isHist ? 'mr-80' : ''}`}>
        <div className="max-w-[1600px] mx-auto text-left">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-black uppercase italic tracking-tight text-white uppercase italic">
                {tab==='search' ? 'Search Players' : tab==='ai' ? 'AI Chat Assist' : tab==='compare' ? 'Compare Head to Head' : selectedFolder === "ALL" ? "Watchlist" : selectedFolder}
            </h2>
            {tab==='watchlist' && (
                <div className="flex items-center gap-4 bg-[#0d1117] p-2.5 rounded-3xl border border-gray-800 shadow-xl relative font-bold italic">
                  <div className="relative w-[450px]">
                    <div className="flex items-center bg-[#161b22] border border-gray-800 rounded-2xl px-6 py-4 focus-within:border-[#00ff88] transition-all">
                      <input type="text" placeholder="Search collection..." value={folderSearch || (selectedFolder === "ALL" ? "" : selectedFolder)} onChange={(e) => { setFolderSearch(e.target.value); setIsFolderListOpen(true); }} onFocus={() => setIsFolderListOpen(true)} className="bg-transparent border-none text-xs font-black uppercase text-white outline-none w-full placeholder:text-gray-600 tracking-widest font-bold italic" />
                      <ChevronDown size={20} className={`text-gray-500 cursor-pointer transition-transform ${isFolderListOpen ? 'rotate-180' : ''}`} onClick={() => setIsFolderListOpen(!isFolderListOpen)} />
                    </div>
                    {isFolderListOpen && (
                      <div className="absolute top-full left-0 w-full mt-3 bg-[#0d1117] border border-gray-800 rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 text-left">
                        <button onClick={() => { setSelectedFolder("ALL"); setFolderSearch(""); setIsFolderListOpen(false); }} className="w-full text-left px-7 py-4 text-xs font-black uppercase text-gray-400 hover:bg-[#00ff88] hover:text-black transition-all border-b border-gray-800/50 tracking-widest uppercase italic text-white font-bold">All Collections</button>
                        <div className="max-h-64 overflow-y-auto scrollbar-hide text-left text-white font-bold italic">
                          {folders.filter(f => f.toLowerCase().includes(folderSearch.toLowerCase())).map(f => (
                              <div key={f} className="flex items-center group hover:bg-[#161b22] text-left transition-all font-bold italic"><button onClick={() => { setSelectedFolder(f); setFolderSearch(""); setIsFolderListOpen(false); }} className="flex-1 text-left px-7 py-4 text-xs font-black uppercase text-white tracking-widest font-bold italic">{f}</button><button onClick={(e) => { e.stopPropagation(); setFolderToDelete(f); }} className="px-6 py-4 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all no-flip"><Trash2 size={18} /></button></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2.5 bg-[#161b22] border border-gray-800 rounded-2xl py-3.5 px-7 text-[10px] font-black text-gray-400 hover:text-[#00ff88] transition-all uppercase font-bold italic"><Filter size={16}/> Filters</button>
                  <div className="w-[1px] h-8 bg-gray-800 mx-1"></div>
                  <div className="relative text-left flex items-center pr-4 font-bold italic text-white"><Search className="text-gray-600 mr-3 font-bold italic" size={20}/><input placeholder="Find player..." className="bg-transparent border-none text-sm text-white outline-none w-48 font-bold placeholder:text-gray-700 font-bold italic font-sans" value={search} onChange={(e) => setSearch(e.target.value)}/></div>
                </div>
              )}
            {tab==='ai' && <button onClick={() => setIsHist(!isHist)} className={`flex gap-2 px-5 py-3 rounded-2xl font-bold text-sm border transition-all ${isHist?'bg-white text-black shadow-xl':'text-gray-400 border-gray-800 hover:border-gray-600 uppercase tracking-widest italic font-bold'}`}><History size={18}/> History</button>}
          </div>

          {tab==='search' && (() => {
            const row1 = [...SHOWCASE_PLAYERS.slice(0, 30), ...SHOWCASE_PLAYERS.slice(0, 30)];
            const row2 = [...SHOWCASE_PLAYERS.slice(30), ...SHOWCASE_PLAYERS.slice(30)];
            const displayPlayers = searchTabResults.length > 0 ? searchTabResults : null;
            return (
              <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                {/* SEARCHBAR */}
                <div className="bg-ucluj-dark border border-gray-800 rounded-4xl p-6 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center flex-1 bg-ucluj-gray border border-gray-800 rounded-2xl px-6 py-4 focus-within:border-ucluj-green transition-all">
                      <Search size={18} className="text-gray-500 mr-3 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search player in database..."
                        value={searchTabQuery}
                        onChange={e => setSearchTabQuery(e.target.value)}
                        className="bg-transparent border-none text-sm text-white outline-none w-full placeholder:text-gray-600 normal-case not-italic tracking-normal font-normal"
                      />
                      {isSearchTabSearching && <div className="w-4 h-4 border-2 border-ucluj-green border-t-transparent rounded-full animate-spin ml-2 shrink-0" />}
                      {searchTabQuery && !isSearchTabSearching && (
                        <button onClick={() => { setSearchTabQuery(''); setSearchTabResults([]); }} className="ml-2 text-gray-600 hover:text-white transition-colors shrink-0"><X size={16} /></button>
                      )}
                    </div>
                    {searchTabResults.length > 0 && (
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">{searchTabResults.length} results</span>
                    )}
                  </div>
                </div>

                {/* REZULTATE CAUTARE */}
                {displayPlayers && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 animate-in fade-in duration-300">
                    {displayPlayers.map(player => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        compact={true}
                        isFavoriteDefault={false}
                        isInWatchlist={watchlistData.some(i => i.player.id === player.id)}
                        showOptions={false}
                        isPinned={false}
                        onFavoriteClick={(p) => {
                          if (watchlistData.some(i => i.player.id === p.id)) {
                            setWatchlistData(prev => prev.filter(i => i.player.id !== p.id));
                          } else {
                            setPlayerToSave(p);
                          }
                        }}
                        onPinToggle={() => {}}
                        onAddToOtherFolder={() => {}}
                        onOpenReport={setSelectedPlayerForReport}
                      />
                    ))}
                  </div>
                )}

                {/* SLIDESHOW — vizibil doar fără rezultate de search */}
                {!displayPlayers && (
                  <div className="flex flex-col gap-6 overflow-hidden">
                    {/* Rand 1: stânga → dreapta */}
                    <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
                      <div className="flex gap-4" style={{ width: 'max-content', animation: 'scroll-left 120s linear infinite' }}>
                        {row1.map((player, idx) => (
                          <div key={`r1-${player.id}-${idx}`} className="w-50 shrink-0">
                            <PlayerCard
                              player={player}
                              compact={true}
                              isFavoriteDefault={false}
                              isInWatchlist={false}
                              disableFavorite={true}
                              showOptions={false}
                              isSlideshow={true}
                              isPinned={false}
                              onFavoriteClick={() => {}}
                              onPinToggle={() => {}}
                              onAddToOtherFolder={() => {}}
                              onOpenReport={setSelectedPlayerForReport}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rand 2: dreapta → stânga */}
                    <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
                      <div className="flex gap-4" style={{ width: 'max-content', animation: 'scroll-right 110s linear infinite' }}>
                        {row2.map((player, idx) => (
                          <div key={`r2-${player.id}-${idx}`} className="w-50 shrink-0">
                            <PlayerCard
                              player={player}
                              compact={true}
                              isFavoriteDefault={false}
                              isInWatchlist={false}
                              disableFavorite={true}
                              showOptions={false}
                              isSlideshow={true}
                              isPinned={false}
                              onFavoriteClick={() => {}}
                              onPinToggle={() => {}}
                              onAddToOtherFolder={() => {}}
                              onOpenReport={setSelectedPlayerForReport}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {tab==='watchlist' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in fade-in duration-700 font-bold italic text-white uppercase italic">
               {filteredWatchlist.map(item => (
                    <PlayerCard key={`${item.player.id}-${item.folder}`} player={item.player} isFavoriteDefault={true} isPinned={item.isPinned} showOptions={true} onPinToggle={() => handlePinToggle(item.player.id, item.folder)} onAddToOtherFolder={() => setPlayerToSave({ ...item.player, sourceFolder: item.folder })} onFavoriteClick={() => setWatchlistData(watchlistData.filter(i => !(i.player.id===item.player.id && i.folder===item.folder)))} onOpenReport={setSelectedPlayerForReport} />
                 ))}
            </div>
          )}
          
          {tab==='ai' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              {/* CHAT + GALERIE RECOMANDARI */}
              <div className="flex gap-6 h-[75vh]">
                {/* CHAT */}
                <div className={`flex flex-col bg-[#0d1117] border border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl relative transition-all duration-500 ${recommendedPlayers.length > 0 ? 'w-[60%]' : 'w-full'}`}>
                  <div className="p-5 border-b border-gray-800 bg-[#161b22]/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-ucluj-green flex items-center justify-center text-black shadow-lg"><Bot size={22}/></div>
                    <h3 className="text-sm font-black uppercase text-white italic tracking-widest">SCOUT AI</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-4 text-sm scrollbar-hide text-left">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm font-normal normal-case not-italic tracking-normal leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#00ff88] text-black font-bold' : 'bg-[#161b22] border border-gray-800 text-gray-200'}`}>{msg.text}</div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-[#161b22] border border-gray-800 px-5 py-3 rounded-2xl text-gray-500 text-sm normal-case not-italic tracking-normal">Typing...</div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-6 bg-[#161b22] border-t border-gray-800 flex gap-4">
                    <input type="text" placeholder="Ask AI..." className="flex-1 bg-[#0d1117] border border-gray-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-[#00ff88] outline-none normal-case not-italic tracking-normal" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                    <button onClick={sendMessage} disabled={isChatLoading} className="bg-[#00ff88] text-black p-4 rounded-2xl disabled:opacity-50 transition-opacity"><Send size={20} /></button>
                  </div>
                </div>

                {/* GALERIE JUCATORI RECOMANDATI */}
                {recommendedPlayers.length > 0 && (
                  <div className="w-[40%] flex flex-col bg-[#0d1117] border border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="p-5 border-b border-gray-800 bg-[#161b22]/50 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#161b22] border border-gray-700 flex items-center justify-center text-[#00ff88]"><Sparkles size={16}/></div>
                        <h3 className="text-[11px] font-black uppercase text-white italic">Mentioned Players</h3>
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{recommendedPlayers.length}</span>
                      </div>
                      <button onClick={() => setRecommendedPlayers([])} className="text-gray-600 hover:text-white transition-colors"><X size={18}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                      <div className="grid grid-cols-2 gap-4" style={{ gridAutoRows: '380px' }}>
                        {recommendedPlayers.map(player => (
                          <PlayerCard
                            key={player.id}
                            player={player}
                            compact={true}
                            isFavoriteDefault={false}
                            isInWatchlist={watchlistData.some(i => i.player.id === player.id)}
                            showOptions={false}
                            isPinned={false}
                            showMatchScore={true}
                            onFavoriteClick={(p) => {
                              if (watchlistData.some(i => i.player.id === p.id)) {
                                setWatchlistData(prev => prev.filter(i => i.player.id !== p.id));
                              } else {
                                setPlayerToSave(p);
                              }
                            }}
                            onPinToggle={() => {}}
                            onAddToOtherFolder={() => {}}
                            onOpenReport={setSelectedPlayerForReport}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab==='compare' && (() => {
            const AVG = { goals: 4.5, assists: 3.2, matchesPlayed: 25, minutesPlayed: 1800, yellowCards: 3, redCards: 0.2, age: 26 };
            const v2 = (field) => compareMode === 'between' ? (p2?.[field] ?? 0) : AVG[field] ?? 0;
            const StatRow = ({ label, v1, v2raw, unit = '' }) => {
              const n1 = parseFloat(v1) || 0;
              const n2 = parseFloat(v2raw) || 0;
              const max = Math.max(n1, n2, 0.001);
              const pct1 = Math.min((n1 / max) * 100, 100);
              const pct2 = Math.min((n2 / max) * 100, 100);
              const w = compareMode === 'between' ? 'text-blue-400' : 'text-orange-400';
              return (
                <div className="flex items-center gap-4">
                  <span className="w-16 text-right text-[11px] font-black text-[#00ff88]">{v1}{unit}</span>
                  <div className="flex flex-1 gap-2 items-center">
                    <div className="flex-1 h-2.5 bg-gray-900 rounded-full overflow-hidden flex justify-end">
                      <div className="h-full bg-[#00ff88] rounded-full shadow-[0_0_8px_rgba(0,255,136,0.5)]" style={{ width: `${pct1}%` }} />
                    </div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest w-28 text-center shrink-0">{label}</span>
                    <div className="flex-1 h-2.5 bg-gray-900 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${compareMode === 'between' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`} style={{ width: `${pct2}%` }} />
                    </div>
                  </div>
                  <span className={`w-16 text-[11px] font-black ${w}`}>{v2raw}{unit}</span>
                </div>
              );
            };
            const Section = ({ icon, title, children }) => (
              <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-800/60">
                  <span className="text-[#00ff88]">{icon}</span>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white">{title}</h3>
                </div>
                {children}
              </div>
            );
            return (
              <div className="animate-in fade-in duration-500 space-y-6 text-white font-sans">
                {allPlayers.length < 2 ? (
                  <div className="bg-[#0d1117] border border-gray-800 rounded-[3rem] p-10 shadow-2xl flex flex-col items-center justify-center py-24 gap-4 text-center">
                    <Scale size={48} className="text-gray-700" />
                    <p className="text-white font-black uppercase text-lg tracking-tighter">No players in watchlist</p>
                    <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest normal-case not-italic">Add at least 2 players from Search or AI Chat,<br/>then return here to compare.</p>
                  </div>
                ) : (
                  <>
                    {/* HEADER SELECTOR */}
                    <div className="bg-[#0d1117] border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[80px] font-black italic text-white/[0.03] select-none tracking-tighter">VS</span>
                      </div>
                      <div className="flex items-center justify-between gap-6 relative z-10">
                        {/* Player 1 */}
                        <div className="flex-1 flex flex-col items-start gap-4">
                          <SearchablePlayerSelect players={allPlayers} selectedPlayerId={player1Id} onSelect={setPlayer1Id} colorClass="[#00ff88]" placeholder="Player 1" />
                          {p1 && (
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-20 rounded-3xl bg-[#161b22] border-2 border-[#00ff88] flex items-center justify-center text-[#00ff88] overflow-hidden shrink-0 shadow-lg">
                                {p1.imageUrl && p1.imageUrl !== 'nan' && p1.imageUrl !== '' ? (
                                  <img src={p1.imageUrl} alt={p1.name} referrerPolicy="no-referrer" className="w-full h-full object-cover bg-white" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p1.name)}&background=161b22&color=00ff88`; }} />
                                ) : (
                                  <UserRound size={36}/>
                                )}
                              </div>
                              <div>
                                <div className="text-2xl font-black italic tracking-tighter text-[#00ff88] leading-none uppercase">{p1.name}</div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{p1.club} · {p1.position} · {p1.age} ani</div>
                                <div className="text-[10px] font-black text-white mt-0.5">{p1.value}</div>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Player 2 */}
                        <div className="flex-1 flex flex-col items-end gap-4">
                          <SearchablePlayerSelect players={allPlayers} selectedPlayerId={player2Id} onSelect={setPlayer2Id} colorClass="white" placeholder="Player 2" />
                          {p2 && compareMode === 'between' && (
                            <div className="flex items-center gap-4 flex-row-reverse">
                              <div className="w-20 h-20 rounded-3xl bg-[#161b22] border-2 border-blue-500 flex items-center justify-center text-blue-400 overflow-hidden shrink-0 shadow-lg">
                                {p2.imageUrl && p2.imageUrl !== 'nan' && p2.imageUrl !== '' ? (
                                  <img src={p2.imageUrl} alt={p2.name} referrerPolicy="no-referrer" className="w-full h-full object-cover bg-white" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p2.name)}&background=161b22&color=3b82f6`; }} />
                                ) : (
                                  <UserRound size={36}/>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-black italic tracking-tighter text-blue-400 leading-none uppercase">{p2.name}</div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{p2.club} · {p2.position} · {p2.age} ani</div>
                                <div className="text-[10px] font-black text-white mt-0.5">{p2.value}</div>
                              </div>
                            </div>
                          )}
                          {compareMode === 'league' && (
                            <div className="flex items-center gap-4 flex-row-reverse">
                              <div className="w-16 h-16 rounded-2xl bg-[#161b22] border-2 border-orange-500 flex items-center justify-center text-orange-400"><BarChart2 size={30}/></div>
                              <div className="text-right">
                                <div className="text-2xl font-black italic tracking-tighter text-orange-400 leading-none uppercase">Liga Avg</div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">League Avg · Average</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Mode toggle */}
                      <div className="flex justify-center mt-6">
                        <div className="flex bg-[#161b22] p-1.5 rounded-2xl border border-gray-800">
                          <button onClick={() => setCompareMode('between')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${compareMode==='between'?'bg-[#00ff88] text-black shadow-lg':'text-gray-500 hover:text-white'}`}>Head to Head</button>
                          <button onClick={() => setCompareMode('league')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${compareMode==='league'?'bg-[#00ff88] text-black shadow-lg':'text-gray-500 hover:text-white'}`}>vs. League Avg</button>
                        </div>
                      </div>
                    </div>

                    {p1 && (p2 || compareMode === 'league') && (
                      <div className="grid grid-cols-1 gap-5">

                        {/* SECTION 1: ATTACK */}
                        <Section icon={<Goal size={14}/>} title="Offensive Production">
                          <StatRow label="Goals" v1={p1.goals??0} v2raw={v2('goals')} />
                          <StatRow label="Assists" v1={p1.assists??0} v2raw={v2('assists')} />
                          <StatRow label="Goals + Assists" v1={(p1.goals??0)+(p1.assists??0)} v2raw={(v2('goals'))+(v2('assists'))} />
                          <StatRow label="Goals / Match" v1={p1.matchesPlayed ? ((p1.goals??0)/p1.matchesPlayed).toFixed(2) : '0.00'} v2raw={v2('matchesPlayed') ? (v2('goals')/v2('matchesPlayed')).toFixed(2) : '0.00'} />
                          <StatRow label="Assists / Match" v1={p1.matchesPlayed ? ((p1.assists??0)/p1.matchesPlayed).toFixed(2) : '0.00'} v2raw={v2('matchesPlayed') ? (v2('assists')/v2('matchesPlayed')).toFixed(2) : '0.00'} />
                        </Section>

                        {/* SECTION 2: PRESENCE */}
                        <Section icon={<CalendarDays size={14}/>} title="Presence & Playtime">
                          <StatRow label="Matches Played" v1={p1.matchesPlayed??0} v2raw={v2('matchesPlayed')} />
                          <StatRow label="Minutes Played" v1={p1.minutesPlayed??0} v2raw={v2('minutesPlayed')} />
                          <StatRow label="Min / Meci" v1={p1.matchesPlayed ? Math.round((p1.minutesPlayed??0)/p1.matchesPlayed) : 0} v2raw={v2('matchesPlayed') ? Math.round(v2('minutesPlayed')/v2('matchesPlayed')) : 0} unit="'" />
                        </Section>

                        {/* SECTION 3: DISCIPLINE */}
                        <Section icon={<AlertTriangle size={14}/>} title="Discipline">
                          <StatRow label="Yellow Cards" v1={p1.yellowCards??0} v2raw={v2('yellowCards')} />
                          <StatRow label="Red Cards" v1={p1.redCards??0} v2raw={v2('redCards')} />
                        </Section>

                        {/* SECTION 4: PROFILE */}
                        <Section icon={<UserRound size={14}/>} title="Profile & Value">
                          <StatRow label="Age" v1={p1.age??'—'} v2raw={compareMode==='between'?(p2?.age??'—'):AVG.age} unit=" yrs" />
                          <div className="flex items-center gap-4 pt-1">
                            <div className="flex-1 bg-[#0d1117] rounded-2xl p-4 text-center">
                              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Market Value</div>
                              <div className="text-base font-black text-[#00ff88] italic">{p1.value || '—'}</div>
                              <div className="text-[9px] text-gray-500 mt-1 normal-case not-italic font-normal">{p1.name}</div>
                            </div>
                            {compareMode === 'between' && p2 && (
                              <div className="flex-1 bg-[#0d1117] rounded-2xl p-4 text-center">
                                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Market Value</div>
                                <div className="text-base font-black text-blue-400 italic">{p2.value || '—'}</div>
                                <div className="text-[9px] text-gray-500 mt-1 normal-case not-italic font-normal">{p2.name}</div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 bg-[#0d1117] rounded-2xl p-4">
                              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Preferred Foot</div>
                              <div className="flex gap-1.5">
                                <div className={`flex-1 h-4 rounded-sm border text-center text-[8px] font-black leading-4 ${p1.foot==='left'||p1.foot==='both'?'bg-[#00ff88] border-[#00ff88] text-black':'border-gray-700 text-gray-700'}`}>L</div>
                                <div className={`flex-1 h-4 rounded-sm border text-center text-[8px] font-black leading-4 ${p1.foot==='right'||p1.foot==='both'?'bg-[#00ff88] border-[#00ff88] text-black':'border-gray-700 text-gray-700'}`}>R</div>
                              </div>
                            </div>
                            {compareMode === 'between' && p2 && (
                              <div className="flex-1 bg-[#0d1117] rounded-2xl p-4">
                                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Preferred Foot</div>
                                <div className="flex gap-1.5">
                                  <div className={`flex-1 h-4 rounded-sm border text-center text-[8px] font-black leading-4 ${p2.foot==='left'||p2.foot==='both'?'bg-blue-500 border-blue-500 text-black':'border-gray-700 text-gray-700'}`}>L</div>
                                  <div className={`flex-1 h-4 rounded-sm border text-center text-[8px] font-black leading-4 ${p2.foot==='right'||p2.foot==='both'?'bg-blue-500 border-blue-500 text-black':'border-gray-700 text-gray-700'}`}>R</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </Section>

                        {/* SECTIUNEA 5: MATCH SCORE */}
                        <Section icon={<Trophy size={14}/>} title="Scout Score">
                          <div className="flex gap-4 items-center">
                            <div className="flex-1 flex flex-col items-center gap-2 bg-[#0d1117] rounded-2xl p-5">
                              <div className="text-4xl font-black italic text-[#00ff88]">{p1.match}%</div>
                              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Match Score</div>
                              <div className="text-[10px] font-black text-white">{p1.name}</div>
                            </div>
                            {compareMode === 'between' && p2 && (
                              <div className="flex-1 flex flex-col items-center gap-2 bg-[#0d1117] rounded-2xl p-5">
                                <div className="text-4xl font-black italic text-blue-400">{p2.match}%</div>
                                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Match Score</div>
                                <div className="text-[10px] font-black text-white">{p2.name}</div>
                              </div>
                            )}
                          </div>
                        </Section>

                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </main>

      {/* FILTER PANEL - COMPLETE RESTORED */}
      <aside className={`fixed right-0 top-0 h-full w-80 bg-[#0d1117] border-l border-gray-800 transform transition-transform duration-500 p-8 z-[100] ${isFilterOpen?'translate-x-0':'translate-x-full'} shadow-2xl flex flex-col text-left font-black italic text-white uppercase`}>
         <div className="flex justify-between items-center mb-10"><h3 className="flex gap-3 text-left italic"><Filter size={18} className="text-[#00ff88]"/> Multi-Filters</h3><X size={20} className="text-gray-600 cursor-pointer hover:text-white" onClick={() => setIsFilterOpen(false)}/></div>
         <div className="flex-1 space-y-8 overflow-y-auto pr-2 scrollbar-hide text-left italic">
            {/* Folders */}
            <div className="space-y-3 font-black">
                <label className="text-[10px] text-gray-500 uppercase">Select Folders</label>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 font-black italic">
                    {folders.map(f => (
                        <div key={f} className="flex items-center gap-3 cursor-pointer group" onClick={() => tempFolders.includes(f) ? setTempFolders(tempFolders.filter(x => x!==f)) : setTempFolders([...tempFolders, f])}>
                            {tempFolders.includes(f) ? <CheckSquare size={16} className="text-[#00ff88]"/> : <Square size={16} className="text-gray-700"/>}
                            <span className="text-[10px] uppercase text-white group-hover:text-[#00ff88]">{f}</span>
                        </div>
                    ))}
                </div>
            </div>
            {/* Poziție */}
            <div className="space-y-3 font-black uppercase"><label className="text-[10px] text-gray-500 uppercase">Position</label><select value={tempPos} onChange={(e) => setTempPos(e.target.value)} className="w-full bg-[#161b22] border border-gray-800 rounded-2xl p-4 text-xs font-black text-white outline-none focus:border-[#00ff88] appearance-none tracking-widest italic font-bold"><option value="ALL">All Positions</option><option value="LW">LW</option><option value="ST">ST</option><option value="CB">CB</option><option value="GK">GK</option></select></div>
            {/* Vârstă */}
            <div className="space-y-4 font-black uppercase italic"><label className="text-[10px] text-gray-500 uppercase">Age: {tempMinAge}-{tempMaxAge}</label><div><input type="range" min="15" max="45" value={tempMinAge} onChange={(e) => setTempMinAge(parseInt(e.target.value))} className="w-full accent-ucluj-green h-1 bg-gray-800 rounded-full appearance-none mb-4"/></div><div><input type="range" min="15" max="45" value={tempMaxAge} onChange={(e) => setTempMaxAge(parseInt(e.target.value))} className="w-full accent-ucluj-green h-1 bg-gray-800 rounded-full appearance-none"/></div></div>
            {/* Goluri */}
            <div className="space-y-4 font-black uppercase italic"><label className="text-[10px] text-gray-500 uppercase">Goals: {tempMinGoals}-{tempMaxGoals}</label><div><input type="range" min="0" max="100" value={tempMinGoals} onChange={(e) => setTempMinGoals(parseInt(e.target.value))} className="w-full accent-ucluj-green h-1 bg-gray-800 rounded-full appearance-none mb-4"/></div><div><input type="range" min="0" max="100" value={tempMaxGoals} onChange={(e) => setTempMaxGoals(parseInt(e.target.value))} className="w-full accent-ucluj-green h-1 bg-gray-800 rounded-full appearance-none"/></div></div>
            {/* Assist-uri */}
            <div className="space-y-4 font-black uppercase italic"><label className="text-[10px] text-gray-500 uppercase">Assists: {tempMinAssists}-{tempMaxAssists}</label><div><input type="range" min="0" max="100" value={tempMinAssists} onChange={(e) => setTempMinAssists(parseInt(e.target.value))} className="w-full accent-ucluj-green h-1 bg-gray-800 rounded-full appearance-none mb-4"/></div><div><input type="range" min="0" max="100" value={tempMaxAssists} onChange={(e) => setTempMaxAssists(parseInt(e.target.value))} className="w-full accent-ucluj-green h-1 bg-gray-800 rounded-full appearance-none"/></div></div>
         </div>
         <button onClick={handleApply} className="mt-8 w-full py-4 bg-[#00ff88] text-black font-black uppercase text-xs rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all font-sans italic uppercase">Apply Filters</button>
         {filtersActive && <button onClick={() => { setFiltersActive(false); setIsFilterOpen(false); }} className="mt-3 w-full py-3 bg-transparent border border-gray-700 text-gray-400 hover:text-white font-black uppercase text-xs rounded-2xl transition-all font-sans italic uppercase">Reset Filters</button>}
      </aside>

      {/* MODAL SAVE PLAYER - UI CLEAN RESTORED */}
      {playerToSave && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="bg-[#0d1117] border border-gray-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-left font-black italic text-white uppercase italic font-sans font-black italic uppercase">
                {!newFolderMode ? (
                    <>
                        <h3 className="text-white font-black uppercase tracking-tight text-lg mb-2 italic text-left uppercase italic font-bold font-black">Save Player</h3>
                        <p className="text-gray-500 text-[10px] mb-6 uppercase font-bold tracking-widest italic text-left text-[#00ff88]">Collection for {playerToSave?.name}</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto mb-6 pr-1 scrollbar-hide text-left uppercase italic font-bold">
                            {folders.map(f => (
                                <button key={f} disabled={f === playerToSave.sourceFolder} onClick={() => { if(playerToSave.sourceFolder) {setMoveCopyConfig({player: playerToSave, currentFolder: playerToSave.sourceFolder, targetFolder: f}); setPlayerToSave(null);} else {handleSaveFolder(f);}}} className={`w-full flex items-center gap-3 p-4 border border-gray-800 rounded-2xl transition-all text-white font-bold text-[10px] uppercase tracking-widest group text-left italic ${f === playerToSave.sourceFolder ? 'opacity-20 cursor-not-allowed' : 'bg-[#161b22] hover:border-[#00ff88] hover:bg-[#00ff88]/5'}`}><Folder size={16} className="text-gray-500 group-hover:text-[#00ff88]" /> {f}</button>
                            ))}
                            <button onClick={() => setNewFolderMode(true)} className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-800 rounded-2xl text-gray-500 hover:border-[#00ff88] hover:text-[#00ff88] transition-all text-[10px] font-black uppercase italic leading-none"><FolderPlus size={16}/> New Collection</button>
                        </div>
                        <button onClick={() => setPlayerToSave(null)} className="w-full text-gray-600 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors italic text-center py-2 uppercase italic font-sans uppercase">Close</button>
                    </>
                ) : (
                    <div className="space-y-6 text-center py-4 italic uppercase font-sans font-black italic uppercase italic">
                        <h3 className="text-white font-black uppercase tracking-tight text-lg italic text-center font-black">Create Collection</h3>
                        <input autoFocus placeholder="Name..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="w-full bg-[#161b22] border border-[#00ff88] rounded-xl py-4 px-5 text-white text-sm outline-none font-bold italic" />
                        <button onClick={() => { if(newFolderName) {setFolders(p => [...p, newFolderName]); handleSaveFolder(newFolderName); setNewFolderName(""); setNewFolderMode(false);} }} className="w-full py-4 bg-[#00ff88] text-black font-black uppercase text-[10px] rounded-xl italic shadow-lg shadow-[#00ff88]/20 transition-all hover:scale-105 active:scale-95 italic uppercase font-black uppercase italic font-black uppercase italic">Create & Save</button>
                        <button onClick={() => setNewFolderMode(false)} className="w-full text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors italic">Cancel</button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* CONFIRMATION MOVE/COPY */}
      {moveCopyConfig && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-black italic uppercase font-sans">
          <div className="bg-[#0d1117] border border-[#00ff88]/30 w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-[#00ff88]/10 flex items-center justify-center text-[#00ff88] mx-auto mb-6"><Move size={32}/></div>
            <h3 className="text-xl font-black text-white uppercase italic mb-2 tracking-tighter text-center">Move Player</h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-8 text-center italic text-white uppercase italic">Delete from "{moveCopyConfig.currentFolder}"?</p>
            <div className="grid grid-cols-2 gap-4 uppercase font-black text-[11px] tracking-widest italic text-center font-black italic uppercase font-sans">
              <button onClick={() => finalizeMoveCopy(true)} className="py-4 bg-[#00ff88] text-black rounded-2xl hover:scale-105 uppercase font-bold italic shadow-lg">Yes</button>
              <button onClick={() => finalizeMoveCopy(false)} className="py-4 bg-[#161b22] text-white border border-gray-800 rounded-2xl transition-all uppercase font-bold italic shadow-lg">No</button>
            </div>
          </div>
        </div>
      )}

      {/* FOLDER DELETE (DA/NU) */}
      {folderToDelete && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0d1117] border border-red-500/30 w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl text-center font-black italic uppercase font-sans">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6 text-center"><Trash2 size={32}/></div>
            <h3 className="text-xl font-black text-white uppercase italic mb-2 tracking-tighter text-center">Delete collection?</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8 text-center italic text-white">"{folderToDelete}"</p>
            <div className="grid grid-cols-2 gap-4 uppercase font-black text-[11px] tracking-widest italic text-center">
              <button onClick={() => { setFolders(folders.filter(f => f !== folderToDelete)); setWatchlistData(watchlistData.filter(i => i.folder !== folderToDelete)); if (selectedFolder === folderToDelete) setSelectedFolder("ALL"); setFolderToDelete(null); }} className="py-4 bg-red-500 text-white rounded-2xl font-bold italic uppercase shadow-lg shadow-red-500/20">Yes</button>
              <button onClick={() => setFolderToDelete(null)} className="py-4 bg-[#161b22] text-white border border-gray-800 rounded-2xl font-bold italic uppercase italic">No</button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY PANEL */}
      <aside className={`fixed top-0 right-0 h-full w-80 bg-ucluj-dark border-l border-gray-800 z-300 flex flex-col transition-transform duration-500 ${isHist ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-ucluj-green" />
            <span className="text-[11px] font-black uppercase text-white italic tracking-widest">History</span>
          </div>
          <button onClick={() => setIsHist(false)} className="text-gray-600 hover:text-white transition-colors"><X size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {chatMessages.filter(m => m.role === 'user').length === 0 ? (
            <p className="text-gray-600 text-[11px] font-bold uppercase italic tracking-widest text-center mt-8">No history yet</p>
          ) : (
            chatMessages.filter(m => m.role === 'user').map((m, i) => (
              <div key={i} className="bg-ucluj-gray border border-gray-800 rounded-2xl px-4 py-3">
                <p className="text-[11px] text-gray-300 font-normal leading-relaxed truncate">{m.text}</p>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* REPORT OVERLAY */}
      {selectedPlayerForReport && (
        <PlayerReportPage
          player={selectedPlayerForReport}
          onBack={() => setSelectedPlayerForReport(null)}
          isInWatchlist={watchlistData.some(i => i.player.id === selectedPlayerForReport.id)}
          onSaveToWatchlist={(p) => {
            if (watchlistData.some(i => i.player.id === p.id)) {
              setWatchlistData(prev => prev.filter(i => i.player.id !== p.id));
            } else {
              setPlayerToSave(p);
            }
          }}
        />
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `.perspective-1000{perspective:1000px}.preserve-3d{transform-style:preserve-3d}.backface-hidden{backface-visibility:hidden}.rotate-y-180{transform:rotateY(180deg)}@keyframes scroll-left{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}@keyframes scroll-right{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}} />
    </div>
  );
}