import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertConfiguration } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useConfigurations() {
  return useQuery({
    queryKey: [api.configurations.list.path],
    queryFn: async () => {
      const res = await fetch(api.configurations.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch configurations");
      return api.configurations.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateConfiguration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertConfiguration) => {
      const res = await fetch(api.configurations.create.path, {
        method: api.configurations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.configurations.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to save configuration");
      }
      return api.configurations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.configurations.list.path] });
      toast({
        title: "Configuration Saved",
        description: "Your experimental setup has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteConfiguration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.configurations.delete.path, { id });
      const res = await fetch(url, {
        method: api.configurations.delete.method,
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Configuration not found");
        throw new Error("Failed to delete configuration");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.configurations.list.path] });
      toast({
        title: "Deleted",
        description: "Configuration removed from your library.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
