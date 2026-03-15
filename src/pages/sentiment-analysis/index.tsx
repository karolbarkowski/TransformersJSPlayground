import { useState, useEffect, useRef } from "preact/hooks";
import { pipeline } from "@huggingface/transformers";
import { Examples } from "../../components/examples/examples";
import "./style.css";
import { Results } from "./_components/results";
import {
  ModelStatus,
  ModelStatusType,
} from "../../components/model-status/model-status";

type Sentiment = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

interface Result {
  label?: Sentiment;
  score: number;
}

const EXAMPLES = [
  "I absolutely love this product!",
  "This is the worst experience ever.",
  "The package arrived on time.",
  "I'm not sure how I feel about this.",
];

export function SentimentAnalysisPage() {
  const [status, setStatus] = useState<ModelStatusType>("loading");
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const classifierRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const _ = await pipeline("sentiment-analysis");
        classifierRef.current = await pipeline("sentiment-analysis");
        setStatus("ready");
      } catch (err) {
        setStatus("error");
      }
    })();
  }, []);

  const analyze = async (text: string) => {
    if (!text.trim() || !classifierRef.current) return;
    setAnalyzing(true);
    try {
      const [res] = await classifierRef.current(text.trim());
      setResult({ label: res.label, score: res.score });
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const onInputChange = (value: string) => {
    setInput(value);
    if (!value.trim()) {
      setResult(null);
      return;
    }
    analyze(value);
  };

  return (
    <div>
      <div class="page-header">
        <h1>Sentiment Analysis - Client</h1>

        <ModelStatus status={status} />
      </div>

      <Examples examples={EXAMPLES} onSelect={onInputChange} />

      <textarea
        class="sa-textarea"
        placeholder="Type or paste any text here to analyze its sentiment…"
        maxLength={500}
        value={input}
        onInput={(e) => onInputChange((e.target as HTMLTextAreaElement).value)}
      />

      <Results
        label={result?.label}
        score={result?.score}
        analyzing={analyzing}
      />
    </div>
  );
}
