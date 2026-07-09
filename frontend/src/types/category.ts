export interface ApiCategory {
  id: string;
  parent_id: string | null;
  name: string;
  photo_url: string | null;
  children: ApiCategory[];
}

export interface CategoryChipItem {
  id: string;
  label: string;
  icon?: string;
  iconOutline?: string;
  photo_url?: string | null;
}
