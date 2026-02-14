# Tutorial Pro

Tutorial Pro 是一个基于 Web 的图片标注和教程制作工具。它可以帮助你轻松地为截图添加标注、高亮重点、裁剪图片，并将其导出为教程步骤。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-cyan)

## ✨ 功能特性

*   **图片导入**：支持直接从剪贴板粘贴图片 (Ctrl+V)。
*   **多步骤管理**：在侧边栏管理多个截图步骤，方便制作连续的教程。
*   **丰富的标注工具**：
    *   ⬜ **矩形工具**：框选重点区域。
    *   ➡️ **箭头工具**：指示操作流程。
    *   📝 **文本工具**：添加文字说明。
    *   🔦 **聚光灯 (Spotlight)**：高亮特定区域，压暗背景。
*   **图片编辑**：
    *   ✂️ **裁剪工具**：快速裁剪图片到想要的大小。
*   **样式自定义**：支持多种颜色选择，自定义画笔颜色。
*   **操作便捷**：
    *   支持撤销 (Undo) 操作。
    *   一键清除所有标注。
    *   导出标注后的图片。

## 🛠️ 技术栈

*   [React](https://reactjs.org/) - 用于构建用户界面
*   [Vite](https://vitejs.dev/) - 极速的前端构建工具
*   [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
*   [Lucide React](https://lucide.dev/) - 美观的图标库

## 🚀 快速开始

### 环境要求

*   Node.js (推荐 v16+)
*   npm 或 yarn

### 安装

1.  克隆项目到本地：
    ```bash
    git clone https://github.com/your-username/tutorial-pro.git
    cd tutorial-pro
    ```

2.  安装依赖：
    ```bash
    npm install
    # 或者
    yarn install
    ```

### 运行

启动开发服务器：

```bash
npm run dev
# 或者
yarn dev
```

打开浏览器访问 `http://localhost:5173` (或终端显示的地址)。

预览生产环境构建：

```bash
npm run preview
# 或者
yarn preview
```

### 构建

构建生产环境版本：

```bash
npm run build
# 或者
yarn build
```

## 📂 项目结构

```
TUTORIAL PRO/
├── src/
│   ├── components/       # React 组件
│   │   ├── Sidebar.jsx   # 侧边栏步骤管理
│   │   ├── Toolbar.jsx   # 顶部工具栏
│   │   └── ...
│   ├── App.jsx           # 主应用入口
│   ├── main.jsx          # React 挂载点
│   └── index.css         # 全局样式 (Tailwind)
├── public/               # 静态资源
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── vite.config.js        # Vite 配置
└── tailwind.config.js    # Tailwind 配置
```

## 📖 使用指南

1.  **粘贴图片**：在页面任意位置按下 `Ctrl + V` 粘贴剪贴板中的截图。
2.  **选择工具**：在顶部工具栏选择矩形、箭头、文本等工具。
3.  **开始标注**：在图片上拖拽进行绘制。
4.  **调整颜色**：在工具栏选择不同的颜色。
5.  **导出**：点击右上角的“导出图片”按钮保存当前步骤。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 许可证

[MIT](LICENSE)
