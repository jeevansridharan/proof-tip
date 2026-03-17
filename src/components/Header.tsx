// src/components/Header.tsx
// Top navigation bar for ProofTip.

import React from 'react';
import { Zap } from 'lucide-react';

const Header: React.FC = () => (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/30 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                    <span className="font-bold text-white tracking-tight">ProofTip</span>
                    <span className="text-white/30 font-light ml-1.5 text-sm hidden sm:inline">
                        AI Community Reward Agent
                    </span>
                </div>
            </div>

            {/* Status pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">Agent Active</span>
            </div>
        </div>
    </header>
);

export default Header;
