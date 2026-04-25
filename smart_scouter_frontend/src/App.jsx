import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, UserRound, Search, MessageSquare, Scale, LayoutList, 
  Send, Bot, History, X, Clock, ChevronLeft, 
  TrendingUp, LogOut, UserCog, Mail, ShieldCheck, Lock, Filter, 
  ChevronDown, Euro, CalendarDays, Goal, Sparkles, FileText, Activity, AlertCircle, FolderPlus, Folder, Trash2, CheckSquare, Square, MoreHorizontal, Pin, Copy, Move
} from 'lucide-react'; 
import Flag from 'react-world-flags'; 

// --- 1. LOGIN PAGE ---
const LoginPage = ({ onLogin }) => {
  const handleSubmit = (e) => { e.preventDefault(); onLogin(); };
  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 font-sans text-white text-center">
      <div className="w-full max-w-md bg-[#0d1117] border border-gray-800 rounded-[3rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-500">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-white">U CLUJ <span className="text-[#00ff88]">AI</span></h1>
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
const PlayerCard = ({ player, compact = false, isFavoriteDefault = true, onOpenReport, onFavoriteClick, isPinned, onPinToggle, onAddToOtherFolder, showOptions = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  if (!player) return null;
  const arcLength = 170; 
  const dashOffset = arcLength - (player.match / 100) * arcLength;

  return (
    <div className={`relative w-full ${compact ? 'h-[380px]' : 'h-[460px]'} perspective-1000 font-sans`}>
      <div className={`relative w-full h-full transition-all duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
        <div className="absolute w-full h-full backface-hidden bg-[#0d1117] border border-gray-800 rounded-[2.5rem] p-7 shadow-2xl flex flex-col justify-between text-left text-white">
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex flex-col gap-1.5">
              <span className="bg-[#00ff88] text-black text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-tighter w-fit">{player.position}</span>
              <div className="flex items-center gap-1.5 bg-[#161b22] p-1 rounded-lg border border-gray-800 w-fit font-bold italic">
                <Flag code={player.countryCode} className="w-4 h-2.5 object-cover rounded-sm" />
                <span className="text-[9px] font-bold text-gray-500 uppercase">{player.countryCode}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 no-flip font-bold italic">
              {showOptions && (
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className={`p-1.5 rounded-full transition-all ${isMenuOpen ? 'bg-[#00ff88] text-black' : 'text-gray-500 hover:text-white'}`}><MoreHorizontal size={18} /></button>
                  {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#161b22] border border-gray-800 rounded-2xl shadow-2xl z-[50] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
              <button onClick={(e) => { e.stopPropagation(); onFavoriteClick(player); }}><Star size={compact ? 16 : 22} fill={isFavoriteDefault ? "#00ff88" : "transparent"} color={isFavoriteDefault ? "#00ff88" : "#374151"} className="transition-all hover:scale-125" /></button>
              {isPinned && !isMenuOpen && <Pin size={14} className="text-[#00ff88] fill-[#00ff88] mt-1" />}
            </div>
          </div>
          <div className="relative flex flex-col items-center">
            <svg viewBox="0 0 120 70" className={`${compact ? 'w-32 h-20' : 'w-48 h-28'} overflow-visible`}>
              <path d="M 6,60 A 54,54 0 0 1 114,60" stroke="#1f2937" strokeWidth="7" fill="none" strokeLinecap="round" />
              <path d="M 6,60 A 54,54 0 0 1 114,60" stroke="#00ff88" strokeWidth="7" fill="none" strokeLinecap="round" style={{ strokeDasharray: arcLength, strokeDashoffset: dashOffset, transition: 'stroke-dashoffset 1.5s ease-out' }} />
            </svg>
            <div className={`${compact ? 'w-16 h-16 -mt-14 border-4' : 'w-24 h-24 -mt-20 border-[6px]'} rounded-full bg-[#161b22] border-[#0d1117] flex items-center justify-center overflow-hidden z-10`}><UserRound size={compact ? 36 : 54} color="#374151" className="opacity-40" /></div>
            <div className="bg-[#00ff88] text-black font-black text-[10px] px-4 py-1 rounded-full shadow-[0_0_15px_rgba(0,255,136,0.4)] uppercase tracking-tighter -mt-3 z-20">
                {player.match}% Match
            </div>
          </div>
          <div className="text-center mt-2">
            <h2 className={`${compact ? 'text-base' : 'text-2xl'} font-black text-white leading-[0.9] tracking-tighter uppercase italic text-center`}>{player.name.split(' ')[0]}<br /><span className="text-[#00ff88]">{player.name.split(' ')[1]}</span></h2>
            <p className="text-gray-500 text-[8px] font-bold mt-2 uppercase tracking-widest text-center">{player.club} • {player.age} ANI</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800/50 flex justify-between items-end text-white text-left italic font-bold">
            <div className="flex flex-col text-left"><span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Valoare</span><span className={`${compact ? 'text-sm' : 'text-xl'} font-black text-white tracking-tighter`}>{player.value}</span></div>
            <div className="flex gap-1.5 bg-black/20 p-1.5 rounded-lg border border-gray-800/40 font-bold italic">
              <div className={`w-3.5 h-5 rounded-sm border ${player.foot === 'left' || player.foot === 'both' ? 'bg-[#00ff88] border-[#00ff88]' : 'bg-transparent border-[#00ff88]/30 border-dashed'}`} />
              <div className={`w-3.5 h-5 rounded-sm border ${player.foot === 'right' || player.foot === 'both' ? 'bg-[#00ff88] border-[#00ff88]' : 'bg-transparent border-[#00ff88]/30 border-dashed'}`} />
            </div>
          </div>
        </div>
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#161b22] border-2 border-[#00ff88]/50 rounded-[2.5rem] p-7 shadow-2xl flex flex-col justify-between text-left text-white font-sans font-black italic">
          <div className="flex justify-between items-center mb-4 text-left"><h3 className="text-[#00ff88] font-black uppercase italic text-xs tracking-widest italic">Live Performance</h3><Activity size={16} className="text-[#00ff88]" /></div>
          <div className="flex-1 space-y-3 font-black italic">
             {[{ label: "Meciuri", val: player.matchesPlayed || "24", icon: <CalendarDays size={14}/> }, { label: "Goluri", val: player.goals || "0", icon: <Goal size={14}/> }, { label: "Assist", val: player.assists || "0", icon: <Sparkles size={14}/> }].map((s, i) => (
               <div key={i} className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-gray-800 text-left font-bold"><div className="flex items-center gap-3 text-gray-400 font-bold">{s.icon} <span className="text-[9px] font-black uppercase tracking-tighter">{s.label}</span></div><span className="text-white font-black text-xs italic">{s.val}</span></div>
             ))}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onOpenReport(player); }} className="mt-4 w-full py-4 bg-[#00ff88] text-black font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 italic uppercase font-bold no-flip font-sans">Report</button>
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
export default function App() {
  const [auth, setAuth] = useState(false);
  const [tab, setTab] = useState('ai');
  const [search, setSearch] = useState("");
  const [isHist, setIsHist] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPlayerForReport, setSelectedPlayerForReport] = useState(null);
  const [compareMode, setCompareMode] = useState('between');
  const [playerToSave, setPlayerToSave] = useState(null);
  const [moveCopyConfig, setMoveCopyConfig] = useState(null);

  const allPlayers = [
    { id: 1, name: "CLAUDIU PETRILA", club: "CFR CLUJ", age: 23, position: "LW", countryCode: "RO", value: "3.5M €", match: 92, foot: "left", goals: 12, assists: 8, matchesPlayed: 28 },
    { id: 2, name: "ABDUR AYUBA", club: "ACCRA LIONS", age: 19, position: "ST", countryCode: "GH", value: "800K €", match: 88, foot: "right", goals: 15, assists: 2, matchesPlayed: 20 },
    { id: 5, name: "DARIUS OLARU", club: "FCSB", age: 26, position: "CM", countryCode: "RO", value: "6.5M €", match: 87, foot: "right", goals: 11, assists: 10, matchesPlayed: 31 },
    { id: 6, name: "LOUIS MUNTEANU", club: "FARUL", age: 21, position: "CF", countryCode: "RO", value: "2.0M €", match: 84, foot: "both", goals: 10, assists: 3, matchesPlayed: 29 },
    { id: 7, name: "ALEX MITRITA", club: "U CRAIOVA", age: 29, position: "LW", countryCode: "RO", value: "2.8M €", match: 90, foot: "right", goals: 14, assists: 11, matchesPlayed: 32 }
  ];

  const [player1Id, setPlayer1Id] = useState(1);
  const [player2Id, setPlayer2Id] = useState(2);
  const p1 = allPlayers.find(p => p.id === Number(player1Id)) || allPlayers[0];
  const p2 = allPlayers.find(p => p.id === Number(player2Id)) || allPlayers[1];

  const [folders, setFolders] = useState(() => {
    const saved = localStorage.getItem('scout_folders');
    return saved ? JSON.parse(saved) : ["Portari 2025", "Atacanți Centrali 2023", "Tineri Talente"];
  });
  const [selectedFolder, setSelectedFolder] = useState("ALL");
  const [watchlistData, setWatchlistData] = useState(() => {
    const saved = localStorage.getItem('scout_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [folderSearch, setFolderSearch] = useState("");
  const [isFolderListOpen, setIsFolderListOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [newFolderMode, setNewFolderMode] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // FILTRE STATE
  const [tempPos, setTempPos] = useState('ALL');
  const [tempMinAge, setTempMinAge] = useState(16);
  const [tempMaxAge, setTempMaxAge] = useState(40);
  const [tempMinGoals, setTempMinGoals] = useState(0);
  const [tempMaxGoals, setTempMaxGoals] = useState(30);
  const [tempMinAssists, setTempMinAssists] = useState(0);
  const [tempMaxAssists, setTempMaxAssists] = useState(20);
  const [tempFolders, setTempFolders] = useState([]);

  const [appPos, setAppPos] = useState('ALL');
  const [appMinAge, setAppMinAge] = useState(16);
  const [appMaxAge, setAppMaxAge] = useState(40);
  const [appMinGoals, setAppMinGoals] = useState(0);
  const [appMaxGoals, setAppMaxGoals] = useState(30);
  const [appMinAssists, setAppMinAssists] = useState(0);
  const [appMaxAssists, setAppMaxAssists] = useState(20);
  const [appFolders, setAppFolders] = useState([]);

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
    setIsFilterOpen(false); 
  };

  const filteredWatchlist = watchlistData
    .filter(i => selectedFolder === "ALL" || i.folder === selectedFolder)
    .filter(i => {
        const matchPos = appPos === 'ALL' || i.player.position === appPos;
        const matchAge = i.player.age >= appMinAge && i.player.age <= appMaxAge;
        const matchGoals = (i.player.goals || 0) >= appMinGoals && (i.player.goals || 0) <= appMaxGoals;
        const matchAssists = (i.player.assists || 0) >= appMinAssists && (i.player.assists || 0) <= appMaxAssists;
        const matchFolders = appFolders.length === 0 || appFolders.includes(i.folder);
        return matchPos && matchAge && matchGoals && matchAssists && matchFolders && i.player.name.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  if (!auth) return <LoginPage onLogin={() => setAuth(true)} />;

  return (
    <div className="min-h-screen bg-[#05070a] flex text-white font-sans overflow-hidden select-none tracking-tighter text-left uppercase italic font-bold">
      <aside className="w-64 bg-[#0d1117] border-r border-gray-800 flex flex-col fixed h-full z-50 p-8 shadow-2xl text-left">
        <h1 className="text-2xl font-black italic uppercase mb-10 tracking-tighter text-white">U CLUJ <span className="text-[#00ff88]">AI</span></h1>
        <nav className="flex-1 space-y-2">
          {[{ id: 'ai', label: 'AI Chat Assist', icon: <MessageSquare size={18}/> }, { id: 'compare', label: 'Compare Head to Head', icon: <Scale size={18}/> }, { id: 'watchlist', label: 'Watchlist', icon: <LayoutList size={18}/> }].map(i => (
            <button key={i.id} onClick={() => setTab(i.id)} className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-xl font-bold transition-all text-left ${tab===i.id?'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]':'text-gray-500 hover:text-white'}`}>
              <div className="shrink-0">{i.icon}</div><span className="text-[11px] uppercase whitespace-nowrap leading-none tracking-widest text-left font-bold">{i.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={() => setAuth(false)} className="mt-4 flex items-center gap-4 px-4 py-3 text-red-500 font-bold text-xs hover:bg-red-500/10 rounded-xl transition-all uppercase italic tracking-widest"><LogOut size={18}/>Log Out</button>
      </aside>

      <main className={`flex-1 ml-64 p-10 transition-all duration-500 ${isFilterOpen || isHist ? 'mr-80' : ''}`}>
        <div className="max-w-[1600px] mx-auto text-left">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-black uppercase italic tracking-tight text-white uppercase italic">
                {tab==='ai' ? 'AI Chat Assist' : tab==='compare' ? 'Compare Head to Head' : selectedFolder === "ALL" ? "Watchlist" : selectedFolder}
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
            {tab==='ai' && <button onClick={() => setIsHist(!isHist)} className={`flex gap-2 px-5 py-3 rounded-2xl font-bold text-sm border transition-all ${isHist?'bg-white text-black shadow-xl':'text-gray-400 border-gray-800 hover:border-gray-600 uppercase tracking-widest italic font-bold italic text-white uppercase italic'}`}><History size={18}/> History</button>}
          </div>

          {tab==='watchlist' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in fade-in duration-700 font-bold italic text-white uppercase italic">
               {filteredWatchlist.map(item => (
                    <PlayerCard key={`${item.player.id}-${item.folder}`} player={item.player} isFavoriteDefault={true} isPinned={item.isPinned} showOptions={true} onPinToggle={() => handlePinToggle(item.player.id, item.folder)} onAddToOtherFolder={() => setPlayerToSave({ ...item.player, sourceFolder: item.folder })} onFavoriteClick={() => setWatchlistData(watchlistData.filter(i => !(i.player.id===item.player.id && i.folder===item.folder)))} onOpenReport={setSelectedPlayerForReport} />
                 ))}
            </div>
          )}
          
          {tab==='ai' && (
            <div className="flex gap-6 h-[78vh] animate-in fade-in duration-500 font-bold italic text-white uppercase italic">
               <div className="w-[60%] flex flex-col bg-[#0d1117] border border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl relative text-left uppercase font-black italic">
                  <div className="p-5 border-b border-gray-800 bg-[#161b22]/50 flex items-center gap-3 text-white text-left font-bold font-bold italic text-white uppercase italic"><div className="w-9 h-9 rounded-full bg-[#00ff88] flex items-center justify-center text-black shadow-lg"><Bot size={18}/></div><h3 className="text-[11px] font-black uppercase text-white italic tracking-widest leading-none font-bold italic text-white uppercase italic">Live Scout AI</h3></div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide text-left text-sm text-gray-400 font-bold italic opacity-60">Sunt gata să analizez profile de jucători pentru U Cluj. Adaugă-i în colecții pentru a-i urmări.</div>
                  <div className="p-6 bg-[#161b22] border-t border-gray-800 flex gap-4"><input type="text" placeholder="Întreabă AI..." className="flex-1 bg-[#0d1117] border border-gray-800 rounded-2xl py-4 px-6 text-sm text-white focus:border-[#00ff88] outline-none font-bold italic" /><button className="bg-[#00ff88] text-black p-4 rounded-2xl shadow-lg font-bold italic text-white uppercase italic"><Send size={20} /></button></div>
               </div>
               <div className="w-[40%] overflow-y-auto pr-2 scrollbar-hide grid grid-cols-2 gap-4 pb-10">
                  {allPlayers.map(p => (
                    <PlayerCard key={p.id} player={p} compact={true} isFavoriteDefault={watchlistData.some(i => i.player.id===p.id)} onFavoriteClick={setPlayerToSave} onOpenReport={setSelectedPlayerForReport} />
                  ))}
               </div>
            </div>
          )}

          {tab==='compare' && (
            <div className="bg-[#0d1117] border border-gray-800 rounded-[3rem] p-10 shadow-2xl animate-in fade-in duration-500 text-left text-white font-sans font-bold italic text-white uppercase italic">
                <div className="flex justify-between items-center mb-8 uppercase italic font-bold">
                    <h2 className="text-[10px] italic tracking-widest text-left font-black">Compare Mode</h2>
                    <div className="flex bg-[#161b22] p-1.5 rounded-2xl border border-gray-800 font-bold uppercase italic font-black">
                        <button onClick={() => setCompareMode('between')} className={`px-6 py-2 rounded-xl text-[10px] transition-all font-bold ${compareMode==='between'?'bg-white text-black shadow-lg':'text-gray-500 hover:text-white'}`}>Între ei</button>
                        <button onClick={() => setCompareMode('league')} className={`px-6 py-2 rounded-xl text-[10px] transition-all font-bold ${compareMode==='league'?'bg-white text-black shadow-lg':'text-gray-500 hover:text-white'}`}>vs. Ligă</button>
                    </div>
                </div>
                <div className="bg-[#161b22] p-12 rounded-[3rem] border border-gray-800 flex justify-between items-start mb-12 relative overflow-hidden text-white font-bold italic uppercase">
                  <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-[0_0_15px_#fff6] text-4xl font-black italic uppercase text-white tracking-tighter">VS</div>
                  <div className="flex flex-col items-center gap-6 z-20"><SearchablePlayerSelect players={allPlayers} selectedPlayerId={player1Id} onSelect={setPlayer1Id} colorClass="[#00ff88]" placeholder="Player 1" /><div className="flex items-center gap-6 text-left"><div className="w-24 h-24 rounded-full bg-black border-2 border-[#00ff88] flex items-center justify-center text-[#00ff88] shadow-lg"><UserRound size={44}/></div><div className="text-left text-white"><h3 className="text-3xl font-black italic leading-none text-[#00ff88] tracking-tighter">{p1.name.split(' ')[1] || p1.name}</h3><p className="text-gray-400 text-[10px] font-black mt-1 uppercase text-left tracking-widest uppercase italic">{p1.club}</p></div></div></div>
                  <div className="flex flex-col items-center gap-6 z-20"><SearchablePlayerSelect players={allPlayers} selectedPlayerId={player2Id} onSelect={setPlayer2Id} colorClass="white" placeholder="Player 2" /><div className="flex items-center gap-6 flex-row-reverse text-right"><div className={`w-24 h-24 rounded-full bg-black border-2 flex items-center justify-center shadow-lg transition-colors ${compareMode==='between'?'border-blue-500 text-blue-500':'border-orange-500 text-orange-500'}`}><UserRound size={44}/></div><div><h3 className={`text-3xl font-black italic leading-none tracking-tighter`}>{compareMode==='between' ? (p2.name.split(' ')[1] || p2.name) : 'AVG'}</h3><p className="text-gray-400 text-[10px] font-black mt-1 uppercase tracking-widest text-right leading-none uppercase italic">{compareMode==='between' ? p2.club : 'Superliga Avg'}</p></div></div></div>
                </div>
                <div className="space-y-8 max-w-5xl mx-auto text-left font-bold italic uppercase">
                  {[{l:"Goluri",v1:p1.goals,v2:compareMode==='between'?p2.goals:4.5},{l:"Asisturi",v1:p1.assists,v2:compareMode==='between'?p2.assists:3.2},{l:"Meciuri",v1:p1.matchesPlayed,v2:compareMode==='between'?p2.matchesPlayed:25}].map(r => (
                    <div key={r.l} className="px-2 text-left font-bold italic uppercase italic"><div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-3 font-black tracking-widest"><span>{r.v1}</span><span>{r.l}</span><span>{r.v2}</span></div><div className="flex gap-6 items-center"><div className="flex-1 h-3 bg-gray-900 rounded-full overflow-hidden rotate-180"><div className="h-full bg-[#00ff88] shadow-lg shadow-[#00ff8844]" style={{width:`${(r.v1/35)*100}%`}}/></div><div className="flex-1 h-3 bg-gray-900 rounded-full overflow-hidden"><div className={`h-full ${compareMode==='between'?'bg-blue-500 shadow-blue-500/20':'bg-orange-500 shadow-orange-500/20'} shadow-lg`} style={{width:`${(r.v2/35)*100}%`}}/></div></div></div>
                  ))}
                </div>
            </div>
          )}
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
            <div className="space-y-4 font-black uppercase italic"><label className="text-[10px] text-gray-500 uppercase">Age: {tempMinAge}-{tempMaxAge}</label><div><input type="range" min="16" max="40" value={tempMinAge} onChange={(e) => setTempMinAge(parseInt(e.target.value))} className="w-full accent-[#00ff88] h-1 bg-gray-800 rounded-full appearance-none mb-4"/></div><div><input type="range" min="16" max="40" value={tempMaxAge} onChange={(e) => setTempMaxAge(parseInt(e.target.value))} className="w-full accent-[#00ff88] h-1 bg-gray-800 rounded-full appearance-none"/></div></div>
            {/* Goluri */}
            <div className="space-y-4 font-black uppercase italic"><label className="text-[10px] text-gray-500 uppercase">Goals: {tempMinGoals}-{tempMaxGoals}</label><div><input type="range" min="0" max="30" value={tempMinGoals} onChange={(e) => setTempMinGoals(parseInt(e.target.value))} className="w-full accent-[#00ff88] h-1 bg-gray-800 rounded-full appearance-none mb-4"/></div><div><input type="range" min="0" max="30" value={tempMaxGoals} onChange={(e) => setTempMaxGoals(parseInt(e.target.value))} className="w-full accent-[#00ff88] h-1 bg-gray-800 rounded-full appearance-none"/></div></div>
            {/* Assist-uri */}
            <div className="space-y-4 font-black uppercase italic"><label className="text-[10px] text-gray-500 uppercase">Assists: {tempMinAssists}-{tempMaxAssists}</label><div><input type="range" min="0" max="20" value={tempMinAssists} onChange={(e) => setTempMinAssists(parseInt(e.target.value))} className="w-full accent-[#00ff88] h-1 bg-gray-800 rounded-full appearance-none mb-4"/></div><div><input type="range" min="0" max="20" value={tempMaxAssists} onChange={(e) => setTempMaxAssists(parseInt(e.target.value))} className="w-full accent-[#00ff88] h-1 bg-gray-800 rounded-full appearance-none"/></div></div>
         </div>
         <button onClick={handleApply} className="mt-8 w-full py-4 bg-[#00ff88] text-black font-black uppercase text-xs rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all font-sans italic uppercase">Apply Extended Filters</button>
      </aside>

      {/* MODAL SAVE PLAYER - UI CLEAN RESTORED */}
      {playerToSave && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
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
            <h3 className="text-xl font-black text-white uppercase italic mb-2 tracking-tighter text-center">Mutare Jucător</h3>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-8 text-center italic text-white uppercase italic">Stergi din "{moveCopyConfig.currentFolder}"?</p>
            <div className="grid grid-cols-2 gap-4 uppercase font-black text-[11px] tracking-widest italic text-center font-black italic uppercase font-sans">
              <button onClick={() => finalizeMoveCopy(true)} className="py-4 bg-[#00ff88] text-black rounded-2xl hover:scale-105 uppercase font-bold italic shadow-lg">Da</button>
              <button onClick={() => finalizeMoveCopy(false)} className="py-4 bg-[#161b22] text-white border border-gray-800 rounded-2xl transition-all uppercase font-bold italic shadow-lg">Nu</button>
            </div>
          </div>
        </div>
      )}

      {/* FOLDER DELETE (DA/NU) */}
      {folderToDelete && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0d1117] border border-red-500/30 w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl text-center font-black italic uppercase font-sans">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6 text-center"><Trash2 size={32}/></div>
            <h3 className="text-xl font-black text-white uppercase italic mb-2 tracking-tighter text-center">Stergi folderul?</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8 text-center italic text-white">"{folderToDelete}"</p>
            <div className="grid grid-cols-2 gap-4 uppercase font-black text-[11px] tracking-widest italic text-center">
              <button onClick={() => { setFolders(folders.filter(f => f !== folderToDelete)); setWatchlistData(watchlistData.filter(i => i.folder !== folderToDelete)); if (selectedFolder === folderToDelete) setSelectedFolder("ALL"); setFolderToDelete(null); }} className="py-4 bg-red-500 text-white rounded-2xl font-bold italic uppercase shadow-lg shadow-red-500/20">Da</button>
              <button onClick={() => setFolderToDelete(null)} className="py-4 bg-[#161b22] text-white border border-gray-800 rounded-2xl font-bold italic uppercase italic">Nu</button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY PANEL */}
      <aside className={`fixed right-0 top-0 h-full w-80 bg-[#0d1117] border-l border-gray-800 transform transition-transform duration-500 p-8 z-[100] ${isHist?'translate-x-0':'translate-x-full'} shadow-2xl flex flex-col text-left text-white italic uppercase font-bold`}>
         <div className="flex justify-between items-center mb-10 text-white font-black uppercase text-sm italic tracking-tighter text-left italic font-black italic uppercase font-sans"><h3 className="flex gap-3 text-white tracking-tighter italic uppercase font-bold italic uppercase font-sans"><Clock size={18} className="text-[#00ff88] font-bold uppercase italic"/> History</h3><X size={20} className="text-gray-600 cursor-pointer hover:text-white font-bold italic" onClick={() => setIsHist(false)}/></div>
         <div className="space-y-4 overflow-y-auto scrollbar-hide text-left text-white italic uppercase font-bold font-black italic uppercase font-sans">{[{id:1,t:"Analiză Petrila",d:"Astăzi"},{id:2,t:"Scouting Ghana",d:"Ieri"}].map(h => (<div key={h.id} className="p-5 bg-[#161b22] border border-gray-800 rounded-2xl hover:border-[#00ff88]/50 cursor-pointer shadow-lg text-left text-white font-bold font-bold font-black italic uppercase font-sans"><p className="text-[11px] font-bold text-white group-hover:text-[#00ff88] mb-1 italic font-bold">{h.t}</p><span className="text-[9px] text-gray-600 font-black uppercase font-bold font-black italic uppercase font-sans">{h.d}</span></div>))}</div>
      </aside>

      {/* REPORT OVERLAY */}
      {selectedPlayerForReport && (
        <div className="fixed inset-0 z-[600] bg-[#05070a] overflow-y-auto font-sans text-white animate-in slide-in-from-bottom duration-500 p-10 text-left italic font-bold font-black italic uppercase font-sans">
            <button onClick={() => setSelectedPlayerForReport(null)} className="mb-10 flex items-center gap-2 text-gray-500 hover:text-[#00ff88] font-black uppercase text-xs tracking-widest transition-all italic leading-none font-black italic uppercase font-sans">Înapoi</button>
            <h1 className="text-6xl uppercase tracking-tighter text-left italic font-black text-white text-left uppercase italic font-bold font-black italic uppercase font-sans">{selectedPlayerForReport.name}</h1>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `.perspective-1000{perspective:1000px}.preserve-3d{transform-style:preserve-3d}.backface-hidden{backface-visibility:hidden}.rotate-y-180{transform:rotateY(180deg)}`}} />
    </div>
  );
}