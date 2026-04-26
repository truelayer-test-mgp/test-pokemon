import type { TranslationRepository } from './translation-repository.js';

export class HttpTranslationRepository implements TranslationRepository {
  private readonly baseUrl = 'https://api.funtranslations.mercxry.me/v1/translate';

  async translateToYoda(text: string): Promise<string | null> {
    return this.translate(text, 'yoda');
  }

  async translateToShakespeare(text: string): Promise<string | null> {
    return this.translate(text, 'shakespeare');
  }

  private async translate(text: string, type: 'yoda' | 'shakespeare'): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        // Surface error details, fallback is handled by returning null in catch.
        const errorDetails = await response.text();
        throw new Error(`Translation API error for ${type}: ${response.status} - ${errorDetails}`);
      }

      const data = await response.json();
      return data.contents?.translated || null;
    } catch (error) {
      console.error(`Error calling ${type} translation API:`, error);
      return null;
    }
  }
}
