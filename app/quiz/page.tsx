"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Questions from "@/components/auth/quiz";
import { getCurrentDemoUser } from "@/core/auth-action";

export default function QuizPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentDemoUser().then((res) => {
            if (!res) {
                router.push("/auth/login");
            } else {
                setUser(res);
            }
            setLoading(false);
        });
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <div className="text-muted-foreground animate-pulse">Loading setup...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <main className="flex flex-col min-h-screen">
            <Questions 
                user={user} 
                onComplete={() => {
                    router.push("/dashboard");
                }} 
            />
        </main>
    );
}
