export const TOOLS = {
    SELECT: 'select',
    RECT: 'rect',
    ARROW: 'arrow',
    SPOTLIGHT: 'spotlight',
    CROP: 'crop',
    TEXT: 'text',
    MOSAIC: 'mosaic' 
};

export const TOOL_DETAILS = {
    [TOOLS.SELECT]: { label: '选择', shortcut: 'V' },
    [TOOLS.RECT]: { label: '矩形', shortcut: 'R' },
    [TOOLS.ARROW]: { label: '箭头', shortcut: 'A' },
    [TOOLS.SPOTLIGHT]: { label: '聚光灯', shortcut: 'S' },
    [TOOLS.CROP]: { label: '裁切', shortcut: 'C' },
    [TOOLS.TEXT]: { label: '文本', shortcut: 'T' },
    [TOOLS.MOSAIC]: { label: '马赛克', shortcut: 'M' },
};

export const STYLES = {
    lineWidth: 4,
    spotlight: { overlayColor: 'rgba(0, 0, 0, 0.75)' }
};

export const BRUSH_SIZES = [
    { value: 10, label: '细' },
    { value: 20, label: '中' },
    { value: 40, label: '粗' }
];

export const COLORS = [
    { name: 'red', value: '#ef4444' },
    { name: 'yellow', value: '#eab308' },
    { name: 'green', value: '#22c55e' },
    { name: 'blue', value: '#3b82f6' },
    { name: 'purple', value: '#a855f7' },
    { name: 'white', value: '#ffffff' },
    { name: 'black', value: '#000000' },
];
