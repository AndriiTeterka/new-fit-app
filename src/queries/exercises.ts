import { useQuery } from '@tanstack/react-query';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

type Filters = {
  search?: string;
  category?: string; // e.g., Chest, Back, All
  difficulty?: string; // Easy, Medium, Hard, All
};

export type Exercise = {
  id: string;
  name: string;
  muscle_group?: string | null;
  difficulty?: string | null;
  equipment?: string | null;
  default_sets?: number | null;
  default_reps?: string | null;
  default_duration?: string | null;
  default_rest_time?: number | null;
  tags?: string[] | null;
};

async function fetchFromSeed() {
  const seed: Exercise[] = [
    { id: 'ex-1', name: 'Bench Press', muscle_group: 'Chest', difficulty: 'Medium', equipment: 'Barbell', default_sets: 4, default_reps: '8-10', default_rest_time: 90 },
    { id: 'ex-2', name: 'Squat', muscle_group: 'Legs', difficulty: 'Hard', equipment: 'Barbell', default_sets: 4, default_reps: '6-8', default_rest_time: 120 },
    { id: 'ex-3', name: 'Pull-ups', muscle_group: 'Back', difficulty: 'Medium', equipment: 'Pull-up Bar', default_sets: 3, default_reps: '6-10', default_rest_time: 90 },
    { id: 'ex-4', name: 'Plank', muscle_group: 'Core', difficulty: 'Easy', equipment: 'None', default_sets: 3, default_duration: '45s', default_rest_time: 60 },
    { id: 'ex-5', name: 'Overhead Press', muscle_group: 'Shoulders', difficulty: 'Medium', equipment: 'Barbell', default_sets: 4, default_reps: '8-10', default_rest_time: 90 },
    { id: 'ex-6', name: 'Deadlift', muscle_group: 'Back', difficulty: 'Hard', equipment: 'Barbell', default_sets: 3, default_reps: '3-5', default_rest_time: 180 },
    { id: 'ex-7', name: 'Bicep Curl', muscle_group: 'Arms', difficulty: 'Easy', equipment: 'Dumbbells', default_sets: 3, default_reps: '10-12', default_rest_time: 60 },
    { id: 'ex-8', name: 'Tricep Dips', muscle_group: 'Arms', difficulty: 'Medium', equipment: 'Parallel Bars', default_sets: 3, default_reps: '8-12', default_rest_time: 90 },
    { id: 'ex-9', name: 'Lunges', muscle_group: 'Legs', difficulty: 'Medium', equipment: 'Dumbbells', default_sets: 3, default_reps: '10-12', default_rest_time: 90 },
    { id: 'ex-10', name: 'Burpees', muscle_group: 'Cardio', difficulty: 'Hard', equipment: 'None', default_sets: 5, default_duration: '40s', default_rest_time: 20 },
  ];
  return seed;
}

export function useExercises(filters: Filters) {
  const useRemote = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && supabase);
  const { search = '', category = 'All', difficulty = 'All' } = filters || {};

  return useQuery<Exercise[]>({
    queryKey: ['exercises', search, category, difficulty],
    queryFn: async () => {
      const filterSeed = async () => {
        const seed = await fetchFromSeed();
        return seed.filter((e) => {
          const s = search.trim().toLowerCase();
          const okSearch = s ? (e.name?.toLowerCase().includes(s) ?? false) : true;
          const okCat = category === 'All' ? true : (e.muscle_group === category);
          const okDiff = difficulty === 'All' ? true : (e.difficulty === difficulty);
          return okSearch && okCat && okDiff;
        });
      };

      if (!useRemote) {
        return await filterSeed();
      }
      try {
        let q = supabase!.from('exercises').select('*');
        if (search.trim()) {
          q = q.ilike('name', `%${search.trim()}%`);
        }
        if (category && category !== 'All') {
          q = q.eq('muscle_group', category);
        }
        if (difficulty && difficulty !== 'All') {
          q = q.eq('difficulty', difficulty);
        }
        const { data, error } = await q.order('name', { ascending: true });
        if (error) throw error;
        if (Array.isArray(data) && data.length > 0) return data as Exercise[];
        return await filterSeed();
      } catch {
        // Remote failed or table missing -> fallback to seed
        return await filterSeed();
      }
    },
    staleTime: 60_000,
  });
}
