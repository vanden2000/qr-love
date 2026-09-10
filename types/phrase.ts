export interface StreamPhraseCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  phrases_count?: number;
}

export interface StreamPhrase {
  id: string;
  category_id: string;
  content: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}
