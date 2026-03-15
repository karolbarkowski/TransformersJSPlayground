import { Spinner } from "../spinner/spinner";
import "./style.css";

export type ModelStatusType = "loading" | "ready" | "error";

interface ModelStatusBarProps {
  status: ModelStatusType;
}

export function ModelStatus({ status }: ModelStatusBarProps) {
  const statusText = {
    loading: "Loading model...",
    ready: "Model is ready",
    error: "Error loading model.",
  }[status];

  return (
    <div class="sa-status-bar">
      {status === "loading" && <Spinner />}
      {status !== "loading" && (
        <span class={`sa-status-dot sa-status-dot--${status}`} />
      )}

      <span class="sa-status-text">{statusText}</span>
    </div>
  );
}
