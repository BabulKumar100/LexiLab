// LexiLab - Export Full Analysis Report to JSON

export function exportAnalysisToJSON(analysisData, filename = 'lexilab_analysis_report.json') {
  const exportPayload = {
    metadata: {
      tool: 'LexiLab - Interactive Lexical Analyzer & Tokenization Simulator',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      standards: 'ANSI C / ISO C99 Lexical Grammar'
    },
    statistics: analysisData.stats || {},
    tokens: analysisData.tokens || [],
    symbolTable: analysisData.symbolTable || [],
    errors: analysisData.errors || [],
    sourceCode: analysisData.sourceCode || ''
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadSourceCode(sourceCode, filename = 'program.c') {
  const blob = new Blob([sourceCode], { type: 'text/x-c;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
