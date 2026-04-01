import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    const cookieStore = await cookies();
    const customUserStr = cookieStore.get("custom_auth_user")?.value;

    // Both fail -> redirect
    if ((error || !user) && !customUserStr) {
        redirect("/auth/login");
    }

    let displayIdentifier = "";
    if (user) {
        displayIdentifier = user.email || "User";
    } else if (customUserStr) {
        try {
            const parsed = JSON.parse(customUserStr);
            // Will display the register ID or name if available
            displayIdentifier = parsed.register_id || "Student";
        } catch (err) {
            redirect("/auth/login");
        }
    }

    return (
        <div className="flex-1 min-h-[80vh] flex flex-col gap-12 p-10 text-foreground">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Welcome back, {displayIdentifier}!</h1>
                <p className="text-lg text-muted-foreground">This is your personal dashboard where you can see all your stats.</p>
            </div>
            
            {/* Load user-specific data from your DB here */}
        </div>
    );
}