import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { EditorToolbar } from './EditorToolbar';
import { TOKEN_METADATA } from '../../engine/tokenTypes';
import { Braces, Code2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function CodeEditor({ className }) {
  const {
    sourceCode,
    setSourceCode,
    analysis,
    setActiveToken,
    hoveredTokenId,
    setHoveredTokenId
  } = useApp();

  const [viewMode, setViewMode] = useState('editor');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);

  const lines = sourceCode.split('\n');

  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setSourceCode(sourceCode.substring(0, start) + '    ' + sourceCode.substring(end));

    // Value is state-driven, so the caret has to be restored after the re-render.
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 4;
    }, 0);
  };

  const handleCursorMove = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const before = sourceCode.substring(0, textarea.selectionStart).split('\n');
    setCursorPos({ line: before.length, col: before[before.length - 1].length + 1 });
  };

  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className={cn('panel bevel-top flex flex-col overflow-hidden', className)}>
      <EditorToolbar viewMode={viewMode} setViewMode={setViewMode} />

      <div className="relative flex flex-1 overflow-hidden font-mono text-[13px]">
        <div
          ref={gutterRef}
          aria-hidden
          className="w-11 shrink-0 overflow-hidden border-r border-ink-700/60 bg-ink-900/70 py-3 text-right text-xs leading-6 text-slate-600 select-none"
        >
          {lines.map((_, i) => (
            <div
              key={i}
              className={cn(
                'pr-2.5 transition-colors',
                cursorPos.line === i + 1 && 'font-bold text-cyan-400'
              )}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="scroll-slim relative flex-1 overflow-auto">
          {viewMode === 'editor' ? (
            <textarea
              ref={textareaRef}
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={handleCursorMove}
              onClick={handleCursorMove}
              onScroll={handleScroll}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              placeholder="// Write or paste C code here..."
              className="scroll-slim h-full w-full resize-none bg-transparent p-3 leading-6 whitespace-pre text-slate-100 outline-none placeholder:text-slate-600 selection:bg-blue-500/30 selection:text-cyan-300"
            />
          ) : analysis.tokens.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <Braces className="h-6 w-6 text-slate-600" />
              <p className="text-xs text-slate-500">
                No tokens yet — switch to <span className="text-cyan-300">Code</span> and write a program.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5 p-3">
              {analysis.tokens.map((token) => {
                const meta = TOKEN_METADATA[token.type] || {};
                const isHovered = hoveredTokenId === token.id;
                return (
                  <button
                    key={token.id}
                    onClick={() => setActiveToken(token)}
                    onMouseEnter={() => setHoveredTokenId(token.id)}
                    onMouseLeave={() => setHoveredTokenId(null)}
                    title={`#${token.id} ${token.type} · Ln ${token.line}, Col ${token.column}`}
                    className={cn(
                      'rounded-lg border px-1.5 py-0.5 font-mono text-xs transition-all duration-150',
                      meta.badgeClass,
                      isHovered && 'scale-105 ring-2 ring-cyan-400/70'
                    )}
                  >
                    {token.lexeme}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex h-7 shrink-0 items-center justify-between border-t border-ink-700/60 bg-ink-900/70 px-3 font-mono text-2xs text-slate-500 select-none">
        <div className="flex items-center gap-3.5">
          <span className="text-slate-400">
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span>{lines.length} lines</span>
          <span className="hidden sm:inline">{sourceCode.length} chars</span>
        </div>
        <div className="flex items-center gap-3">
          <span>C99 subset</span>
          <span className="flex items-center gap-1 text-cyan-400">
            <Code2 className="h-3 w-3" />
            scanner active
          </span>
        </div>
      </div>
    </div>
  );
}
