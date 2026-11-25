import {
  GroceryCategory,
  GroceryItem,
  RemoteGroceryRow,
  UserProfile,
} from '../types/grocery';
import { getSupabaseClient } from './supabaseClient';

const REMOTE_SELECT_COLUMNS =
  'id, name, note, category, is_purchased, created_at, updated_at, created_by_name, created_by_email, user_id';

export function mapRemoteRowToGroceryItem(row: RemoteGroceryRow): GroceryItem {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    note: row.note ?? '',
    category: (row.category || 'Other') as GroceryCategory,
    isPurchased: Boolean(row.is_purchased),
    createdAt: Number(row.created_at) || Date.now(),
    updatedAt: row.updated_at != null ? Number(row.updated_at) : null,
    createdByName: row.created_by_name ?? '',
    createdByEmail: row.created_by_email ?? '',
  };
}

export function buildRemoteInsertPayload(params: {
  id: string;
  user: UserProfile;
  name: string;
  note: string;
  category: GroceryCategory;
  createdAt: number;
}): RemoteGroceryRow {
  return {
    id: params.id,
    user_id: params.user.id,
    name: params.name.trim(),
    note: params.note.trim(),
    category: params.category || 'Other',
    is_purchased: false,
    created_at: params.createdAt,
    updated_at: null,
    created_by_name: params.user.displayName,
    created_by_email: params.user.email,
  };
}

export async function fetchGroceryItems(userId: string): Promise<GroceryItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('grocery_items')
    .select(REMOTE_SELECT_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as RemoteGroceryRow[]).map(mapRemoteRowToGroceryItem);
}

export async function createGroceryItem(params: {
  user: UserProfile;
  name: string;
  note: string;
  category: GroceryCategory;
}): Promise<GroceryItem> {
  const supabase = getSupabaseClient();
  const id = crypto.randomUUID();
  const createdAt = Date.now();
  const payload = buildRemoteInsertPayload({
    id,
    user: params.user,
    name: params.name,
    note: params.note,
    category: params.category,
    createdAt,
  });

  const { data, error } = await supabase
    .from('grocery_items')
    .insert(payload)
    .select(REMOTE_SELECT_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRemoteRowToGroceryItem(data as RemoteGroceryRow);
}

export async function updateGroceryItem(params: {
  userId: string;
  itemId: string;
  name: string;
  note: string;
  category: GroceryCategory;
}): Promise<GroceryItem> {
  const supabase = getSupabaseClient();
  const updatedAt = Date.now();

  const { data, error } = await supabase
    .from('grocery_items')
    .update({
      name: params.name.trim(),
      note: params.note.trim(),
      category: params.category || 'Other',
      updated_at: updatedAt,
    })
    .eq('id', params.itemId)
    .eq('user_id', params.userId)
    .select(REMOTE_SELECT_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRemoteRowToGroceryItem(data as RemoteGroceryRow);
}

export async function setGroceryItemPurchased(params: {
  userId: string;
  itemId: string;
  isPurchased: boolean;
}): Promise<GroceryItem> {
  const supabase = getSupabaseClient();
  const updatedAt = Date.now();

  const { data, error } = await supabase
    .from('grocery_items')
    .update({
      is_purchased: params.isPurchased,
      updated_at: updatedAt,
    })
    .eq('id', params.itemId)
    .eq('user_id', params.userId)
    .select(REMOTE_SELECT_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRemoteRowToGroceryItem(data as RemoteGroceryRow);
}

export async function deleteGroceryItem(params: {
  userId: string;
  itemId: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('grocery_items')
    .delete()
    .eq('id', params.itemId)
    .eq('user_id', params.userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function clearPurchasedGroceryItems(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('grocery_items')
    .delete()
    .eq('user_id', userId)
    .eq('is_purchased', true);

  if (error) {
    throw new Error(error.message);
  }
}

export async function clearAllGroceryItems(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('grocery_items')
    .delete()
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export function subscribeToGroceryChanges(
  userId: string,
  onChange: () => void
): () => void {
  const supabase = getSupabaseClient();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const channel = supabase
    .channel(`web-grocery-items-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'grocery_items',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          onChange();
        }, 350);
      }
    )
    .subscribe();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    supabase.removeChannel(channel);
  };
}
