import React from 'react';
// HashRouter keeps deep links (/#/tokens) working on static hosts such as GitHub
// Pages, where the server cannot rewrite unknown paths back to index.html.
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { TokenAnalysis } from './pages/TokenAnalysis';
import { SymbolTable } from './pages/SymbolTable';
import { DFAVisualizer } from './pages/DFAVisualizer';
import { StepTrace } from './pages/StepTrace';
import { MaximalMunchDemo } from './pages/MaximalMunchDemo';
import { LookaheadView } from './pages/LookaheadView';
import { TestPlayground } from './pages/TestPlayground';
import { RegexExplorer } from './pages/RegexExplorer';
import { ErrorDiagnostics } from './pages/ErrorDiagnostics';
import { Statistics } from './pages/Statistics';
import { SampleProgramsPage } from './pages/SampleProgramsPage';
import { TheoryLearn } from './pages/TheoryLearn';
import { QuizPage } from './pages/QuizPage';
import { Documentation } from './pages/Documentation';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tokens" element={<TokenAnalysis />} />
            <Route path="symbols" element={<SymbolTable />} />
            <Route path="dfa" element={<DFAVisualizer />} />
            <Route path="step-trace" element={<StepTrace />} />
            <Route path="maximal-munch" element={<MaximalMunchDemo />} />
            <Route path="lookahead" element={<LookaheadView />} />
            <Route path="playground" element={<TestPlayground />} />
            <Route path="regex" element={<RegexExplorer />} />
            <Route path="errors" element={<ErrorDiagnostics />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="examples" element={<SampleProgramsPage />} />
            <Route path="learn" element={<TheoryLearn />} />
            <Route path="quiz" element={<QuizPage />} />
            <Route path="documentation" element={<Documentation />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
