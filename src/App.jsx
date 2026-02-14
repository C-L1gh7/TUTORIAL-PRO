import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lightbulb } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import ProjectNameModal from './components/ProjectNameModal';
import { TOOLS, STYLES, COLORS, BRUSH_SIZES, TOOL_DETAILS } from './constants';

const App = () => {
    // Project State
    const [projectName, setProjectName] = useState('Project');
    const [showProjectModal, setShowProjectModal] = useState(true);

    // Image State
    const [images, setImages] = useState([]);
    const [activeImgIndex, setActiveImgIndex] = useState(-1);

    // Editor State
    const [activeTool, setActiveTool] = useState(TOOLS.RECT);
    const [strokeColor, setStrokeColor] = useState(COLORS[0].value);
    const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].value);
    const [mosaicStrength, setMosaicStrength] = useState(20);
    const [shapes, setShapes] = useState([]);
    const [spotlights, setSpotlights] = useState([]);
    
    // Interaction State
    const [isDrawing, setIsDrawing] = useState(false);
    const [tempRect, setTempRect] = useState(null);
    const [currentPath, setCurrentPath] = useState([]); // For Mosaic Brush
    const [textInput, setTextInput] = useState(null); // { x, y }

    // Refs
    const canvasRef = useRef(null);
    const cursorRef = useRef(null); // Kept to avoid breaking if used, though logic removed
    const startPos = useRef({ x: 0, y: 0 });
    const imgCache = useRef(new Map());
    const textAreaRef = useRef(null);

    // Helper: Load Image
    const getCachedImage = (src) => {
        if (imgCache.current.has(src)) return Promise.resolve(imgCache.current.get(src));
        return new Promise((resolve, reject) => {
            const img = new Image();
            if (src.startsWith('http')) img.crossOrigin = "anonymous";
            img.onload = () => { imgCache.current.set(src, img); resolve(img); };
            img.onerror = reject;
            img.src = src;
        });
    };

    // Helper: Draw Arrow
    const drawArrow = (ctx, fromx, fromy, tox, toy) => {
        const headlen = 20;
        const angle = Math.atan2(toy - fromy, tox - fromx);
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(tox, toy);
        ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    };

    // Helper: Draw Text
    const drawText = (ctx, shape) => {
        ctx.font = 'bold 24px sans-serif'; // Default font
        ctx.fillStyle = shape.color;
        ctx.textBaseline = 'top';
        const lines = shape.text.split('\n');
        lines.forEach((line, i) => {
            ctx.fillText(line, shape.x, shape.y + (i * 30));
        });
    };

    // Helper: Draw Mosaic Path
    const drawMosaicPath = (ctx, path, size, img, intensity = 20) => {
        if (path.length < 2) return;

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        // 1. Create an offscreen canvas for the mask
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');

        // 2. Draw the brush stroke (Mask)
        tempCtx.beginPath();
        tempCtx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            tempCtx.lineTo(path[i].x, path[i].y);
        }
        tempCtx.lineCap = 'round';
        tempCtx.lineJoin = 'round';
        tempCtx.lineWidth = size;
        tempCtx.strokeStyle = '#000'; 
        tempCtx.stroke();

        // 3. Composite the pixelated image onto the stroke
        tempCtx.globalCompositeOperation = 'source-in';
        
        // Correct Pixelation: Downscale then upscale
        const scale = 1 / Math.max(1, intensity);
        const smallW = Math.max(1, Math.floor(w * scale));
        const smallH = Math.max(1, Math.floor(h * scale));
        
        // Use a temporary small canvas to perform the downscaling
        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = smallW;
        smallCanvas.height = smallH;
        const smallCtx = smallCanvas.getContext('2d');
        smallCtx.drawImage(img, 0, 0, smallW, smallH);

        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(smallCanvas, 0, 0, w, h);
        tempCtx.imageSmoothingEnabled = true;

        // 4. Draw the result onto the main canvas
        ctx.save();
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
    };

    // Helper: Draw Spotlights
    const drawSpotlights = (ctx, boxes) => {
        if (!boxes || boxes.length === 0) return;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
        boxes.forEach(box => {
            ctx.rect(box.x, box.y, box.w, box.h);
        });
        ctx.fillStyle = STYLES.spotlight.overlayColor;
        ctx.fill('evenodd');
        ctx.restore();
    };

    // Main Render Function
    const render = useCallback(async (previewRect = null, previewPath = null) => {
        if (activeImgIndex === -1 || !images[activeImgIndex]) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const imgData = images[activeImgIndex];

        try {
            const img = await getCachedImage(imgData.src);
            // Verify canvas size matches image
            if (canvas.width !== img.width || canvas.height !== img.height) {
                canvas.width = img.width;
                canvas.height = img.height;
            }

            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

             // Draw Mosaic Shapes (Bottom Layer, before spotlights)
            shapes.filter(s => s.type === TOOLS.MOSAIC).forEach(shape => {
                drawMosaicPath(ctx, shape.path, shape.size, img, shape.intensity || 20);
            });
            
            // Preview Mosaic Path
            if (activeTool === TOOLS.MOSAIC && previewPath && previewPath.length > 0) {
                 drawMosaicPath(ctx, previewPath, brushSize, img, mosaicStrength);
            }

            // Determine Spotlights to Draw (Existing + Preview)
            let spotsToDraw = [...spotlights];
            if (activeTool === TOOLS.SPOTLIGHT && previewRect) {
                spotsToDraw.push(previewRect);
            }

            // Draw Spotlights
            if (spotsToDraw.length > 0) {
                drawSpotlights(ctx, spotsToDraw);
            }

            // Draw Other Shapes
            shapes.filter(s => s.type !== TOOLS.MOSAIC).forEach(shape => {
                ctx.save();
                ctx.strokeStyle = shape.color || '#ef4444';
                ctx.lineWidth = STYLES.lineWidth;
                
                if (shape.type === TOOLS.RECT) {
                    ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
                } else if (shape.type === TOOLS.ARROW) {
                    drawArrow(ctx, shape.x, shape.y, shape.ex, shape.ey);
                } else if (shape.type === TOOLS.TEXT) {
                    drawText(ctx, shape);
                }
                ctx.restore();
            });

            // Preview Current Tool
            if (previewRect && activeTool !== TOOLS.MOSAIC) {
                 ctx.save();
                 if (activeTool === TOOLS.CROP) {
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.clearRect(previewRect.x, previewRect.y, previewRect.w, previewRect.h);
                    ctx.drawImage(img,
                        previewRect.x, previewRect.y, previewRect.w, previewRect.h,
                        previewRect.x, previewRect.y, previewRect.w, previewRect.h
                    );
                    ctx.strokeStyle = '#fff';
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(previewRect.x, previewRect.y, previewRect.w, previewRect.h);
                 } else if (activeTool === TOOLS.RECT) {
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = STYLES.lineWidth;
                    ctx.strokeRect(previewRect.x, previewRect.y, previewRect.w, previewRect.h);
                 } else if (activeTool === TOOLS.ARROW) {
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = STYLES.lineWidth;
                    drawArrow(ctx, previewRect.x, previewRect.y, previewRect.ex, previewRect.ey);
                 } else if (activeTool === TOOLS.SPOTLIGHT) {
                    // Just draw the border, overlay is handled above
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(previewRect.x, previewRect.y, previewRect.w, previewRect.h);
                 }
                 ctx.restore();
            }

        } catch (e) { console.error(e); }
    }, [activeImgIndex, images, shapes, spotlights, activeTool, strokeColor, brushSize, mosaicStrength]);

    // Effect: Re-render when state changes
    useEffect(() => {
        render(tempRect, currentPath);
    }, [render, tempRect, currentPath]);

    // Effect: Initialize/Sync state when changing active image
    useEffect(() => {
        if (activeImgIndex !== -1 && images[activeImgIndex]) {
            const img = images[activeImgIndex];
            setShapes(img.shapes || []);
            // Handle legacy single spotlight or new array
            const spots = img.spotlights || (img.spotlight ? [img.spotlight] : []);
            setSpotlights(spots);
            setTempRect(null);
            setCurrentPath([]);
            setTextInput(null);
        }
    }, [activeImgIndex, images]);

    // Shortcuts Handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if user is typing in an input or textarea
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

            // Check if any tool shortcut matches
            Object.keys(TOOL_DETAILS).forEach(toolKey => {
                const detail = TOOL_DETAILS[toolKey];
                if (e.key.toLowerCase() === detail.shortcut.toLowerCase()) {
                    setActiveTool(toolKey);
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Paste Handler
    useEffect(() => {
        const handlePaste = (e) => {
            if (textInput) return; // Don't paste image if typing
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = (event) => handleImageImport(event.target.result);
                    reader.readAsDataURL(blob);
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [textInput]);

    const handleImageImport = (src) => {
        const newImg = {
            id: Date.now(),
            src,
            shapes: [],
            spotlights: [],
            history: [{ shapes: [], spotlights: [], src }],
            historyIndex: 0
        };
        setImages(prev => {
            const next = [...prev, newImg];
            setActiveImgIndex(next.length - 1);
            return next;
        });
    };

    // History & State Update Logic
    const updateImageState = (newShapes, newSpotlights, newSrc = null) => {
        if (activeImgIndex === -1) return;
        const imgData = images[activeImgIndex];
        
        // Calculate new history
        // Normalize history for spotlights array
        const currentHistory = (imgData.history || []).map(h => ({
            ...h,
            spotlights: h.spotlights || (h.spotlight ? [h.spotlight] : [])
        }));

        if (currentHistory.length === 0) {
             currentHistory.push({ shapes: [], spotlights: [], src: imgData.src });
        }

        let currentIndex = imgData.historyIndex || 0;
        
        const historySlice = currentHistory.slice(0, currentIndex + 1);
        const newState = {
            shapes: newShapes,
            spotlights: newSpotlights,
            src: newSrc || imgData.src
        };
        const newHistory = [...historySlice, newState];
        const newIndex = newHistory.length - 1;

        // Update Component State
        setShapes(newShapes);
        setSpotlights(newSpotlights);

        // Update Images State
        setImages(prev => prev.map((img, i) => 
            i === activeImgIndex 
                ? { 
                    ...img, 
                    shapes: newShapes, 
                    spotlights: newSpotlights, 
                    src: newSrc || img.src,
                    history: newHistory,
                    historyIndex: newIndex
                  } 
                : img
        ));
    };

    const handleUndo = useCallback(() => {
        if (activeImgIndex === -1) return;
        const imgData = images[activeImgIndex];
        const currentIndex = imgData.historyIndex || 0;
        if (currentIndex <= 0) return;

        const prevState = imgData.history[currentIndex - 1];
        const prevSpotlights = prevState.spotlights || (prevState.spotlight ? [prevState.spotlight] : []);
        const newIndex = currentIndex - 1;

        // Update Component State
        setShapes(prevState.shapes);
        setSpotlights(prevSpotlights);

        setImages(prev => prev.map((img, i) =>
            i === activeImgIndex
                ? {
                    ...img,
                    shapes: prevState.shapes,
                    spotlights: prevSpotlights,
                    src: prevState.src,
                    historyIndex: newIndex
                }
                : img
        ));
    }, [activeImgIndex, images]);

    const canUndo = activeImgIndex !== -1 && images[activeImgIndex] && (images[activeImgIndex].historyIndex || 0) > 0;

    // Mouse Event Handlers
    const getPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;
        return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    };

    const handleMouseDown = (e) => {
        if (activeImgIndex === -1) return;
        
        // If text input is active, force commit and return.
        // This ensures the current text is saved before any new action starts.
        if (textInput) {
            handleTextComplete();
            return;
        }

        const pos = getPos(e);
        
        if (activeTool === TOOLS.TEXT) {
            setTextInput({ x: pos.x, y: pos.y, text: '' });
            setTimeout(() => {
                if (textAreaRef.current) textAreaRef.current.focus();
            }, 50);
            return;
        }

        setIsDrawing(true);
        startPos.current = pos;
        
        if (activeTool === TOOLS.MOSAIC) {
            setCurrentPath([pos]);
        }
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;
        const pos = getPos(e);
        
        if (activeTool === TOOLS.MOSAIC) {
            setCurrentPath(prev => [...prev, pos]);
        } else {
            const rect = {
                x: startPos.current.x,
                y: startPos.current.y,
                w: pos.x - startPos.current.x,
                h: pos.y - startPos.current.y,
                ex: pos.x, ey: pos.y
            };
            setTempRect(rect);
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (activeTool === TOOLS.MOSAIC) {
            if (currentPath.length > 1) {
                const newShapes = [...shapes, { type: TOOLS.MOSAIC, path: currentPath, size: brushSize, intensity: mosaicStrength }];
                updateImageState(newShapes, spotlights);
            }
            setCurrentPath([]);
            return;
        }

        if (!tempRect) return;

        // Normalize
        let { x, y, w, h } = tempRect;
        if (w < 0) { x += w; w = Math.abs(w); }
        if (h < 0) { y += h; h = Math.abs(h); }
        const normalizedRect = { ...tempRect, x, y, w, h };

        if (activeTool === TOOLS.RECT || activeTool === TOOLS.ARROW) {
            const newShapes = [...shapes, { ...normalizedRect, type: activeTool, color: strokeColor }];
            updateImageState(newShapes, spotlights);
            setTempRect(null);
        } else if (activeTool === TOOLS.SPOTLIGHT) {
            // Append new spotlight instead of replacing
            updateImageState(shapes, [...spotlights, { x, y, w, h }]);
            setTempRect(null);
        }
    };

    // Tool Actions
    const applyCrop = async () => {
        if (!tempRect) return;
        const img = await getCachedImage(images[activeImgIndex].src);
        const tempCanvas = document.createElement('canvas');
        let { x, y, w, h } = tempRect;
        if (w < 0) { x += w; w = Math.abs(w); }
        if (h < 0) { y += h; h = Math.abs(h); }

        x = Math.max(0, Math.min(x, img.width));
        y = Math.max(0, Math.min(y, img.height));
        w = Math.min(w, img.width - x);
        h = Math.min(h, img.height - y);

        if (w <= 0 || h <= 0) return;

        tempCanvas.width = w;
        tempCanvas.height = h;
        tempCanvas.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
        const newSrc = tempCanvas.toDataURL();
        imgCache.current.delete(images[activeImgIndex].src); 

        updateImageState([], [], newSrc);
        setTempRect(null);
        setActiveTool(TOOLS.SELECT);
    };

    const handleTextComplete = () => {
        if (!textInput || !textInput.text.trim()) {
            setTextInput(null);
            return;
        }
        const newShape = {
            type: TOOLS.TEXT,
            x: textInput.x,
            y: textInput.y,
            text: textInput.text,
            color: strokeColor
        };
        updateImageState([...shapes, newShape], spotlights);
        setTextInput(null);
        setActiveTool(TOOLS.SELECT);
    };

    const handleDeleteImage = (index) => {
        const next = images.filter((_, i) => i !== index);
        setImages(next);
        if (activeImgIndex === index) {
            setActiveImgIndex(next.length > 0 ? 0 : -1);
        } else if (activeImgIndex > index) {
            setActiveImgIndex(activeImgIndex - 1);
        }
    };

    const handleClear = () => {
        updateImageState([], []); 
    };

    const handleExport = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = `${projectName}-step${activeImgIndex + 1}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
            <ProjectNameModal 
                isOpen={showProjectModal} 
                onSetProjectName={(name) => {
                    setProjectName(name || 'Project');
                    setShowProjectModal(false);
                }} 
            />

            <Sidebar 
                images={images} 
                activeImgIndex={activeImgIndex} 
                setActiveImgIndex={setActiveImgIndex} 
                onDeleteImage={handleDeleteImage}
            />

            <main className="flex-1 flex flex-col">
                <Toolbar 
                    activeTool={activeTool} 
                    setActiveTool={setActiveTool}
                    strokeColor={strokeColor}
                    setStrokeColor={setStrokeColor}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    mosaicStrength={mosaicStrength}
                    setMosaicStrength={setMosaicStrength}
                    handleUndo={handleUndo}
                    canUndo={canUndo}
                    handleClear={handleClear}
                    handleExport={handleExport}
                    applyCrop={applyCrop}
                    tempRect={tempRect}
                    activeImgIndex={activeImgIndex}
                />

                <section className="flex-1 overflow-auto bg-zinc-950 p-10 flex items-center justify-center relative">
                    {activeImgIndex !== -1 ? (
                        <div className="relative shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-zinc-800 bg-zinc-900 group">
                            <canvas 
                                ref={canvasRef} 
                                onMouseDown={handleMouseDown} 
                                onMouseMove={handleMouseMove} 
                                onMouseUp={handleMouseUp} 
                                className={`block max-w-full h-auto ${activeTool === TOOLS.SELECT ? 'cursor-default' : 'cursor-crosshair'}`} 
                            />
                            
                            {/* Text Input Overlay */}
                            {textInput && (
                                <div 
                                    className="absolute z-50"
                                    style={{ 
                                        left: (textInput.x / (canvasRef.current?.width || 1)) * (canvasRef.current?.clientWidth || 0), 
                                        top: (textInput.y / (canvasRef.current?.height || 1)) * (canvasRef.current?.clientHeight || 0) 
                                    }}
                                >
                                    <textarea
                                        ref={textAreaRef}
                                        value={textInput.text}
                                        onChange={(e) => setTextInput({ ...textInput, text: e.target.value })}
                                        onBlur={handleTextComplete}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.ctrlKey) handleTextComplete();
                                            if (e.key === 'Escape') setTextInput(null);
                                        }}
                                        className="bg-transparent border border-blue-500 text-white p-1 outline-none resize-none overflow-hidden"
                                        style={{ 
                                            color: strokeColor, 
                                            fontSize: '24px', 
                                            fontWeight: 'bold', 
                                            minWidth: '100px', 
                                            minHeight: '40px' 
                                        }}
                                        placeholder="Type here..."
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-xl">
                                <Lightbulb size={40} className="text-zinc-700 animate-pulse" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-400 mb-2">准备好开始了吗？</h2>
                            <p className="text-zinc-600 text-sm">按 Ctrl + V 粘贴截图</p>
                            <p className="text-zinc-700 text-xs mt-2">当前项目: {projectName}</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default App;
