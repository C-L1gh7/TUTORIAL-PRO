import React, { useState } from 'react';

export default function ProjectNameModal({ isOpen, onSetProjectName }) {
    const [name, setName] = useState('Project');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl shadow-2xl w-96">
                <h2 className="text-xl font-bold mb-4 text-white">开始新项目</h2>
                <label className="block text-sm text-zinc-400 mb-2">项目名称</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSetProjectName(name)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 mb-6"
                    autoFocus
                />
                <button
                    onClick={() => onSetProjectName(name)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors"
                >
                    开始绘制
                </button>
            </div>
        </div>
    );
}
