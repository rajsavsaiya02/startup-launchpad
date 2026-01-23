import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mantine/core/styles.css";
import "./index.css";
import App from "./App.jsx";
import { ThemeWrapper } from "./components/ThemeWrapper";
import { SettingsProvider } from "./context/SettingsContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <ThemeWrapper>
          <App />
        </ThemeWrapper>
      </SettingsProvider>
    </QueryClientProvider>
  </StrictMode>
);
