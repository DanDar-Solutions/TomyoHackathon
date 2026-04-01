"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signinEduMail } from "@/core/auth-action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SchoolLoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await signinEduMail(email, password);
        if (result?.error) {
            setError(result.error);
            toast.error(result.error);
        } else {
            toast.success("Login Successful!", {
                description: "Getting your quizzes ready...",
                position: "top-right",
            });
            router.push("/quiz");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="you@school.edu"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </Button>
        </form>
    );
}