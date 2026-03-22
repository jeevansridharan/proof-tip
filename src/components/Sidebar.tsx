import React from 'react';
import { Zap, Home, PlusCircle, LayoutDashboard, Settings } from 'lucide-react';

interface SidebarProps {
    activeTab: 'home' | 'submit' | 'dashboard';
    onTabChange: (tab: 'home' | 'submit' | 'dashboard') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    const navItems = [
        { id: 'home', label: 'Home Overview', icon: Home },
        { id: 'submit', label: 'Submit Idea', icon: PlusCircle },
        { id: 'dashboard', label: 'Community Dashboard', icon: LayoutDashboard },
    ] as const;

    return (
        <aside className="w-64 fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-2xl">
            {/* Logo Area */}
            <div className="p-6 pb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-extrabold text-white text-xl tracking-tight">ProofTip</span>
                        <div className="text-white/30 font-medium text-[10px] uppercase tracking-widest mt-0.5">
                            AI Agent
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                <div className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4 px-3">
                    Menu
                </div>
                {navItems.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => onTabChange(id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeTab === id
                                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                                : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                    >
                        <Icon className={`w-4 h-4 ${activeTab === id ? 'text-indigo-400' : 'text-white/40'}`} />
                        {label}
                    </button>
                ))}
            </nav>

            {/* Status Area */}
            <div className="p-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-white/70 font-medium">Agent Active</span>
                    </div>
                    <Settings className="w-4 h-4 text-white/30 hover:text-white cursor-pointer transition-colors" />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
