# NotepadXX

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.2-purple.svg)](https://vitejs.dev/)
[![Monaco Editor](https://img.shields.io/badge/Monaco%20Editor-VS%20Code%20Editor-green.svg)](https://microsoft.github.io/monaco-editor/)

> A powerful, browser-based code editor that replicates Notepad++ functionality with modern web technologies. Built for developers who need a lightweight, offline-capable editing environment.


## ✨ Features

### 🎯 Core Functionality
- **Multi-tab editing** - Open and manage multiple files simultaneously
- **Syntax highlighting** - Support for 20+ programming languages
- **Find & Replace** - Advanced search and replace functionality
- **Auto-save** - Automatic persistence of all changes
- **Offline-first** - Works completely offline after initial load

### 💾 Data Management
- **Persistent storage** - Uses IndexedDB for local file storage
- **Settings persistence** - Remembers active tab, font size, and preferences
- **Backup & Restore** - Export/import your entire workspace as JSON
- **Version control** - Database migration support for seamless updates

### 🎨 User Experience
- **Professional dark theme** - Easy on the eyes for long coding sessions
- **Adjustable font sizes** - Customizable from 12px to 24px
- **Inline tab renaming** - Double-click to rename tabs
- **File download** - Export individual files with proper extensions
- **Responsive design** - Works on desktop, tablet, and mobile

### 🔧 Technical Features
- **Monaco Editor** - VS Code's editor engine for professional editing experience
- **TypeScript support** - Full type safety and IntelliSense
- **Modern build system** - Vite for fast development and optimized builds
- **Cross-platform** - Runs in any modern browser
- **No installation required** - Just open and start coding

## 🚀 Supported Languages

NotepadXX provides syntax highlighting for:

| Language | Extension | Language | Extension |
|----------|-----------|----------|-----------|
| Plain Text | `.txt` | JavaScript | `.js` |
| TypeScript | `.ts` | Python | `.py` |
| HTML | `.html` | CSS | `.css` |
| JSON | `.json` | XML | `.xml` |
| Markdown | `.md` | SQL | `.sql` |
| Shell | `.sh` | YAML | `.yml` |
| Java | `.java` | C++ | `.cpp` |
| C | `.c` | PHP | `.php` |
| Ruby | `.rb` | Go | `.go` |
| Rust | `.rs` | | |

## 🛠️ Technology Stack

### Core Technologies
- **Frontend Framework**: React 19.2.0 with React Compiler (experimental)
- **Language**: TypeScript 5.6.3 with strict mode
- **Code Editor**: Monaco Editor (VS Code's editor engine)
- **Build Tool**: Vite 7.2.2 with rolldown-vite (next-generation bundler)
- **Package Manager**: pnpm

### UI & Styling
- **UI Framework**: shadcn/ui component library
- **Styling**: Tailwind CSS 4.1.17 with CSS variables theming
- **Icons**: Lucide React
- **Theme System**: Dark/light/system theme switching

### Data & Storage
- **Storage**: IndexedDB via idb library
- **State Management**: React hooks with persistent storage
- **Database Versioning**: Migration support for seamless updates

### Development Tools
- **Code Quality**: ESLint configuration for React and TypeScript
- **Type Checking**: Strict TypeScript compilation
- **React Compiler**: Experimental features enabled for optimization

## 📋 Prerequisites

- **Node.js 18+** (recommended latest LTS)
- **Modern browser** with IndexedDB support
- **pnpm package manager** (required for workspace configuration)

## 📦 Installation

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/almahdi/notepadxx.git
   cd notepadxx
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start development server:
   ```bash
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Production Build
```bash
pnpm build
pnpm preview
```

## 🌐 Browser Support

NotepadXX works on all modern browsers with the following minimum versions:

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | Recommended for best performance |
| Firefox | 88+ | Full feature support |
| Safari | 14+ | Including mobile Safari |
| Edge | 90+ | Chromium-based Edge |

### Required Features
- **IndexedDB** - For local file storage and settings
- **ES2020+** - JavaScript support for modern syntax
- **CSS Custom Properties** - For theming system
- **Web Workers** - For Monaco Editor functionality

### Mobile Support
- Responsive design works on tablets and large phones
- Touch gestures supported for basic operations
- Virtual keyboard compatibility optimized

## 🎮 Usage

### Basic Operations
- **New Tab**: Click the "New" button or press `Ctrl+N`
- **Switch Tabs**: Click on any tab to make it active
- **Close Tab**: Click the `×` button on any tab
- **Rename Tab**: Double-click on the tab name
- **Save File**: Click "Save" to download the current file

### Advanced Features
- **Find/Replace**: Use the Find and Replace buttons for search operations
- **Language Selection**: Choose syntax highlighting from the language dropdown
- **Font Size**: Adjust editor font size from 12px to 24px
- **Backup**: Click "Backup" to download your entire workspace
- **Restore**: Click "Restore" to import a previously saved backup

### Keyboard Shortcuts
- `Ctrl+N` - New tab
- `Ctrl+S` - Save current file
- `Ctrl+F` - Find
- `Ctrl+H` - Replace
- `Ctrl+W` - Close current tab

## 💾 Backup & Restore

NotepadXX includes a comprehensive backup system that allows you to:

### Creating Backups
1. Click the "Backup" button in the toolbar
2. A JSON file will be automatically downloaded
3. Filename format: `notepadxx-backup-YYYY-MM-DD-HHMM.json`

### Restoring Backups
1. Click the "Restore" button
2. Select a previously saved backup JSON file
3. Confirm the restore operation
4. All current data will be replaced with the backup

### Backup Format
```json
{
  "backup": {
    "version": "1.0",
    "timestamp": 1732012345,
    "appVersion": "1.0.0",
    "database": {
      "name": "notepadxx",
      "version": 2,
      "stores": {
        "files": [...],
        "settings": [...]
      }
    }
  }
}
```

## 🏗️ Architecture

### Database Schema
- **Database Name**: `notepadxx`
- **Version**: 2 (with migration support)
- **Object Stores**:
  - `files`: Stores all file data (id, name, content, language)
  - `settings`: Stores application preferences (activeTabId, fontSize, etc.)

### State Management
- **Local State**: React useState hooks for UI state
- **Persistent State**: IndexedDB for files and settings
- **No External Dependencies**: Simple, maintainable architecture

### Component Architecture
- **UI Components**: Built with shadcn/ui component library
- **Editor Integration**: Monaco Editor wrapped in React component
- **Theme System**: CSS variables with Tailwind CSS for consistent theming
- **File Management**: Custom hooks for IndexedDB operations
- **Responsive Design**: Mobile-first approach with breakpoint handling

### Data Flow
1. **User Actions** → React State Updates
2. **State Changes** → IndexedDB Persistence (async)
3. **Database Events** → UI Re-rendering
4. **Settings Changes** → Immediate UI updates + persistence

### Key Components
- **App.tsx**: Main application container with routing
- **Editor**: Monaco Editor integration with syntax highlighting
- **TabManager**: Multi-tab interface with drag-and-drop
- **FileOperations**: Save, load, backup, restore functionality
- **ThemeProvider**: Dark/light/system theme switching

### Migration Strategy
- **Version 1 → 2**: Added settings store for persistent app state
- **Future Versions**: Structured migration path for seamless upgrades
- **Data Preservation**: All existing data is preserved during upgrades

## 🚀 Deployment

### Static Hosting
NotepadXX is a pure client-side application and can be deployed to any static hosting service:

```bash
# Build for production
pnpm build

# Deploy the `dist` folder to your preferred hosting service
```

### GitHub Pages
```bash
# Build and deploy to GitHub Pages
pnpm build
# Deploy dist folder to gh-pages branch
```

### Environment Considerations
- **No server required** - Pure client-side application
- **No environment variables** - All configuration is client-side
- **CORS considerations** - File operations may require proper CORS headers for cross-origin access
- **HTTPS recommended** - Some features work better over secure connections

### Supported Hosting Platforms
- Netlify
- Vercel
- GitHub Pages
- GitLab Pages
- AWS S3 + CloudFront
- Firebase Hosting
- Any static file server

## ⚡ Performance

### File Size Limits
- **Individual files**: Recommended <1MB for optimal performance
- **Total storage**: Limited by browser IndexedDB quota (typically 50MB-2GB)
- **Large files**: May cause UI lag during editing and operations

### Optimization Tips
- **Use backup/restore** for managing large datasets
- **Close unused tabs** to free memory
- **Regular browser cache cleanup** for optimal performance
- **Avoid very large files** - split into smaller files when possible

### Browser Performance
- **Chrome**: Best performance with Monaco Editor
- **Firefox**: Good performance, slightly slower startup
- **Safari**: Good performance, limited by device capabilities
- **Mobile**: Optimized for tablets, performance varies by device

### Memory Management
- **Tab management**: Each open tab consumes memory
- **Auto-save**: Runs efficiently in background
- **IndexedDB**: Asynchronous operations prevent UI blocking
- **Monaco Editor**: Optimized for large files but has limits

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Available Scripts
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (includes TypeScript compilation)
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint code quality checks

### Code Quality
- **ESLint**: Configured for React and TypeScript best practices
- **TypeScript**: Strict mode enabled for type safety
- **React Compiler**: Experimental features enabled for optimization
- **Build Process**: rolldown-vite for fast, optimized builds

### Code Style
- Follow the existing TypeScript/React patterns
- Use ESLint for code linting (run `pnpm lint` before commits)
- Write meaningful commit messages
- Add comments for complex logic
- Maintain consistency with shadcn/ui component patterns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 About the Author

**Ali Almahdi** - Digital Innovation Architect & AI Enthusiast

I'm a passionate developer and technology enthusiast with an MBA and deep expertise in emerging technologies. I navigate the exciting realms of artificial intelligence and digital transformation, crafting cutting-edge applications while exploring the limitless possibilities of AI.

### Professional Background
- **Digital Innovation Architect** specializing in AI and emerging technologies
- **MBA Holder** with expertise in leadership and change management
- **Project Manager** with experience in application development
- **Tech Researcher** focused on making complex technologies accessible

### Connect With Me
- **Website**: [ali.ac](https://ali.ac) | [almahdi.cc](https://www.almahdi.cc)
- **GitHub**: [@almahdi](https://github.com/almahdi)
- **Twitter**: [@alialmahdi](https://twitter.com/alialmahdi)
- **LinkedIn**: [Ali Almahdi](https://linkedin.com/in/alialmahdi)
- **YouTube**: [Ali Almahdi](https://youtube.com/alialmahdi)
- **Instagram**: [@_alialmahdi_](https://instagram.com/_alialmahdi_)

As a tech researcher and storyteller, I believe in making complex technologies accessible while keeping it real about the challenges and triumphs of both professional and personal growth. Join me as I explore the fascinating intersection of technology, life experiences, and the future we're building together.

## 🙏 Acknowledgments

- **Monaco Editor Team** - For the incredible VS Code editor engine
- **React Team** - For the amazing React framework
- **Vite Team** - For the lightning-fast build tool
- **Tailwind CSS** - For the utility-first CSS framework
- **Notepad++ Community** - For the inspiration and feature ideas

### Getting Help
1. Check the [Issues](https://github.com/almahdi/notepadxx/issues) page
2. Create a new issue if your problem isn't already reported
3. Contact me through any of the social platforms listed above

## 📞 Support

---

**Made with ❤️ by Ali Almahdi**

*Providing reliable tech since 1999*
