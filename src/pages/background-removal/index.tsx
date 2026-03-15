import { useEffect, useRef, useState } from "preact/hooks";
import "./style.css";
import {
  ModelStatus,
  ModelStatusType,
} from "../../components/model-status/model-status";
import { pipeline, RawImage } from "@huggingface/transformers";
import { Spinner } from "../../components/spinner/spinner";

const MODEL_ID = "briaai/RMBG-1.4";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let segmenter: any = null;

async function applyMask(imageUrl: string, mask: RawImage): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      // Put mask (grayscale, 1 channel) into its own canvas
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = mask.width;
      maskCanvas.height = mask.height;
      const maskCtx = maskCanvas.getContext("2d")!;
      const maskImageData = new ImageData(mask.width, mask.height);
      for (let i = 0; i < mask.width * mask.height; i++) {
        const val = mask.data[i];
        maskImageData.data[i * 4] = val;
        maskImageData.data[i * 4 + 1] = val;
        maskImageData.data[i * 4 + 2] = val;
        maskImageData.data[i * 4 + 3] = 255;
      }
      maskCtx.putImageData(maskImageData, 0, 0);

      // Scale mask to match original image dimensions
      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = img.width;
      scaledCanvas.height = img.height;
      const scaledCtx = scaledCanvas.getContext("2d")!;
      scaledCtx.drawImage(maskCanvas, 0, 0, img.width, img.height);
      const scaledMask = scaledCtx.getImageData(0, 0, img.width, img.height);

      // Use mask red channel as alpha on original image
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i + 3] = scaledMask.data[i];
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    img.src = imageUrl;
  });
}

export function BackgroundRemovalPage() {
  const [status, setStatus] = useState<ModelStatusType>("ready");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const segmenterRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        segmenter = await pipeline("image-segmentation", MODEL_ID, {
          device: "webgpu",
        });
        segmenterRef.current = segmenter;
        setStatus("ready");
      } catch (err) {
        setStatus("error");
      }
    })();
  }, []);

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setSourceImage(url);
    setResultImage(null);
    setProcessing(true);

    try {
      const seg = segmenterRef.current;
      const output = (await seg(url, { threshold: 0 })) as Array<{
        mask: RawImage;
      }>;
      const result = await applyMask(url, output[0].mask);
      setResultImage(result);
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
        <h1>Background Removal - Client</h1>
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

      <div class="result-zone">
        {processing ? (
          <Spinner />
        ) : (
          resultImage && (
            <img src={resultImage} class="result-zone__image" alt="Result" />
          )
        )}
      </div>
    </div>
  );
}
