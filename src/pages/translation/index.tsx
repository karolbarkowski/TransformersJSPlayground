import { useState, useEffect, useRef } from "preact/hooks";
import { pipeline } from "@huggingface/transformers";
import { Examples } from "../../components/examples/examples";
import {
  ModelStatus,
  ModelStatusType,
} from "../../components/model-status/model-status";
import { Spinner } from "../../components/spinner/spinner";
import "./style.css";

type LangCode = "fr" | "de" | "es" | "it" | "ru" | "zh";

interface LangOption {
  code: LangCode;
  label: string;
  flag: string;
  model: string;
}

const LANGUAGES: LangOption[] = [
  { code: "fr", label: "French", flag: "🇫🇷", model: "Xenova/opus-mt-en-fr" },
  { code: "de", label: "German", flag: "🇩🇪", model: "Xenova/opus-mt-en-de" },
  { code: "es", label: "Spanish", flag: "🇪🇸", model: "Xenova/opus-mt-en-es" },
  { code: "it", label: "Italian", flag: "🇮🇹", model: "Xenova/opus-mt-en-it" },
  { code: "ru", label: "Russian", flag: "🇷🇺", model: "Xenova/opus-mt-en-ru" },
  { code: "zh", label: "Chinese", flag: "🇨🇳", model: "Xenova/opus-mt-en-zh" },
];

const EXAMPLES = [
  "The quick brown fox jumps over the lazy dog.",
  "Artificial intelligence is transforming the world.",
  "What time does the next train leave?",
  "I would like to order a coffee, please.",
];

export function TranslationPage() {
  const [status, setStatus] = useState<ModelStatusType>("loading");
  const [targetLang, setTargetLang] = useState<LangCode>("fr");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const translatorRef = useRef<any>(null);

  const currentLang = LANGUAGES.find((l) => l.code === targetLang)!;

  useEffect(() => {
    translatorRef.current = null;
    setStatus("loading");
    setOutput(null);

    (async () => {
      try {
        translatorRef.current = await pipeline(
          "translation",
          currentLang.model,
        );
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    })();
  }, [targetLang]);

  const translate = async () => {
    if (!input.trim() || !translatorRef.current || translating) return;
    setTranslating(true);
    try {
      const result = await translatorRef.current(input.trim());
      setOutput(result[0].translation_text);
    } catch (err) {
      console.error(err);
    } finally {
      setTranslating(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") translate();
  };

  const handleLangChange = (code: LangCode) => {
    setTargetLang(code);
    setOutput(null);
  };

  return (
    <div class="tr-page">
      <div class="page-header">
        <h1>Translation</h1>
        <ModelStatus status={status} />
      </div>

      <Examples examples={EXAMPLES} onSelect={(v) => setInput(v)} />

      {/* Language pair row */}
      <div class="tr-lang-row">
        <div class="tr-lang-badge tr-lang-source">
          <span class="tr-lang-flag">🇬🇧</span>
          <span class="tr-lang-name">English</span>
        </div>

        <div class="tr-lang-arrow">→</div>

        <div class="tr-lang-select-wrap">
          <select
            class="tr-lang-select"
            value={targetLang}
            onChange={(e) =>
              handleLangChange(
                (e.target as HTMLSelectElement).value as LangCode,
              )
            }
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor row */}
      <div class="tr-editor">
        <div class="tr-panel tr-panel--source">
          <div class="tr-panel-label">Source</div>
          <textarea
            class="tr-textarea"
            placeholder="Enter English text to translate…"
            maxLength={500}
            value={input}
            onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
            onKeyDown={handleKeyDown as any}
          />
        </div>

        <div class="tr-panel tr-panel--output">
          <div class="tr-panel-label">
            {currentLang.flag} {currentLang.label}
          </div>
          <div class="tr-output-box">
            {translating ? (
              <div class="tr-output-loading">
                <Spinner />
                <span>Translating…</span>
              </div>
            ) : output ? (
              <p class="tr-output-text">{output}</p>
            ) : (
              <p class="tr-output-placeholder">Translation will appear here…</p>
            )}
          </div>
        </div>
      </div>

      <button
        class="tr-btn"
        onClick={translate}
        disabled={status !== "ready" || translating || !input.trim()}
      >
        {translating
          ? "Translating…"
          : status === "loading"
            ? "Loading model…"
            : "Translate"}
      </button>
    </div>
  );
}
