"use server"

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ─────────────────────────────────────────────
// Sign In (Registry ID + password)
// ─────────────────────────────────────────────
export async function signinRegistry(regNo: string, password: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('demo_users')
        .select('*')
        .eq('user_id', regNo)
        .eq('password', password)
        .maybeSingle();

    if (error) return { error: 'Something went wrong. Please try again.', user: null, hasQuiz: false };
    if (!data)  return { error: 'Invalid user ID or password.', user: null, hasQuiz: false };

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('custom_auth_user', data.user_id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
        httpOnly: true,            // ← secure: not readable by JS
    });

    // Check if onboarding quiz has been completed
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', regNo)
        .maybeSingle();

    revalidatePath('/', 'layout');
    return { user: data, hasQuiz: !!profile, error: null };
}

// ─────────────────────────────────────────────
// Sign Out
// ─────────────────────────────────────────────
export async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete('custom_auth_user');
    await (await createClient()).auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/auth/login');
}

// ─────────────────────────────────────────────
// Get current logged-in demo user
// Falls back to reading the cookie if no id is passed.
// ─────────────────────────────────────────────
export async function getCurrentDemoUser(id?: string | number | null) {
    const supabase = await createClient();

    let searchId = id ? String(id) : null;

    if (!searchId) {
        const cookieStore = await cookies();
        searchId = cookieStore.get('custom_auth_user')?.value ?? null;
    }

    if (!searchId) return null;

    const { data, error } = await supabase
        .from('demo_users')
        .select('*, classes(id, grade, class_section, class_name)')   // join class info
        .eq('user_id', searchId)
        .maybeSingle();

    if (error) {
        console.error('getCurrentDemoUser error:', error.message);
        return null;
    }

    return data;
}
