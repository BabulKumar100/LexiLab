// LexiLab - Global Application Context

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Lexer } from '../engine/lexer.js';
import { SAMPLE_PROGRAMS } from '../data/samplePrograms.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Default source code is the prompt's introductory example!
  const [sourceCode, setSourceCode] = useState(
`// LexiLab - Interactive Lexical Analyzer & Tokenization Simulator
int a = 10;
float b = 20.5;

if (a < b) {
    printf("Hello World\\n");
}`
  );

  const [activeToken, setActiveToken] = useState(null);
  const [hoveredTokenId, setHoveredTokenId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [includeComments, setIncludeComments] = useState(false); // Default: false (standard compiler behavior)

  // Instantiated lexer
  const lexer = useMemo(() => new Lexer(), []);

  // Compute live analysis whenever sourceCode or includeComments changes
  const analysis = useMemo(() => {
    return lexer.tokenize(sourceCode, { includeComments });
  }, [sourceCode, includeComments, lexer]);

  // Toast notification helper
  const notify = (message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadSample = (sampleId) => {
    const sample = SAMPLE_PROGRAMS.find(s => s.id === sampleId);
    if (sample) {
      setSourceCode(sample.code);
      notify(`Loaded sample: "${sample.name}"`, 'success');
    }
  };

  const clearSource = () => {
    setSourceCode('');
    notify('Editor cleared', 'info');
  };

  const value = {
    sourceCode,
    setSourceCode,
    analysis,
    activeToken,
    setActiveToken,
    hoveredTokenId,
    setHoveredTokenId,
    notification,
    notify,
    loadSample,
    clearSource,
    includeComments,
    setIncludeComments,
    samplePrograms: SAMPLE_PROGRAMS
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
