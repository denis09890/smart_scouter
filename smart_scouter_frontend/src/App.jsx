import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, UserRound, Search, MessageSquare, Scale, LayoutList, 
  Send, Bot, History, X, Clock, ChevronLeft, 
  TrendingUp, LogOut, UserCog, Mail, ShieldCheck, Lock, Filter, 
  ChevronDown, Euro, CalendarDays, Goal, Sparkles, FileText, Activity, AlertCircle
} from 'lucide-react'; 
import Flag from 'react-world-flags'; 

// --- 1. LOGIN PAGE ---
const LoginPage = ({ onLogin }) => {
  const handleSubmit = (e) => { e.preventDefault(); onLogin(); };
  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 font-sans text-white text-center">
      <div className="w-full max-w-md bg-[#0d1117] border border-gray-800 rounded-[3rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-500">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 italic">U CLUJ <span className="text-[#00ff88]">AI</span></h1>
        <p className="text-gray-500 font-bold text-[10px] tracking-widest uppercase mb-10 opacity-50">Scouting Management System</p>
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Email Address</label><input type="email" placeholder="scout@u-cluj.ro" className="w-full bg-[#161b22] border border-gray-800 rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-[#00ff88] transition-all" required /></div>
          <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Password</label><input type="password" placeholder="••••••••" className="w-full bg-[#161b22] border border-gray-800 rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-[#00ff88] transition-all" required /></div>
          <button type="submit" className="w-full py-4 bg-[#00ff88] text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:scale-[1.02] active:scale-95 transition-all">Login</button>
        </form>
      </div>
    </div>
  );
};

