import "./style.css";

interface ResultsProps {
  analyzing: boolean;
  label?: string;
  score?: number;
}

export function Results({ analyzing, label, score }: ResultsProps) {
  return (
    <div class={`result result--${label?.toLowerCase()}`}>
      <div>Label</div>
      <div>
        {label && <div class="result-label">{label}</div>}
        {analyzing && <span class="spinner spinner--small" />}
      </div>
      <div>Confidence</div>
      {score && (
        <div>
          <span>{(score * 100).toFixed(2)}%</span>
        </div>
      )}
    </div>
  );
}
