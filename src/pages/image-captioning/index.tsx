import { useEffect, useRef, useState } from "preact/hooks";
import "./style.css";
import {
  ModelStatus,
  ModelStatusType,
} from "../../components/model-status/model-status";
import { pipeline } from "@huggingface/transformers";
import { Spinner } from "../../components/spinner/spinner";

const MODEL_ID = "Xenova/vit-gpt2-image-captioning";

export function ImageCaptioningPage() {
  const [status, setStatus] = useState<ModelStatusType>("loading");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const captionerRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        captionerRef.current = await pipeline("image-to-text", MODEL_ID, {
          device: "wasm",
        });
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    })();
  }, []);

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setSourceImage(url);
    setCaption(null);
    setProcessing(true);

    try {
      const output = (await captionerRef.current(url)) as Array<{
        generated_text: string;
      }>;
      setCaption(output[0].generated_text);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const onFileDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  const onFileInputChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div class="page-header">
        <h1>Image Captioning</h1>
        <ModelStatus status={status} />
      </div>

      <label
        class={`drop-zone${processing ? " drop-zone--disabled" : ""}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onFileDrop}
      >
        {sourceImage ? (
          <img src={sourceImage} class="drop-zone__preview" alt="Source" />
        ) : (
          <span class="drop-zone__hint">Drop an image or click to upload</span>
        )}
        <input
          type="file"
          accept="image/*"
          style="display:none"
          onChange={onFileInputChange}
          disabled={processing}
        />
      </label>

      <div class="caption-zone">
        {processing ? (
          <Spinner />
        ) : caption ? (
          <p class="caption-zone__text">{caption}</p>
        ) : null}
      </div>
    </div>
  );
}
