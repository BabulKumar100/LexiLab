import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { GraduationCap, CheckCircle2, XCircle, RotateCcw, ArrowRight, ArrowLeft, Award, Percent, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, MeterBar } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { Callout, StatTile } from '../components/ui/StatTile';
import { cn } from '../utils/cn';

export function QuizPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionIdx }
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIdx];
  const totalQ = QUIZ_QUESTIONS.length;
  const selectedOption = selectedAnswers[currentQ.id];
  const hasAnswered = selectedOption !== undefined;

  const handleSelectOption = (idx) => {
    if (hasAnswered) return; // Prevent changing after answer
    const newAnswers = { ...selectedAnswers, [currentQ.id]: idx };
    setSelectedAnswers(newAnswers);

    // If last question answered, trigger confetti
    if (Object.keys(newAnswers).length === totalQ) {
      setTimeout(() => {
        setIsCompleted(true);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
    }
  };

  const handleNext = () => {
    if (currentIdx < totalQ - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setIsCompleted(false);
  };

  // Calculate score
  let correctCount = 0;
  QUIZ_QUESTIONS.forEach(q => {
    if (selectedAnswers[q.id] === q.correctIndex) {
      correctCount++;
    }
  });

  const scorePct = Math.round((correctCount / totalQ) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-12">
      <PageHeader
        className="mb-0"
        icon={GraduationCap}
        kicker="Assessment mode"
        title="Tokenization & Compiler Design Quiz"
        description="Test your knowledge on Lexical Analysis, DFAs, Maximal Munch, Regular Expressions, and Symbol Tables."
        actions={
          <Badge tone="cyan" size="md" mono>
            Score: {correctCount} / {totalQ}
          </Badge>
        }
      />

      {isCompleted ? (
        /* Completion Screen */
        <Card className="animate-pop-in">
          <CardBody className="flex flex-col items-center gap-6 py-8 text-center">
            <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/25 shadow-glow">
              <span aria-hidden className="absolute inset-0 rounded-2xl bg-grad-brand opacity-[0.16]" />
              <Award className="relative h-8 w-8 text-cyan-200" />
            </span>

            <div className="max-w-xl space-y-2">
              <h2 className="text-balance text-2xl font-black tracking-tight text-white">
                Quiz Completed!
              </h2>
              <p className="text-balance text-sm leading-relaxed text-slate-400">
                {scorePct >= 80 
                  ? "Outstanding! You have mastered Lexical Analysis & Automata concepts!" 
                  : scorePct >= 60 
                  ? "Good job! A quick review of the Theory guide will get you full marks in Viva!" 
                  : "Keep practicing! Check out the Theory & Viva Guide to master these concepts."}
              </p>
            </div>

            <div className="grid w-full max-w-sm grid-cols-2 gap-3">
              <StatTile
                label="Correct Answers"
                value={correctCount}
                unit={`of ${totalQ}`}
                icon={CheckCircle2}
                tone="emerald"
              />
              <StatTile label="Percentage" value={scorePct} unit="%" icon={Percent} tone="cyan" />
            </div>

            <Button variant="primary" size="md" icon={RotateCcw} onClick={handleRestart}>
              Retake Quiz
            </Button>
          </CardBody>
        </Card>
      ) : (
        /* Question Card */
        <Card className="animate-fade-up">
          <CardBody className="space-y-5">
            {/* Progress meter and question counter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-2xs uppercase tracking-[0.14em] tabular-nums text-slate-400">
                  <span className="text-cyan-300">Question {currentIdx + 1}</span> of {totalQ}
                </span>
                <span className="font-mono text-2xs font-semibold tabular-nums text-cyan-300">
                  {Math.round(((currentIdx + 1) / totalQ) * 100)}% complete
                </span>
              </div>
              <MeterBar value={currentIdx + 1} max={totalQ} tone="cyan" className="h-2" />
            </div>

            {/* Question Text */}
            <h2 className="text-balance text-base font-bold leading-relaxed tracking-tight text-white sm:text-lg">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrect = currentQ.correctIndex === optIdx;
                const showResult = hasAnswered;

                let style =
                  'border-ink-700 bg-ink-900/60 text-slate-300 hover:border-cyan-500/40 hover:bg-ink-800 hover:text-slate-100';

                if (showResult) {
                  if (isCorrect) {
                    style = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-500/40';
                  } else if (isSelected) {
                    style = 'border-rose-500/60 bg-rose-500/10 text-rose-200 ring-1 ring-rose-500/40';
                  } else {
                    style = 'border-ink-700/60 bg-ink-900/30 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={hasAnswered}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed',
                      style
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-ink-650/70 bg-ink-950/60 font-mono text-2xs font-bold">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </span>

                    {showResult && isCorrect && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Box */}
            {hasAnswered && (
              <Callout
                tone="info"
                icon={Lightbulb}
                title="Compiler Concept Explanation"
                className="animate-fade-up"
              >
                <p className="leading-relaxed">{currentQ.explanation}</p>
              </Callout>
            )}

            {/* Next / Previous Controls */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <Button
                variant="secondary"
                size="sm"
                icon={ArrowLeft}
                onClick={handlePrev}
                disabled={currentIdx === 0}
              >
                Previous
              </Button>

              <Button variant="primary" size="sm" onClick={handleNext} disabled={!hasAnswered}>
                <span>{currentIdx === totalQ - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
