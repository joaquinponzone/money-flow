export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface NewCategory {
  name: string;
  description: string | null;
} 