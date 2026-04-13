// Blotato API client for social media scheduling and publishing
// https://blotato.com - Social media management platform

export type SocialPlatform = 'twitter' | 'linkedin' | 'facebook' | 'instagram';

export type SocialPost = {
  text: string;
  platforms: SocialPlatform[];
  mediaUrls?: string[];
  scheduledAt?: string; // ISO date string, or omit for next available slot
  link?: string;
};

export type ScheduleResult = {
  id: string;
  status: 'scheduled' | 'published' | 'failed';
  platforms: SocialPlatform[];
  scheduledAt: string;
};

export type BlotatoConfig = {
  apiKey: string;
  apiUrl: string;
};

export class BlotatoClient {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(config?: Partial<BlotatoConfig>) {
    this.apiKey = config?.apiKey || process.env.BLOTATO_API_KEY || '';
    this.apiUrl = config?.apiUrl || process.env.BLOTATO_API_URL || 'https://api.blotato.com/v1';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Blotato API key is not configured. Set BLOTATO_API_KEY environment variable.');
    }

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Blotato API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async schedulePost(post: SocialPost): Promise<ScheduleResult> {
    return this.request<ScheduleResult>('/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }

  async getScheduledPosts(limit = 20): Promise<ScheduleResult[]> {
    return this.request<ScheduleResult[]>(`/posts?limit=${limit}&status=scheduled`);
  }

  async cancelPost(postId: string): Promise<void> {
    await this.request(`/posts/${postId}`, { method: 'DELETE' });
  }

  async getConnectedPlatforms(): Promise<SocialPlatform[]> {
    return this.request<SocialPlatform[]>('/platforms');
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// Singleton instance
let blotatoInstance: BlotatoClient | null = null;

export function getBlotatoClient(): BlotatoClient {
  if (!blotatoInstance) {
    blotatoInstance = new BlotatoClient();
  }
  return blotatoInstance;
}
