import { flashcardApi } from "@/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const flashcardKeys = {
  all: ["flashcards"] as const,
  lists: () => [...flashcardKeys.all, "list"] as const,
  list: (filters: string) => [...flashcardKeys.lists(), { filters }] as const,
  details: () => [...flashcardKeys.all, "detail"] as const,
  detail: (id: string) => [...flashcardKeys.details(), id] as const,
};

// Convert API Flashcard to Store Card format
const convertFlashcardToCard = (flashcard: any) => ({
  id: flashcard._id,
  word: flashcard.word,
  meaning: flashcard.meaning,
  example: flashcard.example,
  imageUrl: flashcard.imageUrl,
  audioUrl: flashcard.audioUrl,
  isFavorite: flashcard.isFavorite,
  createdAt: flashcard.createdAt,
  updatedAt: flashcard.updatedAt,
});

// Get all flashcards
export const useFlashcards = () => {
  return useQuery({
    queryKey: flashcardKeys.lists(),
    queryFn: async () => {
      const response = await flashcardApi.getAll();
      if (response.data.success && response.data.data) {
        return response.data.data.map(convertFlashcardToCard);
      }
      throw new Error(
        response.data.message || "Kartlar yüklenirken bir hata oluştu"
      );
    },
    staleTime: 1000 * 60 * 5, // 5 dakika cache
    gcTime: 1000 * 60 * 10, // 10 dakika garbage collection (eski cacheTime)
  });
};

// Get single flashcard by ID
export const useFlashcard = (id: string | null) => {
  return useQuery({
    queryKey: flashcardKeys.detail(id!),
    queryFn: async () => {
      if (!id) throw new Error("ID gerekli");
      const response = await flashcardApi.getById(id);
      if (response.data.success && response.data.data) {
        return convertFlashcardToCard(response.data.data);
      }
      throw new Error(
        response.data.message || "Kart yüklenirken bir hata oluştu"
      );
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Create flashcard mutation
export const useCreateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      word: string;
      meaning: string;
      example?: string;
      imageUrl?: string;
      audioUrl?: string;
      isFavorite?: boolean;
    }) => {
      const response = await flashcardApi.create(data);
      if (response.data.success && response.data.data) {
        return convertFlashcardToCard(response.data.data);
      }
      throw new Error(
        response.data.message || "Kart eklenirken bir hata oluştu"
      );
    },
    onSuccess: (newCard) => {
      // Cache'e yeni kartı ekle (invalidate yerine direkt güncelle)
      queryClient.setQueryData(
        flashcardKeys.lists(),
        (oldCards: any[] = []) => {
          return [newCard, ...oldCards];
        }
      );
    },
  });
};

// Update flashcard mutation
export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        word?: string;
        meaning?: string;
        example?: string;
        imageUrl?: string;
        audioUrl?: string;
        isFavorite?: boolean;
      };
    }) => {
      const response = await flashcardApi.update(id, data);
      if (response.data.success && response.data.data) {
        return convertFlashcardToCard(response.data.data);
      }
      throw new Error(
        response.data.message || "Kart güncellenirken bir hata oluştu"
      );
    },
    onSuccess: (updatedCard, variables) => {
      // Cache'i güncelle (invalidate yerine direkt güncelle)
      // Liste cache'ini güncelle
      queryClient.setQueryData(
        flashcardKeys.lists(),
        (oldCards: any[] = []) => {
          return oldCards.map((card) =>
            card.id === variables.id ? updatedCard : card
          );
        }
      );
      // Detay cache'ini güncelle
      queryClient.setQueryData(flashcardKeys.detail(variables.id), updatedCard);
    },
  });
};

// Delete flashcard mutation
export const useDeleteFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await flashcardApi.delete(id);
      if (response.data.success) {
        return id;
      }
      throw new Error(
        response.data.message || "Kart silinirken bir hata oluştu"
      );
    },
    onSuccess: (_, deletedId) => {
      // Cache'den kartı kaldır (invalidate yerine direkt güncelle)
      queryClient.setQueryData(
        flashcardKeys.lists(),
        (oldCards: any[] = []) => {
          return oldCards.filter((card) => card.id !== deletedId);
        }
      );
      // Detay cache'ini de temizle
      queryClient.removeQueries({
        queryKey: flashcardKeys.detail(deletedId),
      });
    },
  });
};
