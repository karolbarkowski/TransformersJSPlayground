import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import { Sidebar } from "./components/sidebar/sidebar.js";

import "./app.css";
import { BackgroundRemovalPage } from "./pages/background-removal";
import {
  ProductEmbeddingsPage,
  SentimentAnalysisPage,
  TranslationPage,
} from "./pages/index.js";

export function App() {
  return (
    <LocationProvider>
      <div class="layout">
        <Sidebar />

        <main>
          <Router>
            <Route
              path="/sentiment-analysis-client"
              component={SentimentAnalysisPage}
            />
            <Route
              path="/background-removal-client"
              component={BackgroundRemovalPage}
            />
            <Route path="/translation" component={TranslationPage} />
            <Route
              path="/product-embeddings"
              component={ProductEmbeddingsPage}
            />
          </Router>
        </main>
      </div>
    </LocationProvider>
  );
}

render(<App />, document.getElementById("app")!);
