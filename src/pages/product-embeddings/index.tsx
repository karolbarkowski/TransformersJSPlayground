import { useState, useEffect, useRef } from "preact/hooks";
import { pipeline } from "@huggingface/transformers";
import "./style.css";
import {
  ModelStatus,
  ModelStatusType,
} from "../../components/model-status/model-status";

interface Product {
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
}

const PRODUCTS: Product[] = [
  {
    name: "UltraBook Pro 15",
    description:
      "Lightweight laptop with a 15-inch OLED display, 16 GB RAM, and 512 GB SSD built for professionals on the go.",
    price: 1299,
    category: "Electronics",
    brand: "TechCore",
  },
  {
    name: "SwiftRun Elite",
    description:
      "Responsive running shoes with advanced cushioning and a breathable mesh upper designed for long-distance runners.",
    price: 149,
    category: "Footwear",
    brand: "SpeedStep",
  },
  {
    name: "BrewMaster Pro",
    description:
      "Programmable drip coffee maker with a built-in grinder, thermal carafe, and 12-cup capacity for coffee enthusiasts.",
    price: 229,
    category: "Kitchen Appliances",
    brand: "Roastery Co.",
  },
  {
    name: "SoundWave ANC 500",
    description:
      "Over-ear wireless headphones with active noise cancellation, 30-hour battery life, and studio-quality Hi-Fi audio.",
    price: 349,
    category: "Audio",
    brand: "AuraTech",
  },
];

function productToText(p: Product): string {
  return `Name: ${p.name}. Description: ${p.description} Price: $${p.price}. Category: ${p.category}. Brand: ${p.brand}.`;
}

function formatVector(vec: number[]): string {
  return `[${vec.map((v) => v.toFixed(4)).join(", ")}]`;
}

export function ProductEmbeddingsPage() {
  const [status, setStatus] = useState<ModelStatusType>("loading");
  const [embeddings, setEmbeddings] = useState<(number[] | null)[]>(
    PRODUCTS.map(() => null),
  );
  const [loading, setLoading] = useState<boolean[]>(PRODUCTS.map(() => false));
  const extractor = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        extractor.current = await pipeline(
          "feature-extraction",
          "Xenova/all-MiniLM-L6-v2",
        );
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    })();
  }, []);

  const embed = async (index: number) => {
    if (!extractor.current) return;
    setLoading((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    try {
      const text = productToText(PRODUCTS[index]);
      const output = await extractor.current(text, {
        pooling: "mean",
        normalize: true,
      });
      const vec = Array.from(output.data as Float32Array);
      setEmbeddings((prev) => {
        const next = [...prev];
        next[index] = vec;
        return next;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }
  };

  return (
    <div>
      <div class="page-header">
        <h1>Product Embeddings</h1>
        <ModelStatus status={status} />
      </div>

      <p class="pe-intro">
        Each product is serialised into a single text string and passed through{" "}
        <code>all-MiniLM-L6-v2</code> to produce a 384-dimensional embedding
        vector. Click <strong>Embed</strong> on any product to generate its
        vector representation.
      </p>

      <div class="pe-grid">
        {PRODUCTS.map((product, i) => (
          <div key={product.name} class="pe-card">
            <div class="pe-card-header">
              <div class="pe-card-meta">
                <span class="pe-category">{product.category}</span>
                <span class="pe-brand">{product.brand}</span>
              </div>
              <h2 class="pe-name">{product.name}</h2>
              <p class="pe-description">{product.description}</p>
              <span class="pe-price">${product.price.toLocaleString()}</span>
            </div>

            <div class="pe-card-footer">
              <button
                class="pe-embed-btn"
                onClick={() => embed(i)}
                disabled={loading[i] || status !== "ready"}
              >
                {loading[i] ? (
                  <>
                    <span class="pe-btn-spinner" />
                    Embedding…
                  </>
                ) : embeddings[i] ? (
                  "Re-embed"
                ) : (
                  "Embed"
                )}
              </button>

              {embeddings[i] && (
                <span class="pe-dim-badge">{embeddings[i]!.length}d</span>
              )}
            </div>

            {embeddings[i] && (
              <div class="pe-vector-wrap">
                <div class="pe-vector-label">
                  Embedding vector ({embeddings[i]!.length} dimensions)
                </div>
                <pre class="pe-vector">{formatVector(embeddings[i]!)}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
