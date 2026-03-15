import { useLocation } from "preact-iso";
import "./style.css";

export function Sidebar() {
  const { url } = useLocation();

  return (
    <nav class="sidebar">
      <a
        href="/sentiment-analysis-client"
        class={url === "/sentiment-analysis-client" ? "active" : ""}
      >
        Sentiment Analysis
      </a>
      <a
        href="/background-removal-client"
        class={url === "/background-removal-client" ? "active" : ""}
      >
        Background Removal
      </a>
      <a
        href="/translation"
        class={url === "/translation" ? "active" : ""}
      >
        Translation
      </a>
      <a
        href="/product-embeddings"
        class={url === "/product-embeddings" ? "active" : ""}
      >
        Product Embeddings
      </a>
      <a
        href="/image-captioning"
        class={url === "/image-captioning" ? "active" : ""}
      >
        Image Captioning
      </a>
    </nav>
  );
}
