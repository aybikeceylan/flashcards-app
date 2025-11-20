import { notificationService } from "@/services/notificationService";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

/**
 * Hook for managing FCM token registration and unregistration
 */
export const useFCMToken = () => {
  const { isAuthenticated } = useAuthStore();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Register token mutation
  const registerTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      return await notificationService.registerToken(token);
    },
    onError: (error) => {
      console.error("Error registering FCM token:", error);
    },
  });

  // Unregister token mutation
  const unregisterTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      return await notificationService.unregisterToken(token);
    },
    onError: (error) => {
      console.error("Error unregistering FCM token:", error);
    },
  });

  /**
   * Get and register FCM token
   */
  const registerToken = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const expoToken = await notificationService.getExpoPushToken();
      if (expoToken && isAuthenticated) {
        setToken(expoToken);
        await registerTokenMutation.mutateAsync(expoToken);
        return expoToken;
      }
      return expoToken;
    } catch (error) {
      console.error("Error in registerToken:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, registerTokenMutation]);

  /**
   * Unregister FCM token
   */
  const unregisterToken = useCallback(
    async (tokenToUnregister?: string): Promise<void> => {
      const tokenToDelete = tokenToUnregister || token;
      if (tokenToDelete) {
        await unregisterTokenMutation.mutateAsync(tokenToDelete);
        setToken(null);
      }
    },
    [token, unregisterTokenMutation]
  );

  /**
   * Auto-register token when user is authenticated
   */
  useEffect(() => {
    if (isAuthenticated && !token) {
      registerToken();
    } else if (!isAuthenticated && token) {
      // Unregister token on logout
      unregisterToken();
    }
  }, [isAuthenticated, token, registerToken, unregisterToken]);

  return {
    token,
    isLoading: isLoading || registerTokenMutation.isPending,
    registerToken,
    unregisterToken,
    isRegistering: registerTokenMutation.isPending,
    isUnregistering: unregisterTokenMutation.isPending,
  };
};
