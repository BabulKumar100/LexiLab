import React, { useState } from 'react';
import { DFA_MODELS } from '../data/dfaDefinitions';
import { DFAGraph } from '../components/dfa/DFAGraph';
import { DFAStepper } from '../components/dfa/DFAStepper';
import { Card, CardBody, CardFooter, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageHeader, Tabs } from '../components/ui/PageHeader';
import { Callout, InfoRow, Table, Td } from '../components/ui/StatTile';
import { Workflow, Waypoints, FunctionSquare, BookOpen } from 'lucide-react';

const MODEL_TAB_LABELS = {
  identifier: 'Identifier',
  number: 'Int / Float',
  string: 'String',
  char_literal: 'Char',
  relational: 'Relational',
};

const MODEL_TONES = {
  identifier: 'cyan',
  number: 'blue',
  string: 'emerald',
  char_literal: 'purple',
  relational: 'amber',
};

const LEGEND = [
  { kind: 'standard', label: 'Standard state (Q)' },
  { kind: 'accept', label: 'Accepting (F)' },
  { kind: 'active', label: 'Current state' },
  { kind: 'trap', label: 'Dead / trap' },
];

function LegendSwatch({ kind }) {
  const stroke =
    kind === 'accept' ? '#10B981' : kind === 'active' ? '#22D3EE' : kind === 'trap' ? '#F43F5E' : '#3B82F6';
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      {kind === 'active' && <circle cx="12" cy="12" r="11" fill="#22D3EE" opacity="0.18" />}
      <circle
        cx="12"
        cy="12"
        r="8.4"
        fill="#0B1322"
        stroke={stroke}
        strokeWidth="2"
        strokeDasharray={kind === 'trap' ? '3 2.4' : undefined}
      />
      {kind === 'accept' && <circle cx="12" cy="12" r="5.3" fill="none" stroke={stroke} strokeWidth="1.6" />}
    </svg>
  );
}

const braceList = (items) => `{ ${items.join(', ')} }`;

