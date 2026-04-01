"use server"

import { createClient } from '@/lib/supabase/server';
import { getCurrentDemoUser } from '@/core/auth-action';

export async function getStudentDashboardData(id?: number | string | null) {
    const user = await getCurrentDemoUser(id);
    if (!user) {
        return { error: "Not authenticated", homework: [], schedule: [], profile: null, user: null };
    }

    const supabase = await createClient();

    // schedules is keyed by class_id (not user_id) — use the user's class_id
    const classId = (user as any).class_id as string | null;

    const [homeworkRes, scheduleRes, profileRes] = await Promise.all([
        supabase
            .from('homework')
            .select('id, subject, title, description, due_date, difficulty, estimated_minutes, status')
            .eq('user_id', user.user_id)
            .order('due_date', { ascending: true }),

        classId
            ? supabase
                .from('schedules')
                .select('id, day_of_week, period, subject, start_time, end_time')
                .eq('class_id', classId)
                .order('day_of_week')
                .order('period')
            : Promise.resolve({ data: [], error: null }),

        supabase
            .from('user_profiles')
            .select('learning_style, stress_level, procrastination_risk, study_start_time, home_arrival_time, sleep_time')
            .eq('user_id', user.user_id)
            .maybeSingle(),
    ]);

    return {
        homework: homeworkRes.data ?? [],
        schedule: scheduleRes.data ?? [],
        profile:  profileRes.data ?? null,
        user,
        error: null,
    };
}