// --- 2. PLAYER CARD (FLIP & COMPLETE) ---
const PlayerCard = ({ player, compact = false, isFavoriteDefault = true, onOpenReport }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFavorite, setIsFavorite] = useState(isFavoriteDefault);
  const arcLength = 170; 
  const dashOffset = arcLength - (player.match / 100) * arcLength;

  return (
    <div className={`relative w-full ${compact ? 'h-[380px]' : 'h-[480px]'} perspective-1000 font-sans`}>
      <div className={`relative w-full h-full transition-all duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
        <div className="absolute w-full h-full backface-hidden bg-[#0d1117] border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between text-left">
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex flex-col gap-1.5">
              <span className="bg-[#00ff88] text-black text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-tighter w-fit">{player.position}</span>
              <div className="flex items-center gap-1.5 bg-[#161b22] p-1 rounded-lg border border-gray-800 w-fit">
                <Flag code={player.countryCode} className="w-4 h-2.5 object-cover rounded-sm" />
                <span className="text-[9px] font-bold text-gray-500 uppercase">{player.countryCode}</span>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}>
              <Star size={compact ? 16 : 22} fill={isFavorite ? "#FFD700" : "transparent"} color={isFavorite ? "#FFD700" : "#374151"} className="drop-shadow-[0_0_8px_rgba(255,215,0,0.4)] transition-all" />
            </button>
          </div>
          <div className={`relative flex justify-center items-center ${compact ? 'h-32' : 'h-40'}`}>
            <svg viewBox="0 0 120 70" className={`absolute top-0 ${compact ? 'w-36 h-20' : 'w-52 h-32'} overflow-visible`}>
              <path d="M 6,60 A 54,54 0 0 1 114,60" stroke="#1f2937" strokeWidth="7" fill="none" strokeLinecap="round" />
              <path d="M 6,60 A 54,54 0 0 1 114,60" stroke="#00ff88" strokeWidth="7" fill="none" strokeLinecap="round" style={{ strokeDasharray: arcLength, strokeDashoffset: dashOffset, transition: 'stroke-dashoffset 1.5s ease-out' }} />
            </svg>
            <div className={`absolute ${compact ? 'top-[18px] w-16 h-16 border-[3px]' : 'top-[34px] w-28 h-28 border-[6px]'} rounded-full bg-[#161b22] border-[#0d1117] flex items-center justify-center overflow-hidden`}><UserRound size={compact ? 36 : 64} color="#374151" className="opacity-40" /></div>
            <div className={`absolute bottom-[2px] bg-[#00ff88] text-black font-black ${compact ? 'text-[7px] px-2' : 'text-[11px] px-5'} py-0.5 rounded-full shadow-[0_0_20px_rgba(0,255,136,0.6)] uppercase tracking-tight`}>{player.match}% Match</div>
          </div>
          <div className="text-center">
            <h2 className={`${compact ? 'text-base' : 'text-3xl'} font-black text-white leading-[0.85] tracking-tighter uppercase italic`}>{player.name.split(' ')[0]}<br /><span className="text-[#00ff88]">{player.name.split(' ')[1]}</span></h2>
            <p className="text-gray-500 text-[8px] font-bold mt-1.5 uppercase tracking-[0.2em]">{player.club} • {player.age} ANI</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800/50 flex justify-between items-end">
            <div className="flex flex-col"><span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Valoare</span><span className={`${compact ? 'text-sm' : 'text-xl'} font-black text-white tracking-tighter`}>{player.value}</span></div>
            <div className="flex gap-1.5 bg-black/20 p-1.5 rounded-lg border border-gray-800/40">
              <div className={`w-3.5 h-5 rounded-sm border ${player.foot === 'left' || player.foot === 'both' ? 'bg-[#00ff88] border-[#00ff88] shadow-[0_0_8px_#00ff88]' : 'bg-transparent border-[#00ff88]/30 border-dashed'}`} />
              <div className={`w-3.5 h-5 rounded-sm border ${player.foot === 'right' || player.foot === 'both' ? 'bg-[#00ff88] border-[#00ff88] shadow-[0_0_8px_#00ff88]' : 'bg-transparent border-[#00ff88]/30 border-dashed'}`} />
            </div>
          </div>
        </div>
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#161b22] border-2 border-[#00ff88]/50 rounded-[2.5rem] p-7 shadow-2xl flex flex-col justify-between text-left">
          <div className="flex justify-between items-center mb-4"><h3 className="text-[#00ff88] font-black uppercase italic text-xs tracking-widest italic">Live Stats</h3><Activity size={16} className="text-[#00ff88]" /></div>
          <div className="flex-1 space-y-3">
             {[{ label: "Meciuri", val: "24", icon: <CalendarDays size={14}/> }, { label: "Goluri", val: player.goals || "8", icon: <Goal size={14}/> }, { label: "Assist", val: "6", icon: <Sparkles size={14}/> }].map((s, i) => (
               <div key={i} className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-gray-800"><div className="flex items-center gap-3 text-gray-500">{s.icon} <span className="text-[9px] font-black uppercase tracking-tighter">{s.label}</span></div><span className="text-white font-black text-xs">{s.val}</span></div>
             ))}
             <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"><AlertCircle size={14} className="text-red-500" /><div className="leading-none"><p className="text-[8px] font-black text-red-500 uppercase mb-1">Status Medical</p><p className="text-white text-[9px] font-bold">Apt de joc</p></div></div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onOpenReport(player); }} className="mt-4 w-full py-3.5 bg-[#00ff88] text-black font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"><FileText size={14} /> Report</button>
        </div>
      </div>
    </div>
  );
};

// --- 3. FULL REPORT OVERLAY ---
const FullReportView = ({ player, onClose }) => {
  if (!player) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-[#05070a] overflow-y-auto font-sans text-white animate-in slide-in-from-bottom duration-500 p-10 text-left">
        <button onClick={onClose} className="mb-10 flex items-center gap-2 text-gray-500 hover:text-[#00ff88] font-black uppercase text-xs tracking-widest transition-all"><ChevronLeft size={20}/> Înapoi la Scouting</button>
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-end border-b border-gray-800 pb-10 mb-12">
                <div><span className="text-[#00ff88] font-black uppercase tracking-[0.3em] text-xs font-bold">Technical Analysis Report</span><h1 className="text-7xl font-black italic uppercase tracking-tighter mt-2">{player.name}</h1></div>
                <div className="bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-800 text-center min-w-[150px]"><p className="text-gray-500 text-[10px] font-black uppercase mb-1">Match Rate</p><p className="text-5xl font-black text-[#00ff88]">{player.match}%</p></div>
            </div>
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 bg-[#0d1117] border border-gray-800 rounded-[3rem] p-10"><h3 className="text-xl font-black uppercase italic mb-6">AI Evaluation</h3><p className="text-gray-400 text-lg leading-relaxed italic">"Jucător cu o dinamică peste medie, excelent în tranziția pozitivă. Sistemul îl identifică drept o piesă cheie pentru stilul ofensiv impus la U Cluj."</p></div>
                <div className="bg-[#161b22] border border-gray-800 rounded-[3rem] p-8 space-y-6">
                    {['Pace', 'Dribbling', 'Shooting'].map(attr => (
                        <div key={attr} className="space-y-2"><p className="text-[10px] font-black text-gray-500 uppercase">{attr}</p><div className="h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-[#00ff88] w-[85%]" /></div></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

// --- 4. MAIN APP ---
export default function App() {
  const [auth, setAuth] = useState(false);
  const [tab, setTab] = useState('watchlist');
  const [isHist, setIsHist] = useState(false);
  const [isAcc, setIsAcc] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPlayerForReport, setSelectedPlayerForReport] = useState(null);
  const [compareMode, setCompareMode] = useState('between'); // Fix pentru Compare Mode

  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Salut! Am analizat ultimele meciuri. Iată ce profile de jucători s-ar potrivi sistemului U Cluj.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

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
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Eroare: nu pot contacta serverul AI. Asigură-te că backend-ul rulează.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const [tempPos, setTempPos] = useState('ALL');
  const [tempMinAge, setTempMinAge] = useState(16);
  const [tempMaxAge, setTempMaxAge] = useState(40);
  const [tempValue, setTempValue] = useState(150000000);

  const [appliedPos, setAppliedPos] = useState('ALL');
  const [appliedMinAge, setAppliedMinAge] = useState(16);
  const [appliedMaxAge, setAppliedMaxAge] = useState(40);
  const [appliedValue, setAppliedValue] = useState(150000000);

  useEffect(() => {
    if (tab !== 'ai') setIsHist(false);
    if (tab !== 'watchlist') setIsFilterOpen(false);
  }, [tab]);

  const players = [
    { id: 1, name: "CLAUDIU PETRILA", club: "CFR CLUJ", age: 23, position: "LW", countryCode: "RO", value: "3.5M €", valNum: 3500000, match: 92, foot: "left", goals: 12 },
    { id: 2, name: "ABDUR AYUBA", club: "ACCRA LIONS", age: 19, position: "ST", countryCode: "GH", value: "800K €", valNum: 800000, match: 88, foot: "right", goals: 15 },
    { id: 4, name: "VINICIUS JR", club: "REAL MADRID", age: 23, position: "LW", countryCode: "BR", value: "150M €", valNum: 150000000, match: 99, foot: "right", goals: 22 },
    { id: 5, name: "LOUIS MUNTEANU", club: "FARUL", age: 21, position: "CF", countryCode: "RO", value: "2.0M €", valNum: 2000000, match: 84, foot: "both", goals: 10 },
    { id: 8, name: "DARIUS OLARU", club: "FCSB", age: 26, position: "CM", countryCode: "RO", value: "6.5M €", valNum: 6500000, match: 87, foot: "right", goals: 11 }
  ];

  const handleApply = () => {
    setAppliedPos(tempPos); setAppliedMinAge(tempMinAge); setAppliedMaxAge(tempMaxAge); setAppliedValue(tempValue);
    setIsFilterOpen(false);
  };

  const filtered = players.filter(p => (appliedPos==='ALL' || p.position===appliedPos) && (p.age>=appliedMinAge && p.age<=appliedMaxAge) && (p.valNum<=appliedValue) && p.name.toLowerCase().includes(search.toLowerCase()));

  if (!auth) return <LoginPage onLogin={() => setAuth(true)} />;

  return (
    <div className="min-h-screen bg-[#05070a] flex text-white font-sans overflow-hidden select-none tracking-tighter">
      <aside className="w-64 bg-[#0d1117] border-r border-gray-800 flex flex-col fixed h-full z-50 p-8 shadow-2xl text-left">
        <h1 className="text-2xl font-black italic uppercase mb-10 tracking-tighter">U CLUJ <span className="text-[#00ff88]">AI</span></h1>
        <nav className="flex-1 space-y-2">
          {[{ id: 'ai', label: 'AI Chat Assist', icon: <MessageSquare size={18}/> }, { id: 'compare', label: 'Compare Head to Head', icon: <Scale size={18}/> }, { id: 'watchlist', label: 'Watchlist', icon: <LayoutList size={18}/> }].map(i => (
            <button key={i.id} onClick={() => setTab(i.id)} className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl font-bold transition-all ${tab===i.id?'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]':'text-gray-500 hover:text-white'}`}>
              <div className="shrink-0">{i.icon}</div><span className="text-[11px] uppercase whitespace-nowrap leading-none">{i.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={() => setAuth(false)} className="mt-4 flex items-center gap-4 px-4 py-3 text-red-500 font-bold text-xs hover:bg-red-500/10 rounded-xl transition-all uppercase"><LogOut size={18}/>Log Out</button>
      </aside>

      <main className={`flex-1 ml-64 p-10 transition-all duration-500 ${isHist || isFilterOpen ?'mr-80':'mr-0'}`}>
        <div className="max-w-[1600px] mx-auto text-left">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-black uppercase italic tracking-tight">{tab==='ai'?'AI Chat Assist':tab==='compare'?'Compare Head to Head':'My Watchlist'}</h2>
            <div className="flex gap-4">
              {tab==='watchlist' && <div className="flex items-center gap-3 bg-[#0d1117] p-2 rounded-2xl border border-gray-800 shadow-xl"><button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2.5 bg-[#161b22] border border-gray-800 rounded-xl py-2.5 px-5 text-[10px] font-black text-gray-400 hover:text-[#00ff88] transition-all uppercase"><Filter size={14}/> Filters</button><div className="w-[1px] h-6 bg-gray-800"></div><div className="relative"><Search className="absolute left-4 top-2.5 text-gray-600" size={16}/><input placeholder="Search player..." className="bg-transparent border-none rounded-2xl py-2 pl-12 pr-4 text-xs text-white outline-none w-48 font-bold" onChange={(e) => setSearch(e.target.value)}/></div></div>}
              {tab==='ai' && <button onClick={() => setIsHist(!isHist)} className={`flex gap-2 px-5 py-3 rounded-2xl font-bold text-sm border transition-all ${isHist?'bg-white text-black shadow-xl':'text-gray-400 border-gray-800 hover:border-gray-600 uppercase'}`}><History size={18}/> History</button>}
            </div>
          </div>

          {tab==='watchlist' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in fade-in duration-700">{filtered.map(p => <PlayerCard key={p.id} player={p} onOpenReport={setSelectedPlayerForReport} />)}</div>}
          
          {tab==='ai' && (
            <div className="flex gap-6 h-[78vh] animate-in fade-in duration-500">
               <div className="w-[60%] flex flex-col bg-[#0d1117] border border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl relative">
                  <div className="p-5 border-b border-gray-800 bg-[#161b22]/50 flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-[#00ff88] flex items-center justify-center text-black shadow-lg"><Bot size={18}/></div><h3 className="text-[11px] font-black uppercase text-white italic">Live Scout AI</h3></div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-4 scrollbar-hide text-left">
                    {chatMessages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-[#00ff88] text-black font-bold' : 'bg-[#161b22] text-gray-300 border border-gray-800'}`}>{m.text}</div>
                      </div>
                    ))}
                    {isChatLoading && <div className="flex justify-start"><div className="bg-[#161b22] border border-gray-800 rounded-2xl px-5 py-3 text-gray-500 text-sm italic">Scout AI scrie...</div></div>}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-6 bg-[#161b22] border-t border-gray-800 flex gap-4">
                    <input type="text" placeholder="Întreabă AI..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} className="flex-1 bg-[#0d1117] border border-gray-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-[#00ff88] outline-none" />
                    <button onClick={sendMessage} disabled={isChatLoading} className="bg-[#00ff88] text-black p-4 rounded-2xl disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"><Send size={20} /></button>
                  </div>
               </div>
               <div className="w-[40%] overflow-y-auto pr-2 scrollbar-hide pb-10 grid grid-cols-2 gap-4">{players.slice(0, 4).map(p => <PlayerCard key={p.id} player={p} compact={true} isFavoriteDefault={false} onOpenReport={setSelectedPlayerForReport} />)}</div>
            </div>
          )}

          {tab==='compare' && (
            <div className="bg-[#0d1117] border border-gray-800 rounded-[3rem] p-10 shadow-2xl animate-in fade-in duration-500 text-left">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-white font-black uppercase tracking-widest text-[10px] italic">Compare Head to Head</h2>
                <div className="flex bg-[#161b22] p-1.5 rounded-2xl border border-gray-800 text-[10px] uppercase font-black transition-all">
                  <button onClick={() => setCompareMode('between')} className={`px-6 py-2 rounded-xl transition-all ${compareMode==='between'?'bg-white text-black shadow-lg':'text-gray-500 hover:text-white'}`}>Între ei</button>
                  <button onClick={() => setCompareMode('league')} className={`px-6 py-2 rounded-xl transition-all ${compareMode==='league'?'bg-white text-black shadow-lg':'text-gray-500 hover:text-white'}`}>vs. Ligă</button>
                </div>
              </div>
              <div className="bg-[#161b22] p-12 rounded-[3rem] border border-gray-800 flex justify-between items-center mb-12 relative overflow-hidden">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-[0_0_15px_#fff6] text-4xl font-black italic uppercase text-white tracking-tighter">VS</div>
                <div className="flex items-center gap-6"><div className="w-20 h-20 rounded-full bg-black border-2 border-[#00ff88] flex items-center justify-center text-[#00ff88] opacity-60 shadow-lg"><UserRound size={40}/></div><div className="text-left"><h3 className="text-3xl font-black uppercase italic leading-none text-[#00ff88]">CP</h3><p className="text-gray-400 text-[10px] font-black mt-1 uppercase tracking-widest">Petrila</p></div></div>
                <div className="flex items-center gap-6 flex-row-reverse text-right">
                  <div className={`w-20 h-20 rounded-full bg-black border-2 flex items-center justify-center opacity-60 shadow-lg transition-colors ${compareMode==='between'?'border-blue-500 text-blue-500':'border-orange-500 text-orange-500'}`}><UserRound size={40}/></div>
                  <div><h3 className={`text-3xl font-black uppercase italic leading-none transition-colors ${compareMode==='between'?'text-blue-500':'text-orange-500'}`}>{compareMode==='between'?'OP':'AVG'}</h3><p className="text-gray-400 text-[10px] font-black mt-1 uppercase tracking-widest">{compareMode==='between'?'Popescu':'Media Ligii'}</p></div>
                </div>
              </div>
              <div className="space-y-6 max-w-5xl mx-auto text-left">
                 {[{l:"Goluri",v1:10,v2:compareMode==='between'?8:4.5},{l:"Asisturi",v1:8,v2:compareMode==='between'?6:3.2},{l:"xG",v1:7.2,v2:compareMode==='between'?6.1:4.0}].map(r => (
                   <div key={r.l} className="px-2"><div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-2"><span>{r.v1}</span><span>{r.l}</span><span>{r.v2}</span></div><div className="flex gap-4 items-center"><div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden rotate-180"><div className="h-full bg-[#00ff88] shadow-lg shadow-[#00ff8844]" style={{width:`${(r.v1/15)*100}%`}}/></div><div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden"><div className={`h-full shadow-lg transition-colors ${compareMode==='between'?'bg-blue-500 shadow-blue-500/20':'bg-orange-500 shadow-orange-500/20'}`} style={{width:`${(r.v2/15)*100}%`}}/></div></div></div>
                 ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <aside className={`fixed right-0 top-0 h-full w-80 bg-[#0d1117] border-l border-gray-800 transform transition-transform duration-500 p-8 z-[100] ${isFilterOpen?'translate-x-0':'translate-x-full'} shadow-2xl flex flex-col text-left`}>
         <div className="flex justify-between items-center mb-10 text-white font-black uppercase text-sm italic tracking-tighter"><h3 className="flex gap-3"><Filter size={18} className="text-[#00ff88]"/> Advanced Filters</h3><X size={20} className="text-gray-600 cursor-pointer" onClick={() => setIsFilterOpen(false)}/></div>
         <div className="flex-1 space-y-8 overflow-y-auto scrollbar-hide text-left">
            <div className="space-y-3"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Position</label><select value={tempPos} onChange={(e) => setTempPos(e.target.value)} className="w-full bg-[#161b22] border border-gray-800 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-[#00ff88] appearance-none"><option value="ALL">All Positions</option><option value="LW">LW</option><option value="ST">ST</option><option value="CB">CB</option></select></div>
            <div className="space-y-4 font-bold text-[9px] text-gray-500 uppercase">
               <label className="flex items-center gap-2 mb-2"><CalendarDays size={14}/> Age Range: {tempMinAge} - {tempMaxAge}</label>
               <div className="space-y-4">
                  <div><span className="ml-1 opacity-50">Min Age</span><input type="range" min="16" max="40" value={tempMinAge} onChange={(e) => setTempMinAge(parseInt(e.target.value))} className="w-full accent-[#00ff88] h-1 bg-gray-800 rounded-full appearance-none"/></div>
                  <div><span className="ml-1 opacity-50">Max Age</span><input type="range" min="16" max="40" value={tempMaxAge} onChange={(e) => setTempMaxAge(parseInt(e.target.value))} className="w-full accent-[#00ff88] h-1 bg-gray-800 rounded-full appearance-none"/></div>
               </div>
            </div>
            <div className="space-y-3 font-bold text-left"><label className="flex items-center gap-2 text-[10px] text-gray-500 uppercase"><Euro size={14}/> Max Value: {(tempValue/1000000).toFixed(0)}M €</label><input type="range" min="0" max="150000000" step="1000000" value={tempValue} onChange={(e) => setTempValue(parseInt(e.target.value))} className="w-full accent-[#00ff88] h-1 bg-gray-800 rounded-full appearance-none"/></div>
         </div>
         <button onClick={handleApply} className="mt-8 w-full py-4 bg-[#00ff88] text-black font-black uppercase text-xs rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all">Apply Filters</button>
      </aside>

      <aside className={`fixed right-0 top-0 h-full w-80 bg-[#0d1117] border-l border-gray-800 transform transition-transform duration-500 p-8 z-[100] ${isHist?'translate-x-0':'translate-x-full'} shadow-2xl flex flex-col text-left`}>
         <div className="flex justify-between items-center mb-10 text-white font-black uppercase text-sm italic tracking-tighter"><h3 className="flex gap-3 text-white tracking-tighter"><Clock size={18} className="text-[#00ff88]"/> History</h3><X size={20} className="text-gray-600 cursor-pointer" onClick={() => setIsHist(false)}/></div>
         <div className="space-y-4 overflow-y-auto scrollbar-hide text-left">
           {[{id:1,t:"Analiză Petrila vs Popescu",d:"Astăzi"},{id:2,t:"Profil Scouting Atacanți Ghana",d:"Ieri"}].map(h => (
             <div key={h.id} className="p-5 bg-[#161b22] border border-gray-800 rounded-2xl hover:border-[#00ff88]/50 transition-all cursor-pointer group shadow-lg"><p className="text-[11px] font-bold text-white group-hover:text-[#00ff88] mb-2">{h.t}</p><span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{h.d}</span></div>
           ))}
         </div>
      </aside>

      {selectedPlayerForReport && <FullReportView player={selectedPlayerForReport} onClose={() => setSelectedPlayerForReport(null)} />}
      {isAcc && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 text-center"><div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsAcc(false)}></div><div className="relative bg-[#0d1117] border border-gray-800 w-full max-w-md rounded-[3rem] p-10 flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-300"><div className="w-24 h-24 rounded-full bg-gray-800 border-4 border-[#00ff88] flex items-center justify-center mb-6 text-gray-400 font-bold"><UserRound size={48} /></div><h3 className="text-2xl font-black uppercase text-white mb-1 italic">Admin <span className="text-[#00ff88]">U Cluj</span></h3><button onClick={() => {setAuth(false); setIsAcc(false);}} className="mt-8 w-full py-4 border border-gray-800 text-red-500 font-black uppercase text-xs rounded-2xl hover:bg-red-500/10 transition-all tracking-widest">Log Out</button></div></div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.perspective-1000{perspective:1000px}.preserve-3d{transform-style:preserve-3d}.backface-hidden{backface-visibility:hidden}.rotate-y-180{transform:rotateY(180deg)}`}} />
    </div>
  );
}