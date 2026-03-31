interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const suggestions = [
  "ما هي حقوقي في الطلاق؟",
  "شرح قانون العمل الجزائري",
  "كيف أرفع دعوى قضائية؟",
  "ما هي حقوق المستأجر؟",
];

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="space-y-3">
        <div className="text-5xl">⚖️</div>
        <h2 className="text-2xl font-bold text-foreground">القسطاس</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          مساعدك الذكي في القانون الجزائري. اطرح سؤالك وسأساعدك في فهم حقوقك والإجراءات القانونية.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="p-4 rounded-xl border border-border bg-card hover:bg-muted text-sm text-start leading-relaxed transition-colors hover:border-primary/30 shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
