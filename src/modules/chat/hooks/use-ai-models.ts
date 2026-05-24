import { useQuery } from "@tanstack/react-query";
import type { AIModel } from "../lib/models";

export type { AIModel };

interface FetchModelsResponse {
  models: AIModel[];
  error?: string;
}

export const useAIModels = () => {
  return useQuery<AIModel[], Error>({
    queryKey: ["ai-models"],
    queryFn: async () => {
      const response = await fetch("/api/ai/get-models");
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to retrieve AI models from server.");
      }

      const data: FetchModelsResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.models || [];
    },
    staleTime: 5 * 60 * 1000, // Keep cached models fresh for 5 minutes before refetching
    retry: 1, // Only retry once upon failure state
  });
};
