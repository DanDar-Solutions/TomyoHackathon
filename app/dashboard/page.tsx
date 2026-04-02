import { cookies } from "next/headers";
import { getStudentDashboardData } from "@/lib/services/student.service";
import StudentDashboard from "@/components/dashboard/dashboard";
import { DashboardSkeleton } from "../../components/dashboard/dashboard-skeleton";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import DailyPage from "../../components/dashboard/DailyPage";

async function DashboardDataWrapper() {
    const cookieStore = await cookies();
    const customUserStr = cookieStore.get("custom_auth_user")?.value;
    const { homework, schedule, profile, gradeEvents, user: studentInfo, error: fetchError } =
        await getStudentDashboardData(customUserStr);

    if (fetchError || !studentInfo) {
        redirect("/auth/login");
    }

    return (
        <>
            <DailyPage userId={studentInfo.user_id} />
            <StudentDashboard
                user={studentInfo}
                homework={homework ?? []}
                schedule={schedule ?? []}
                gradeEvents={gradeEvents ?? []}
                profile={profile ?? null}
            />
        </>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardDataWrapper />
        </Suspense>
    );
}