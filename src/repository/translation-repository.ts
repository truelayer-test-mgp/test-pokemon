export interface TranslationRepository {
  translateToYoda(text: string): Promise<string | null>;
  translateToShakespeare(text: string): Promise<string | null>;
}
