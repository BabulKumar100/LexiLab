import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FileCode2, Play } from 'lucide-react';
import { Card, CardBody, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';

export function SampleProgramsPage() {
  const { samplePrograms, loadSample } = useApp();
  const navigate = useNavigate();

  const handleLoadAndOpen = (sampleId) => {
    loadSample(sampleId);
    navigate('/');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        className="mb-0"
        icon={FileCode2}
        kicker="Curated fixtures"
        title="Predefined Sample Programs"
        description="Curated C programs demonstrating core compiler concepts, maximal munch edge-cases, data structures, and intentional lexical errors."
      />

      <div className="stagger grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {samplePrograms.map((sample) => (
          <Card key={sample.id} hover className="group flex h-full flex-col">
            {/* File chrome: reads like a source file card. */}
            <div className="flex items-center gap-2 border-b border-ink-700/60 bg-ink-900/40 px-4 py-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                <FileCode2 className="h-3.5 w-3.5" />
              </span>
              <span className="truncate font-mono text-2xs uppercase tracking-[0.14em] text-slate-400">
                {sample.id}
              </span>
              <Badge tone="cyan" size="xs" dot className="ml-auto shrink-0">
                {sample.category}
              </Badge>
            </div>

            <CardBody className="flex flex-1 flex-col gap-3">
              <h3 className="text-balance text-sm font-bold leading-snug tracking-tight text-slate-100 transition-colors duration-200 group-hover:text-cyan-200">
                {sample.name}
              </h3>
              <p className="text-xs leading-relaxed text-slate-400">{sample.description}</p>

              {/* Monospace preview of the opening line. */}
              <div className="mt-auto rounded-xl border border-ink-700/70 bg-ink-950/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-2xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    First line
                  </span>
                  <span className="font-mono text-2xs tabular-nums text-slate-500">
                    {sample.code.split('\n').length} lines
                  </span>
                </div>
                <pre className="no-scrollbar mt-2 overflow-x-auto whitespace-pre font-mono text-xs leading-5 text-cyan-100/90 select-all">
                  {sample.code.split('\n')[0]}
                </pre>
              </div>
            </CardBody>

            <CardFooter className="flex items-center justify-between gap-3">
              <span className="text-2xs text-slate-500">Opens in Workbench</span>
              <Button
                variant="primary"
                size="sm"
                icon={Play}
                onClick={() => handleLoadAndOpen(sample.id)}
              >
                Load into Workbench
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
