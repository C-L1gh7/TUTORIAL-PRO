import React from 'react';
import { MousePointer2, Square, ArrowRight, Scan, Scissors, Type, Undo2, Trash2, Check, Download, LayoutGrid } from 'lucide-react';
import { TOOLS, COLORS, BRUSH_SIZES, TOOL_DETAILS } from '../constants';

export default function Toolbar({
    activeTool, setActiveTool,
    strokeColor, setStrokeColor,
    brushSize, setBrushSize,
    mosaicStrength, setMosaicStrength,
    handleUndo, canUndo,
    handleClear,
    handleExport,
    applyCrop,
    tempRect,
    activeImgIndex
}) {
    return (
        <header className="h-16 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center space-x-2">
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner">
                    <ToolButton tool={TOOLS.SELECT} activeTool={activeTool} onClick={setActiveTool} icon={MousePointer2} />
                    <ToolButton tool={TOOLS.RECT} activeTool={activeTool} onClick={setActiveTool} icon={Square} />
                    <ToolButton tool={TOOLS.ARROW} activeTool={activeTool} onClick={setActiveTool} icon={ArrowRight} />
                    <ToolButton tool={TOOLS.TEXT} activeTool={activeTool} onClick={setActiveTool} icon={Type} />
                    <ToolButton tool={TOOLS.MOSAIC} activeTool={activeTool} onClick={setActiveTool} icon={LayoutGrid} />
                    <ToolButton tool={TOOLS.SPOTLIGHT} activeTool={activeTool} onClick={setActiveTool} icon={Scan} className="text-yellow-400" />
                    <ToolButton tool={TOOLS.CROP} activeTool={activeTool} onClick={setActiveTool} icon={Scissors} className="text-green-400" />
                </div>

                <div className="h-6 w-px bg-zinc-800 mx-2" />

                {/* Brush Size Picker (Visible only for Mosaic) */}
                {activeTool === TOOLS.MOSAIC && (
                    <div className="flex items-center space-x-2">
                        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 items-center">
                            {BRUSH_SIZES.map(size => (
                                <button
                                    key={size.value}
                                    onClick={() => setBrushSize(size.value)}
                                    className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                                        brushSize === size.value 
                                            ? 'bg-zinc-700 text-white' 
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                    title={size.label}
                                >
                                    <div 
                                        style={{ 
                                            height: Math.min(size.value, 16), 
                                            width: Math.min(size.value, 16), 
                                            backgroundColor: 'currentColor',
                                            borderRadius: '50%'
                                        }} 
                                    />
                                </button>
                            ))}
                        </div>
                        
                        {/* Mosaic Intensity Slider */}
                        <div className="flex bg-zinc-950 p-2 rounded-lg border border-zinc-800 items-center ml-2">
                             <span className="text-xs text-zinc-500 mr-2 font-mono whitespace-nowrap">强度</span>
                             <input 
                                type="range" 
                                min="5" 
                                max="50" 
                                value={mosaicStrength} 
                                onChange={(e) => setMosaicStrength(Number(e.target.value))}
                                className="w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                title={`Intensity: ${mosaicStrength}`}
                             />
                        </div>
                    </div>
                )}
                {activeTool === TOOLS.MOSAIC && <div className="h-6 w-px bg-zinc-800 mx-2" />}

                {/* Color Picker */}
                <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 items-center">
                    {COLORS.map(color => (
                        <button
                            key={color.value}
                            onClick={() => setStrokeColor(color.value)}
                            className={`w-6 h-6 rounded mx-0.5 transition-all ${
                                strokeColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110' : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                        />
                    ))}
                    {/* Custom Color Input */}
                    <div className="relative w-6 h-6 mx-0.5 group overflow-hidden rounded bg-gradient-to-br from-red-500 via-green-500 to-blue-500">
                         <input
                            type="color"
                            value={strokeColor}
                            onChange={(e) => setStrokeColor(e.target.value)}
                            className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer p-0 border-0 opacity-0"
                            title="Custom Color"
                        />
                    </div>
                </div>

                <div className="h-6 w-px bg-zinc-800 mx-2" />

                <div className="relative group">
                    <button onClick={handleUndo} disabled={!canUndo} className={`p-2 rounded-lg transition-colors ${canUndo ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' : 'text-zinc-700 cursor-not-allowed'}`}>
                        <Undo2 size={20} />
                    </button>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-zinc-800 text-xs text-zinc-200 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg border border-zinc-700 select-none">
                        撤销 <span className="text-zinc-500 ml-1">(Ctrl+Z)</span>
                    </div>
                </div>

                <button onClick={handleClear} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors">
                    <Trash2 size={20} />
                </button>
            </div>

            <div className="flex items-center space-x-3">
                {activeTool === TOOLS.CROP && tempRect && (
                    <button onClick={applyCrop} className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold transition-all shadow-lg active:scale-95 text-white">
                        <Check size={14} className="mr-2" /> 确认裁切
                    </button>
                )}
                <button
                    onClick={handleExport}
                    disabled={activeImgIndex === -1}
                    className="flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-lg text-sm font-bold shadow-lg transition-all text-white"
                >
                    <Download size={16} className="mr-2" /> 导出图片
                </button>
            </div>
        </header>
    );
}

const ToolButton = ({ tool, activeTool, onClick, icon: Icon, className = '' }) => {
    const details = TOOL_DETAILS[tool];
    return (
        <div className="relative group">
            <button
                onClick={() => onClick(tool)}
                className={`p-2.5 rounded-lg transition-all ${
                    activeTool === tool
                        ? 'bg-zinc-800 text-zinc-200'
                        : 'text-zinc-500 hover:text-zinc-300'
                } ${className}`}
            >
                <Icon size={20} />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-zinc-800 text-xs text-zinc-200 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg border border-zinc-700 select-none">
                {details?.label} <span className="text-zinc-500 ml-1">({details?.shortcut})</span>
            </div>
        </div>
    );
};
