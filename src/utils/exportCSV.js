// LexiLab - Export Tokens to CSV

export function exportTokensToCSV(tokens, filename = 'lexilab_tokens.csv') {
  if (!tokens || tokens.length === 0) return;

  const headers = ['Token_ID', 'Lexeme', 'Token_Type', 'Line', 'Column', 'Details'];
  
  const rows = tokens.map(t => {
    // Escape quotes in lexeme
    const escapedLexeme = `"${(t.lexeme || '').replace(/"/g, '""')}"`;
    const details = t.opName || t.sepName || (t.isError ? t.errorDetails?.message : '') || '';
    const escapedDetails = `"${details.replace(/"/g, '""')}"`;
    
    return [
      t.id,
      escapedLexeme,
      t.type,
      t.line,
      t.column,
      escapedDetails
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
