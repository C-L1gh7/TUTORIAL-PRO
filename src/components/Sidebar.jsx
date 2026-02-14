import React from 'react';
import { X } from 'lucide-react';

export default function Sidebar({ images, activeImgIndex, setActiveImgIndex, onDeleteImage }) {
    return (
        <aside className="w-56 border-r border-zinc-800 flex flex-col bg-zinc-900 flex-shrink-0">
            <div className="p-4 border-b border-zinc-800 flex items-center">
                <h1 className="font-bold tracking-tight text-blue-400">TUTORIAL PRO</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {images.map((img, idx) => (
                    <div
                        key={img.id}
                        onClick={() => setActiveImgIndex(idx)}
                        className={`group relative aspect-video bg-zinc-950 rounded-lg border-2 cursor-pointer overflow-hidden transition-all ${
                            activeImgIndex === idx
                                ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                    >
                        <img src={img.src} className="w-full h-full object-cover" alt={`Step ${idx + 1}`} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteImage(idx);
                                }}
                                className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors text-white"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-[10px] text-white rounded">
                            Step {idx + 1}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
