"use server"

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function signinRegistry(regNo: string, birthDate: string) {
    const supabase = await createClient();
    
    let { data, error } = await supabase
        .from('demo_users')
        .select('*')
        .eq('user_id', regNo)
        .eq('password', birthDate)
        .maybeSingle();

    if (error) return { error: 'Something went wrong. Please try again.', user: null };
    if (!data) {
        return { error: 'Invalid user ID or password.', user: null };
    }
    const cookieStore = await cookies();
    cookieStore.set('custom_auth_user', data?.user_id, { 
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax'
    });
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', regNo)
        .maybeSingle();
    revalidatePath('/', 'layout');
        
    return { user: data, hasQuiz: !!profile, error: null };
}

export async function signupRegistry(regNo: string, passwordStr: string) {
    const supabase = await createClient();
    const { data: existing } = await supabase
        .from('demo_users')
        .select('user_id')
        .eq('user_id', regNo)
        .maybeSingle();
    if (existing) {
        return { error: 'This user ID is already taken. Please choose another.', user: null };
    }
    const { error: insertError } = await supabase
        .from('demo_users')
        .insert([{ user_id: regNo, password: passwordStr }]);
    if (insertError) {
        return { error: 'Failed to create account. Please try again.', user: null };
    }
    return await signinRegistry(regNo, passwordStr);
}


export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    const cookieStore = await cookies();
    cookieStore.delete('custom_auth_user');
    revalidatePath('/', 'layout');
}

export async function getCurrentDemoUser() {
    const cookieStore = await cookies();
    const val = cookieStore.get("custom_auth_user")?.value;
    if (!val) return null;
    
    const supabase = await createClient();
    const { data } = await supabase.from('demo_users').select('*').eq('user_id', val).single();
    return data;
}