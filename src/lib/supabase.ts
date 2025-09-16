import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined;
const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
const extra = (Constants?.expoConfig as any)?.extra ?? {};

export const SUPABASE_URL = envUrl ?? extra.supabaseUrl;
export const SUPABASE_ANON_KEY = envKey ?? extra.supabaseAnonKey;

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        storageKey: '@supabase.auth.token',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    })
  : null;
