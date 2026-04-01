"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Notification

export default function QuizPage() {
    const router = useRouter();
    const totalQuizzes = 6;
    const [currentQuiz, setCurrentQuiz] = useState(1);
    const [completed, setCompleted] = useState(false);

    const handleNext = () => {
        if (currentQuiz < totalQuizzes) {
            setCurrentQuiz(prev => prev + 1);
        } else {
            setCompleted(true);
            toast.success("Incredible job!", {
                description: "You have completed all 6 quizzes.",
                position: "top-right"
            });
        }
    };

    const progressPercentage = ((currentQuiz - 1) / totalQuizzes) * 100;

    if (completed) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
                <Card className="w-full max-w-md text-center border-green-500/20 shadow-lg shadow-green-500/10">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-green-500">Congratulations! 🎉</CardTitle>
                        <CardDescription className="text-lg">You have completed all 6 quizzes successfully.</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center pb-8">
                        <Button size="lg" onClick={() => router.push('/dashboard')}>
                            Return to Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <main className="flex min-h-[80vh] flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl space-y-8">
                
                {/* Custom Progress Bar */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                        <span>Quiz {currentQuiz} of {totalQuizzes}</span>
                        <span>{Math.round(progressPercentage)}% Completed</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                <Card className="w-full shadow-md">
                    <CardHeader>
                        <CardTitle className="text-2xl">Quiz Module {currentQuiz}</CardTitle>
                        <CardDescription>Answer the questions below to proceed.</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="min-h-[300px] flex flex-col items-center justify-center border-y bg-muted/20 p-8 space-y-4">
                        <div className="text-4xl opacity-50">📝</div>
                        <p className="text-muted-foreground text-center font-medium">
                            [ Quiz {currentQuiz} Interactive Content ]<br/>
                            We will load the questions for quiz {currentQuiz} here.
                        </p>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-6">
                        <Button 
                            variant="outline" 
                            onClick={() => setCurrentQuiz(Math.max(1, currentQuiz - 1))}
                            disabled={currentQuiz === 1}
                        >
                            Previous
                        </Button>
                        <Button onClick={handleNext} className="min-w-[120px]">
                            {currentQuiz === totalQuizzes ? "Finish" : "Next Quiz"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}
