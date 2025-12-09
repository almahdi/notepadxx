import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { openDB } from 'idb';
import { X, Save, Plus, Search, Replace, Info, Download, Upload, Sun, Moon, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePWA, checkForSWUpdates } from './hooks/usePWA';
import { useOfflineReadyToast } from './hooks/useOfflineReadyToast';
import { Toaster } from "@/components/ui/sonner";

const DB_NAME = 'notepadxx';
const DB_VERSION = 2;

// Theme types
type Theme = 'dark' | 'light' | 'system';

// Get effective theme (resolves 'system' to actual dark/light)
function getEffectiveTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

// Get Monaco theme from app theme
function getMonacoTheme(theme: Theme): string {
  const effective = getEffectiveTheme(theme);
  return effective === 'dark' ? 'vs-dark' : 'vs';
}

function App() {
  const [tabs, setTabs] = useState<{ id: number; name: string; content: string; language: string }[]>([]);
  const [activeTabId, setActiveTabId] = useState<number>(0);
  const [fontSize, setFontSize] = useState(14);
  const [editingTabId, setEditingTabId] = useState<number | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success'>('error');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [tabToClose, setTabToClose] = useState<number | null>(null);
  const [theme, setThemeState] = useState<Theme>('system');

  // Initialize PWA functionality
  usePWA();
  checkForSWUpdates();
  useOfflineReadyToast();
  const [restoreData, setRestoreData] = useState<{
    backup: {
      version: string;
      timestamp: number;
      appVersion: string;
      database: {
        name: string;
        version: number;
        stores: {
          files: Array<{ id: number; name: string; content: string; language: string }>;
          settings: Array<{ key: string; value: number | string | boolean; updatedAt: number }>;
        };
      };
    };
  } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  // Alert helper function
  const showAlertMessage = (message: string, type: 'error' | 'success' = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  };

  // Helper function to check if tab has meaningful content
  const hasContent = (tab: { content: string }) => {
    return tab.content.trim().length > 0;
  };

  // Theme setter function
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await saveSetting('theme', newTheme);
    applyTheme(newTheme);
  };

  // Apply theme to DOM
  const applyTheme = (themeValue: Theme) => {
    const root = document.documentElement;
    const effectiveTheme = getEffectiveTheme(themeValue);
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
  };

  const loadTabs = async (): Promise<{ tabs: typeof tabs; activeId: number }> => {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Version 1: Files store
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains('files')) {
            db.createObjectStore('files', { keyPath: 'id' });
          }
        }
        
        // Version 2: Settings store for persistent app state
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }
        }
      },
    });
    const tx = db.transaction('files', 'readonly');
    const store = tx.objectStore('files');
    const all = await store.getAll();
    if (all.length > 0) {
      // Load active tab from settings
      const settingsTx = db.transaction('settings', 'readonly');
      const settingsStore = settingsTx.objectStore('settings');
      const activeTabSetting = await settingsStore.get('activeTabId');
      const activeTabId = activeTabSetting?.value || all[0].id;
      
      return { tabs: all, activeId: activeTabId };
    } else {
      const defaultTab = { id: 1, name: 'Untitled-1', content: 'Welcome to NotepadXX', language: 'plaintext' };
      await db.put('files', defaultTab);
      
      // Save default active tab to settings
      await db.put('settings', { key: 'activeTabId', value: 1, updatedAt: Date.now() });
      
      return { tabs: [defaultTab], activeId: 1 };
    }
  };

  const saveTab = async (tab: { id: number; name: string; content: string; language: string }) => {
    const db = await openDB(DB_NAME, DB_VERSION);
    await db.put('files', tab);
  };

  const deleteTabFromDB = async (id: number) => {
    const db = await openDB(DB_NAME, DB_VERSION);
    await db.delete('files', id);
  };

  const saveSetting = async (key: string, value: number | string | boolean) => {
    const db = await openDB(DB_NAME, DB_VERSION);
    await db.put('settings', { key, value, updatedAt: Date.now() });
  };

  const loadSetting = async (key: string) => {
    const db = await openDB(DB_NAME, DB_VERSION);
    const setting = await db.get('settings', key);
    return setting?.value;
  };

  // Backup and Restore Functions
  const createBackup = async () => {
    try {
      const db = await openDB(DB_NAME, DB_VERSION);
      
      // Export all data from both stores
      const files = await db.getAll('files');
      const settings = await db.getAll('settings');
      
      const backup = {
        backup: {
          version: "1.0",
          timestamp: Date.now(),
          appVersion: "1.0.0",
          database: {
            name: DB_NAME,
            version: DB_VERSION,
            stores: { files, settings }
          }
        }
      };
      
      // Create and download backup file
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `notepadxx-backup-${timestamp}.json`;
      const blob = new Blob([JSON.stringify(backup, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log('Backup created successfully:', filename);
    } catch (error) {
      console.error('Backup failed:', error);
      showAlertMessage('Backup failed. Please try again.', 'error');
    }
  };

  const handleRestoreClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          
          // Validate backup structure
          if (data.backup && data.backup.database && data.backup.database.stores) {
            setRestoreData(data);
            setShowRestoreConfirm(true);
          } else {
            showAlertMessage('Invalid backup file format.', 'error');
          }
        } catch (error) {
          console.error('Failed to parse backup file:', error);
          showAlertMessage('Failed to read backup file. Please check the file format.', 'error');
        }
      }
    };
    input.click();
  };

  const executeRestore = async () => {
    if (!restoreData) {
      showAlertMessage('No data to restore.', 'error');
      return;
    }
    
    try {
      const db = await openDB(DB_NAME, DB_VERSION);
      
      // Clear existing data
      const filesTx = db.transaction('files', 'readwrite');
      const filesStore = filesTx.objectStore('files');
      await filesStore.clear();
      
      const settingsTx = db.transaction('settings', 'readwrite');
      const settingsStore = settingsTx.objectStore('settings');
      await settingsStore.clear();
      
      // Restore data from backup
      const { files, settings } = restoreData.backup.database.stores;
      
      for (const file of files) {
        await db.put('files', file);
      }
      
      for (const setting of settings) {
        await db.put('settings', setting);
      }
      
      // Reload the app state
      const { tabs: loadedTabs, activeId } = await loadTabs();
      setTabs(loadedTabs);
      setActiveTabId(activeId);
      
      // Load saved font size
      const savedFontSize = await loadSetting('fontSize');
      if (savedFontSize) {
        setFontSize(savedFontSize);
      }
      
       setShowRestoreConfirm(false);
       setRestoreData(null);
       
       showAlertMessage('Restore completed successfully!', 'success');
    } catch (error) {
      console.error('Restore failed:', error);
      showAlertMessage('Restore failed. Please try again.', 'error');
    }
  };

  useEffect(() => {
    const init = async () => {
      const { tabs: loadedTabs, activeId } = await loadTabs();
      setTabs(loadedTabs);
      setActiveTabId(activeId);
      
      // Load saved font size
      const savedFontSize = await loadSetting('fontSize');
      if (savedFontSize) {
        setFontSize(savedFontSize);
      }

      // Load saved theme
      const savedTheme = (await loadSetting('theme')) as Theme | undefined;
      const themeValue = savedTheme || 'system';
      setThemeState(themeValue);
      applyTheme(themeValue);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTab = async () => {
    const newId = Date.now();
    const newName = `Untitled-${tabs.length + 1}`;
    const newTab = { id: newId, name: newName, content: '', language: 'plaintext' };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    await saveTab(newTab);
  };

  const closeTab = async (id: number) => {
    const tab = tabs.find(t => t.id === id);
    
    // Check for content confirmation
    if (tab && hasContent(tab)) {
      setTabToClose(id);
      setShowCloseConfirm(true);
      return;
    }
    
    // If this is the last tab, create a new one after closing
    const isLastTab = tabs.length === 1;
    
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    await deleteTabFromDB(id);
    
    if (isLastTab) {
      // Create new empty tab immediately
      const newId = Date.now();
      const newTab = { id: newId, name: 'Untitled-1', content: '', language: 'plaintext' };
      setTabs([newTab]);
      setActiveTabId(newId);
      await saveTab(newTab);
      await saveSetting('activeTabId', newId);
    } else if (activeTabId === id && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
      await saveSetting('activeTabId', newTabs[0].id);
    }
  };

  const switchTab = async (id: number) => {
    setActiveTabId(id);
    await saveSetting('activeTabId', id);
  };

  const updateContent = async (value: string | undefined) => {
    if (activeTabId === 0) return;
    const updatedTabs = tabs.map(t => t.id === activeTabId ? { ...t, content: value || '' } : t);
    setTabs(updatedTabs);
    const updatedTab = updatedTabs.find(t => t.id === activeTabId);
    if (updatedTab) await saveTab(updatedTab);
  };

  const updateLanguage = async (lang: string) => {
    if (activeTabId === 0) return;
    const updatedTabs = tabs.map(t => t.id === activeTabId ? { ...t, language: lang } : t);
    setTabs(updatedTabs);
    const updatedTab = updatedTabs.find(t => t.id === activeTabId);
    if (updatedTab) await saveTab(updatedTab);
  };

  const updateTabName = async (id: number, name: string) => {
    const updatedTabs = tabs.map(t => t.id === id ? { ...t, name } : t);
    setTabs(updatedTabs);
    const updatedTab = updatedTabs.find(t => t.id === id);
    if (updatedTab) await saveTab(updatedTab);
  };

  const handleFind = () => {
    if (editorRef.current) {
      editorRef.current.getAction('actions.find').run();
    }
  };

  const handleReplace = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.startFindReplaceAction').run();
    }
  };

  const handleCloseCurrent = () => closeTab(activeTabId);

  const executeCloseTab = async () => {
    if (tabToClose === null) return;
    
    const isLastTab = tabs.length === 1;
    
    const newTabs = tabs.filter(t => t.id !== tabToClose);
    setTabs(newTabs);
    await deleteTabFromDB(tabToClose);
    
    if (isLastTab) {
      // Create new empty tab
      const newId = Date.now();
      const newTab = { id: newId, name: 'Untitled-1', content: '', language: 'plaintext' };
      setTabs([newTab]);
      setActiveTabId(newId);
      await saveTab(newTab);
      await saveSetting('activeTabId', newId);
    } else if (activeTabId === tabToClose && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
      await saveSetting('activeTabId', newTabs[0].id);
    }
    
    setShowCloseConfirm(false);
    setTabToClose(null);
  };

  const getExtension = (lang: string) => {
    const map: Record<string, string> = {
      plaintext: 'txt',
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      html: 'html',
      css: 'css',
      json: 'json',
      xml: 'xml',
      markdown: 'md',
      sql: 'sql',
      shell: 'sh',
      yaml: 'yml',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
    };
    return map[lang] || 'txt';
  };

  const downloadFile = () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab) return;
    const extension = getExtension(tab.language);
    const filename = `${tab.name}.${extension}`;
    const blob = new Blob([tab.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  // ModeToggle component
  const ModeToggle = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* PWA Toaster */}
      <Toaster position="top-right" />
      
      {/* Menubar */}
      <div className="bg-muted p-2 flex justify-between items-center border-b">
        <div className="flex space-x-4">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={addTab}><Plus size={16} className="mr-1" />New</Button>
            <Button variant="outline" size="sm" onClick={downloadFile}><Save size={16} className="mr-1" />Save</Button>
            <Button variant="outline" size="sm" onClick={handleCloseCurrent}><X size={16} className="mr-1" />Close</Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleFind}><Search size={16} className="mr-1" />Find</Button>
            <Button variant="outline" size="sm" onClick={handleReplace}><Replace size={16} className="mr-1" />Replace</Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={createBackup}><Download size={16} className="mr-1" />Backup</Button>
            <Button variant="outline" size="sm" onClick={handleRestoreClick}><Upload size={16} className="mr-1" />Restore</Button>
          </div>
         </div>
         <div className="flex space-x-2 items-center">
           <Select value={activeTab?.language || 'plaintext'} onValueChange={updateLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plaintext">Plain Text</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="sql">SQL</SelectItem>
              <SelectItem value="shell">Shell</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="c">C</SelectItem>
              <SelectItem value="php">PHP</SelectItem>
              <SelectItem value="ruby">Ruby</SelectItem>
              <SelectItem value="go">Go</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fontSize.toString()} onValueChange={async (value) => {
            const newSize = Number(value);
            setFontSize(newSize);
            await saveSetting('fontSize', newSize);
          }}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12px</SelectItem>
              <SelectItem value="14">14px</SelectItem>
              <SelectItem value="16">16px</SelectItem>
              <SelectItem value="18">18px</SelectItem>
              <SelectItem value="20">20px</SelectItem>
              <SelectItem value="24">24px</SelectItem>
            </SelectContent>
          </Select>
          <ModeToggle />
          <Button variant="outline" size="sm" onClick={() => setShowAbout(true)}><Info size={16} className="mr-1" />About</Button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-muted p-2 flex space-x-1 border-b">
        {tabs.map(tab => (
          <div key={tab.id} className={`flex items-center space-x-2 px-3 py-1 rounded-t cursor-pointer ${activeTabId === tab.id ? 'bg-background border border-b-0' : 'bg-secondary hover:bg-secondary/80'}`} onClick={() => switchTab(tab.id)}>
            {editingTabId === tab.id ? (
              <Input
                value={tab.name}
                onChange={(e) => updateTabName(tab.id, e.target.value)}
                onBlur={() => setEditingTabId(null)}
                onKeyDown={(e) => { if (e.key === 'Enter') setEditingTabId(null); }}
                className="bg-transparent border-none outline-none shadow-none p-0 h-auto"
                autoFocus
              />
            ) : (
              <span onDoubleClick={() => setEditingTabId(tab.id)}>{tab.name}</span>
            )}
            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-muted-foreground/20" onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}>
              <X size={12} />
            </Button>
          </div>
        ))}
        <Button variant="secondary" size="sm" className="px-3 py-1 rounded-t" onClick={addTab}>+</Button>
      </div>

       {/* Editor Area */}
       <div className="flex-1">
         <Editor
           height="100%"
           language={activeTab?.language}
           value={activeTab?.content}
           onChange={updateContent}
           theme={getMonacoTheme(theme)}
           options={{ fontSize }}
           onMount={(editor) => { editorRef.current = editor; }}
         />
       </div>

      {/* About Modal */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About NotepadXX</DialogTitle>
            <DialogDescription>
              Learn more about this application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p>A web-based Notepad++ clone with syntax highlighting, tabs, search/replace, and IndexedDB storage for offline use.</p>
            <p>Built with React, TypeScript, Tailwind CSS, and Monaco Editor.</p>
            <p>Created by Ali Almahdi, Digital Innovation Architect & AI Enthusiast.</p>
            <p>Visit <a href="https://ali.ac" target="_blank" rel="noopener noreferrer" className="text-primary underline">ali.ac</a> for more info.</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowAbout(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Modal */}
      <Dialog open={showRestoreConfirm} onOpenChange={(open) => {
        if (!open) {
          setShowRestoreConfirm(false);
          setRestoreData(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Restore</DialogTitle>
            <DialogDescription>
              This action will replace all current data with the backup and cannot be undone
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p>This will replace all current data with the backup. This action cannot be undone.</p>
            <p>Are you sure you want to continue?</p>
          </div>
          <div className="flex space-x-4 justify-end">
            <Button variant="destructive" onClick={executeRestore}>
              Yes, Restore
            </Button>
            <Button variant="outline" onClick={() => {
              setShowRestoreConfirm(false);
              setRestoreData(null);
            }}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={showAlert} onOpenChange={setShowAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {alertType === 'error' ? (
                <>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Error
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Success
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className={alertType === 'error' ? 'text-destructive' : 'text-green-600'}>
              {alertMessage}
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowAlert(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <Dialog open={showCloseConfirm} onOpenChange={(open) => {
        if (!open) {
          setShowCloseConfirm(false);
          setTabToClose(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Tab</DialogTitle>
            <DialogDescription>
              This tab contains content. Are you sure you want to close it?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p>This tab contains content. Are you sure you want to close it?</p>
          </div>
          <div className="flex space-x-4 justify-end">
            <Button variant="destructive" onClick={executeCloseTab}>
              Close
            </Button>
            <Button variant="outline" onClick={() => {
              setShowCloseConfirm(false);
              setTabToClose(null);
            }}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
