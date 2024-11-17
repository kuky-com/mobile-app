import apiClient from "@/utils/apiClient";
import { useQuery } from "@tanstack/react-query";

export function useUserReviews(userId) {
  return useQuery({
    queryKey: ["reviews", userId],
    queryFn: async () => {
      const response = await apiClient.get(`users/${userId}/reviews`);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return response.data.data;
    },
  });
}
