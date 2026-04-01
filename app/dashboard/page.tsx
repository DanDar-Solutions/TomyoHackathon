import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, Clock, CheckCircle2, FlaskConical, Target } from "lucide-react";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    const cookieStore = await cookies();
    const customUserStr = cookieStore.get("custom_auth_user")?.value;

    if ((error || !user) && !customUserStr) {
        redirect("/auth/login");
    }

    let displayIdentifier = "";
    if (user) {
        displayIdentifier = user.email || "User";
    } else if (customUserStr) {
        displayIdentifier = customUserStr;
    }

    // --- FAKE TEMPLATE DATA ---
    const grades = [
        { subject: "Advanced Mathematics", score: 92, bg: "bg-emerald-500", icon: <Target className="h-4 w-4 text-emerald-500" /> },
        { subject: "Physics", score: 85, bg: "bg-green-500", icon: <FlaskConical className="h-4 w-4 text-green-500" /> },
        { subject: "World History", score: 73, bg: "bg-yellow-500", icon: <BookOpen className="h-4 w-4 text-yellow-500" /> },
        { subject: "Literature", score: 64, bg: "bg-red-500", icon: <GraduationCap className="h-4 w-4 text-red-500" /> }
    ];

    const testResults = [
        { name: "Math Midterm Exam", date: "Oct 12", score: "94%" },
        { name: "Biology Lab Report", date: "Oct 10", score: "88%" },
        { name: "History Essay : The Roman Empire", date: "Oct 05", score: "76%" },
    ];

    const homeworks = [
        { task: "Calculus Worksheet 4.2", due: "Tomorrow, 8:00 AM", status: "Pending", statusColor: "text-amber-500 border-amber-500/50 bg-amber-500/10" },
        { task: "Read Chapter 5 - Gatsby", due: "Thursday, 11:59 PM", status: "Not Started", statusColor: "text-red-500 border-red-500/50 bg-red-500/10" },
        { task: "Physics Pre-Lab Setup", due: "Yesterday", status: "Completed", statusColor: "text-emerald-500 border-emerald-500/50 bg-emerald-500/10" },
    ];

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto min-h-[80vh] flex flex-col gap-10 p-4 md:p-10 text-foreground">
            {/* Header */}
            <div className="space-y-2 mt-4">
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">Welcome back, {displayIdentifier}! 👋</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">This is your mission control. Monitor your grades, prep for upcoming tests, and smash your homework deadlines.</p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* GRADES SECTION (2 Columns on large screens) */}
                <Card className="xl:col-span-2 shadow-sm border-muted">
                    <CardHeader className="border-b bg-muted/20 pb-6">
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            Academic Progress
                        </CardTitle>
                        <CardDescription>Your current semester subject tracking</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {grades.map((grade, idx) => (
                            <div key={idx} className="space-y-3 p-4 border rounded-xl bg-card hover:bg-muted/10 transition-colors">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        {grade.icon}
                                        {grade.subject}
                                    </h4>
                                    <span className="font-bold text-sm">{grade.score}%</span>
                                </div>
                                {/* Progress Bar Background */}
                                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden shadow-inner">
                                    {/* Progress Bar Fill */}
                                    <div 
                                        className={`h-full ${grade.bg} transition-all duration-1000 ease-in-out`} 
                                        style={{ width: `${grade.score}%` }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* TASKS & RESULTS SECTION (1 Column) */}
                <div className="space-y-8 flex flex-col">
                    
                    {/* HOMEWORKS */}
                    <Card className="shadow-sm border-muted flex-1">
                        <CardHeader className="bg-muted/10 pb-4">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-500" />
                                Action Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {homeworks.map((hw, idx) => (
                                <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg border bg-background hover:border-primary/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-sm leading-tight">{hw.task}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${hw.statusColor}`}>
                                            {hw.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">Due: {hw.due}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* RECENT TESTS */}
                    <Card className="shadow-sm border-muted flex-1">
                        <CardHeader className="bg-muted/10 pb-4">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                Recent Test Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {testResults.map((test, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-muted/20 rounded-md transition-colors">
                                    <div className="space-y-1">
                                        <p className="font-semibold text-sm">{test.name}</p>
                                        <p className="text-xs text-muted-foreground">{test.date}</p>
                                    </div>
                                    <div className="font-bold text-lg tracking-tight bg-muted/50 px-3 py-1 rounded-md">
                                        {test.score}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}