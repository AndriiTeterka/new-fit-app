import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { getTemplates } from '@/storage/templates';

const MIGRATION_KEY = '@supabase_migrated_templates';

type Template = {
  id: string;
  title: string;
  duration?: number;
  difficulty?: string;
  category?: string;
  exercises?: any[];
  updated_at?: string | null;
};

async function migrateLocalTemplatesOnce() {
  if (!supabase) return; // no supabase configured
  try {
    const migrated = await AsyncStorage.getItem(MIGRATION_KEY);
    if (migrated) return;
    // Load remote rows count
    const { count, error: countErr } = await supabase
      .from('templates')
      .select('*', { count: 'exact', head: true });
    if (countErr) return; // table may not exist yet; skip silently
    if ((count ?? 0) > 0) {
      await AsyncStorage.setItem(MIGRATION_KEY, '1');
      return;
    }
    const local = await getTemplates();
    if (!Array.isArray(local) || local.length === 0) return;
    // Map local templates to columns; keep JSON exercises
    const rows: Template[] = local.map((t: any) => ({
      id: String(t.id),
      title: t.title,
      duration: t.duration ?? null,
      difficulty: t.difficulty ?? null,
      category: t.category ?? null,
      exercises: Array.isArray(t.exercises) ? t.exercises : [],
      updated_at: new Date((t.updatedAt ?? Date.now())).toISOString(),
    }));
    const { error } = await supabase.from('templates').upsert(rows, { onConflict: 'id' });
    if (!error) {
      await AsyncStorage.setItem(MIGRATION_KEY, '1');
    }
  } catch {}
}

export function useTemplates() {
  const queryClient = useQueryClient();
  const useRemote = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && supabase);

  return useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      if (!useRemote) {
        return await getTemplates();
      }
      try {
        // Ensure one-time migration
        await migrateLocalTemplatesOnce();
        const { data, error } = await supabase!
          .from('templates')
          .select('*')
          .order('updated_at', { ascending: false });
        if (error) throw error;
        if (Array.isArray(data) && data.length > 0) return data as Template[];
        // Fallback to local if remote empty
        return await getTemplates();
      } catch (e) {
        // Table missing / offline ? local fallback
        return await getTemplates();
      }
    },
    staleTime: 60_000,
  });
}
