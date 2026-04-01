"use server"

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function signinRegistry(regNo: string, birthDate: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('register_id', regNo)
        .eq('birth_date', birthDate)
        .maybeSingle();

    if (error) return { error: error.message, user: null };
    if (!data) return { error: "User not found", user: null };

    // Set custom session cookie for Hackathon 
    const cookieStore = await cookies();
    cookieStore.set('custom_auth_user', JSON.stringify(data), { path: '/' });
    
    return { user: data, error: null };
}

export async function signinEduMail(email: string, password: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    
    if (error) {
        return { error: error.message };
    }
    return { user: data.user, error: null };
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    
    // Clear custom cookie
    const cookieStore = await cookies();
    cookieStore.delete('custom_auth_user');
}