export function DFAVisualizer() {
  const [selectedModelId, setSelectedModelId] = useState('identifier');
  const [testInput, setTestInput] = useState('count_1');
  const [activeStep, setActiveStep] = useState(0);

  const model = DFA_MODELS.find(m => m.id === selectedModelId) || DFA_MODELS[0];
  const simulation = model.simulate(testInput);
  const currentStateId = simulation.trace[activeStep]?.state || model.startState;

  const handleSelectModel = (id) => {
    setSelectedModelId(id);
    setActiveStep(0);
    // Assign sensible default test input for that model
    if (id === 'identifier') setTestInput('total_sum_2026');
    if (id === 'number') setTestInput('3.1415e2');
    if (id === 'string') setTestInput('"LexiLab"');
    if (id === 'char_literal') setTestInput("'\\n'");
    if (id === 'relational') setTestInput('<=');
  };

  const tone = MODEL_TONES[model.id] || 'cyan';

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Workflow}
        kicker="Automata Lab"
        title="Deterministic Finite Automata Visualizer"
        description="Interactive state-machine execution: watch how each lexical pattern is recognised one character at a time, with the transition function written out in full."
        actions={
          <>
            <Badge tone="slate" mono size="xs">
              States {model.nodes.length}
            </Badge>
            <Badge tone="slate" mono size="xs">
              Transitions {model.edges.length}
            </Badge>
            <Badge tone={tone} dot mono size="sm">
              Now in {currentStateId}
            </Badge>
          </>
        }
      />

      {/* Model switcher */}
      <Card className="animate-fade-up" bevel={false}>
        <CardBody className="py-3">
          <Tabs
            tabs={DFA_MODELS.map((m) => ({
              id: m.id,
              label: MODEL_TAB_LABELS[m.id] || m.name,
              count: m.nodes.length,
            }))}
            active={selectedModelId}
            onChange={handleSelectModel}
          />
        </CardBody>
      </Card>

      {/* Diagram (left) + live runner (right) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <Card className="animate-fade-up">
            <CardHeader
              icon={Waypoints}
              title={`${model.name} Diagram`}
              subtitle={model.description}
              actions={
                <>
                  <Badge tone="slate" mono size="xs">
                    |Q| {model.nodes.length}
                  </Badge>
                  <Badge tone="slate" mono size="xs">
                    |δ| {model.edges.length}
                  </Badge>
                </>
              }
            />
            <CardBody>
              <DFAGraph model={model} activeStateId={currentStateId} />
            </CardBody>
            <CardFooter className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {LEGEND.map((item) => (
                  <span key={item.kind} className="inline-flex items-center gap-1.5 text-2xs text-slate-400">
                    <LegendSwatch kind={item.kind} />
                    <span>{item.label}</span>
                  </span>
                ))}
              </div>
              <Badge tone={tone} mono size="xs" className="shrink-0">
                Σ = {model.alphabet}
              </Badge>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <DFAStepper
            model={model}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            testInput={testInput}
            setTestInput={setTestInput}
          />
        </div>
      </div>

      {/* Formal definition + transition table */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="animate-fade-up lg:col-span-5">
          <CardHeader icon={FunctionSquare} title="Formal 5-Tuple" subtitle="M = (Q, Σ, δ, q0, F)" />
          <CardBody className="space-y-0.5">
            <Callout tone="info" title="This machine, instantiated">
              <p className="break-words font-mono text-[11.5px] leading-relaxed">
                M = ({braceList(model.nodes.map((n) => n.id))}, {model.alphabet}, δ, {model.startState},
                {' '}
                {braceList(model.acceptStates)})
              </p>
            </Callout>
            <InfoRow label="Q — finite states" tone="cyan">
              <span className="font-mono">{braceList(model.nodes.map((n) => n.id))}</span>
            </InfoRow>
            <InfoRow label="Σ — alphabet" tone="emerald">
              <span className="font-mono">{model.alphabet}</span>
            </InfoRow>
            <InfoRow label="δ — transition fn">
              <span className="font-mono">{model.edges.length} explicit rules</span>
            </InfoRow>
            <InfoRow label="q₀ — start state">
              <span className="font-mono">{model.startState}</span>
            </InfoRow>
            <InfoRow label="F — accept states" tone="emerald">
              <span className="font-mono">{braceList(model.acceptStates)}</span>
            </InfoRow>
          </CardBody>
          <CardFooter>
            δ : Q × Σ → Q. Every (state, symbol) pair has at most one move — that uniqueness is what makes the
            automaton <span className="font-semibold text-slate-300">deterministic</span>.
          </CardFooter>
        </Card>

        <Card className="animate-fade-up lg:col-span-7" bevel={false}>
          <CardHeader
            icon={BookOpen}
            title="Transition Function δ"
            subtitle="Read each row as: from state, on symbol, go to state."
            dense
          />
          <CardBody className="p-0">
            <div className="max-h-[292px]">
              <Table
                head={[
                  { label: '#', className: 'w-10' },
                  { label: 'From' },
                  { label: 'On symbol' },
                  { label: 'To' },
                  { label: 'Role' },
                  { label: 'Meaning', className: 'hidden md:table-cell' },
                ]}
              >
                {model.edges.map((e, i) => {
                  const to = model.nodes.find((n) => n.id === e.to);
                  const role = to?.isAccept ? 'accept' : to?.isTrap ? 'trap' : 'transit';
                  const roleTone = role === 'accept' ? 'emerald' : role === 'trap' ? 'rose' : 'slate';
                  return (
                    <tr key={`${e.from}-${e.to}-${i}`} className="row-hover">
                      <Td mono className="w-10 text-2xs text-slate-600">
                        {i + 1}
                      </Td>
                      <Td mono className="text-cyan-200">
                        {e.from}
                      </Td>
                      <Td mono className="text-emerald-200">
                        {e.label}
                      </Td>
                      <Td mono className={role === 'trap' ? 'text-rose-200' : role === 'accept' ? 'text-emerald-200' : 'text-slate-200'}>
                        {e.to}
                      </Td>
                      <Td>
                        <Badge tone={roleTone} size="xs" mono>
                          {role}
                        </Badge>
                      </Td>
                      <Td className="hidden text-slate-400 md:table-cell">{e.desc || '—'}</Td>
                    </tr>
                  );
                })}
              </Table>
            </div>
          </CardBody>
          <CardFooter className="text-2xs">
            δ is partial by convention: any symbol not listed here throws the machine into its dead state, and the
            string is rejected at that point.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
