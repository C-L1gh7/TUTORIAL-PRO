import React, { useState, useEffect, useRef } from 'react';

export default function ProjectNameModal({ isOpen, onSetProjectName }) {
    const [name, setName] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            // Slight delay to ensure DOM is ready
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-zinc-800 border-2 border-blue-500/30 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                {/* Icon */}
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                        <path d="M9 18h6" />
                        <path d="M10 22h4" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold mb-2 text-white text-center">Tutorial Pro</h2>
                <p className="text-zinc-400 text-sm text-center mb-6">
                    图片标注 & 教程制作工具
                </p>

                <label className="block text-sm text-zinc-400 mb-2 font-medium">项目名称</label>
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') onSetProjectName(name.trim() || 'Project');
                        if (e.key === 'Escape') onSetProjectName(name.trim() || 'Project');
                    }}
                    placeholder="输入项目名称..."
                    className="w-full bg-zinc-900 border border-zinc-600 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all mb-6"
                />

                <button
                    onClick={() => onSetProjectName(name.trim() || 'Project')}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 text-lg"
                >
                    开始绘制
                </button>

                <p className="text-zinc-600 text-xs text-center mt-4">
                    按 Enter 快速开始 · 支持 Ctrl+V 粘贴截图
                </p>
            </div>
        </div>
    );
}
