# Transformers.js Playground

A quick showcase of [Transformers.js](https://huggingface.co/docs/transformers.js) — running machine learning models directly in the browser, no server required.

## Demos

- **Sentiment Analysis** — classify text as positive or negative
- **Translation** — translate text between languages
- **Background Removal** — remove image backgrounds using segmentation models
- **Product Embeddings** — generate semantic embeddings for product search/similarity
- **Image Captioning** — generate captions for images for furhter use with semantic search

## Tech Stack

- [Transformers.js](https://huggingface.co/docs/transformers.js) — ML inference in the browser via ONNX Runtime
- [Preact](https://preactjs.com/) — lightweight UI
- [Vite](https://vitejs.dev/) — build tooling
- TypeScript

## Running Locally

```bash
npm install
npm run dev
```

Models are downloaded from Hugging Face on first use and cached in the browser.
