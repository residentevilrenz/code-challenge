export interface Resource {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  limit: number;
  offset: number;
}

export interface CreateResourceInput {
  name: string;
  description?: string | null;
  category?: string | null;
  isActive?: boolean;
}

export interface UpdateResourceInput {
  name?: string;
  description?: string | null;
  category?: string | null;
  isActive?: boolean;
}
