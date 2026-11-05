import React from 'react';
import { useApp } from '../../context/AppContext';
import { Copy, Trash2, Download, FileCode2, Layers, Braces } from 'lucide-react';
import { downloadSourceCode } from '../../utils/exportJSON';
import { copyText } from '../../utils/clipboard';
import { IconButton } from '../ui/Button';
import { cn } from '../../utils/cn';

export function EditorToolbar({ viewMode, setViewMode }) {
  const { sourceCode, clearSource, notify } = useApp();

  const handleCopy = async () => {
    if (!sourceCode) return;
    const ok = await copyText(sourceCode);
    notify(
      ok ? 'Source code copied to clipboard' : 'Clipboard blocked by the browser — select the code and copy manually',
      ok ? 'success' : 'warn'
    );
  };

  const handleDownload = () => {
    if (!sourceCode) return;
    downloadSourceCode(sourceCode, 'source_program.c');
    notify('Downloaded source_program.c', 'success');
  };

  const modes = [
    { id: 'editor', label: 'Code', icon: Braces },
    { id: 'tokens-stream', label: 'Token Overlay', icon: Layers },
  ];

  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-ink-700/60 bg-ink-900/70 px-3 select-none">
      <div className="flex min-w-0 items-center gap-2">
        <FileCode2 className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
        <span className="truncate text-xs font-bold tracking-tight text-slate-200">Source Editor</span>
        <span className="hidden rounded border border-cyan-500/20 bg-cyan-500/[0.08] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-cyan-300 sm:inline">
          C99 SUBSET
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex rounded-xl border border-ink-700/70 bg-ink-950/60 p-0.5">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setViewMode(m.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-[10px] px-2.5 py-1 text-2xs font-semibold transition-all duration-200',
                viewMode === m.id
                  ? 'bg-grad-brand text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <m.icon className="h-3 w-3" />
              <span className="hidden md:inline">{m.label}</span>
            </button>
          ))}
        </div>

        <IconButton icon={Copy} label="Copy source code" onClick={handleCopy} />
        <IconButton icon={Download} label="Download as .c file" onClick={handleDownload} />
        <IconButton
          icon={Trash2}
          label="Clear editor"
          onClick={clearSource}
          className="hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
        />
      </div>
    </div>
  );
}
