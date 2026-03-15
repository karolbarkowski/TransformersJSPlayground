import "./style.css";

interface ExamplesProps {
  examples: string[];
  onSelect: (example: string) => void;
}

export function Examples({ examples, onSelect }: ExamplesProps) {
  return (
    <>
      <p class="sa-examples-label">Try an example</p>
      <div class="sa-examples">
        {examples.map((ex) => (
          <span key={ex} class="sa-chip" onClick={() => onSelect(ex)}>
            {ex}
          </span>
        ))}
      </div>
    </>
  );
}
