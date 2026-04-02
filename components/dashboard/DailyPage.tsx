"use client";
import { useDailyPlan, type DailyTask } from "@/lib/hooks/use-daily-plan";

interface DailyPlanPageProps { userId: string; onBack?: () => void; }

const stressLabel: Record<string, string> = { low: "Тайван", medium: "Дунд", high: "Өндөр" };
const stressBadge: Record<string, string> = {
    low: "bg-[#deecd0] text-[#2d5016]",
    medium: "bg-[#fdf3d0] text-[#7a5e00]",
    high: "bg-[#f5d5d5] text-[#8b2020]",
};

const todayISO = () => new Date().toLocaleDateString("en-CA");
const formatDate = (d: string) =>
    new Date(`${d}T12:00:00Z`).toLocaleDateString("mn-MN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

function TaskCard({ task, index }: { task: DailyTask; index: number }) {
    return (
        <div
            className={`bg-[#fffdf8] border border-[rgba(28,26,21,0.12)] rounded-xl px-6 py-[22px] shadow-[0_2px_16px_rgba(28,26,21,0.08)] animate-[fadeUp_0.4s_ease_both] transition-shadow duration-[180ms] hover:shadow-[0_4px_24px_rgba(28,26,21,0.12)] ${task.is_urgent ? 'border-l-[3px] border-l-[#8b2020]' : ''}`}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <div className="flex items-center gap-3 mb-3">
                <span className="font-['Lora',serif] text-xl font-semibold text-[#c8862a] min-w-[28px]">{String(index + 1).padStart(2, "0")}</span>
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-semibold tracking-[0.1em] uppercase text-[#5a5446]">{task.subject}</span>
                    {task.is_urgent && <span className="bg-[#f5d5d5] text-[#8b2020] text-[10px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded-[20px]">Яаралтай</span>}
                </div>
                <span className="font-['Lora',serif] text-[13px] text-[#5a5446] whitespace-nowrap">{task.duration_minutes}мин</span>
            </div>
            <p className="text-[15px] font-medium text-[#1c1a15] mb-4 leading-normal">{task.task}</p>
            <div className="flex flex-col gap-2 border-t border-[rgba(28,26,21,0.12)] pt-3.5">
                <div className="flex gap-2 text-[13px] text-[#5a5446]"><span className="font-semibold text-[#1c1a15] whitespace-nowrap min-w-[100px] max-sm:min-w-[80px]">Яагаад өнөөдөр?</span><span>{task.reason}</span></div>
                <div className="flex gap-2 text-[13px] text-[#5a5446]"><span className="font-semibold text-[#1c1a15] whitespace-nowrap min-w-[100px] max-sm:min-w-[80px]">Зөвлөгөө</span><span>{task.study_tip}</span></div>
            </div>
        </div>
    );
}

export default function DailyPlanPage({ userId, onBack }: DailyPlanPageProps) {
    const { plan, loading, error, generatePlan, reset } = useDailyPlan();
    const today = todayISO();

    return (
        <div className="max-w-[680px] mx-auto px-6 py-12 pb-20 max-sm:px-4 max-sm:pt-8 max-sm:pb-[60px]">
            <header className="mb-10 text-center">
                {onBack && <button className="btn-back" onClick={onBack}>← Буцах</button>}
                <div className="font-['DM_Sans',sans-serif] text-[11px] font-semibold tracking-[0.18em] uppercase text-[#c8862a] mb-2.5">Цагмэргэн</div>
                <h1 className="font-['Lora',Georgia,serif] text-[clamp(28px,5vw,38px)] font-semibold text-[#1c1a15] leading-[1.2]">Өнөөдрийн төлөвлөгөө</h1>
                <p className="mt-2 text-[13px] text-[#5a5446] italic font-['Lora',serif]">{formatDate(today)}</p>
            </header>

            {!plan && !loading && (
                <div className="bg-[#fffdf8] border border-[rgba(28,26,21,0.12)] rounded-xl px-8 py-10 text-center shadow-[0_2px_16px_rgba(28,26,21,0.08)] max-sm:px-5 max-sm:py-7">
                    <p className="text-[#5a5446] text-[15px] max-w-[420px] mx-auto mb-7">AI танд өнөөдрийн хичээлийн ачааллыг тооцоолж, оновчтой цагийн хуваарь гаргаж өгнө.</p>
                    <button
                        className="bg-[#1c1a15] text-[#f5f0e8] border-none rounded-lg px-9 py-3.5 font-['DM_Sans',sans-serif] text-[15px] font-semibold cursor-pointer tracking-[0.02em] transition-all duration-[180ms] hover:bg-[#c8862a] hover:-translate-y-px active:translate-y-0"
                        onClick={() => generatePlan(userId, today)}
                    >
                        Төлөвлөгөө үүсгэх
                    </button>
                    {error && <p className="mt-4 text-[#8b2020] text-[13px]">⚠ {error}</p>}
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center gap-5 py-[60px]">
                    <div className="w-[45px] aspect-square animate-[l2_1s_infinite_linear]" style={{
                        background: 'no-repeat linear-gradient(#c8862a 0 0) 0% 100%, no-repeat linear-gradient(#c8862a 0 0) 50% 100%, no-repeat linear-gradient(#c8862a 0 0) 100% 100%',
                        backgroundSize: '20% 100%, 20% 100%, 20% 100%',
                    }} />
                    <p className="text-[#5a5446] italic font-['Lora',serif]">боловсруулж байна…</p>
                </div>
            )}

            {plan && !loading && (
                <div className="flex flex-col gap-5 animate-[fadeUp_0.4s_ease_both]">
                    {/* Overview card */}
                    <div className="bg-[#fffdf8] border border-[rgba(28,26,21,0.12)] rounded-xl p-7 shadow-[0_2px_16px_rgba(28,26,21,0.08)] max-sm:p-[18px]">
                        <div className="flex gap-6 mb-5 flex-wrap">
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#5a5446]">Стресс</span>
                                <span className={`inline-block px-2.5 py-[3px] rounded-[20px] text-xs font-semibold ${stressBadge[plan.stress_load] ?? ''}`}>{stressLabel[plan.stress_load] ?? plan.stress_load}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#5a5446]">Эхлэх цаг</span>
                                <span className="font-['Lora',serif] text-[22px] font-semibold text-[#1c1a15]">{plan.recommended_start_time}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#5a5446]">Даалгавар</span>
                                <span className="font-['Lora',serif] text-[22px] font-semibold text-[#1c1a15]">{plan.tasks.length}</span>
                            </div>
                        </div>
                        <p className="text-sm text-[#5a5446] leading-[1.7] border-t border-[rgba(28,26,21,0.12)] pt-4">{plan.summary}</p>
                    </div>

                    {/* Tasks list */}
                    <div className="flex flex-col gap-3">
                        {plan.tasks.map((task, i) => <TaskCard key={task.homework_id ?? i} task={task} index={i} />)}
                    </div>

                    {/* AI message */}
                    <div className="bg-[#f0d9b0] border border-[rgba(200,134,42,0.3)] rounded-xl p-6 flex gap-3.5 items-start">
                        <span className="text-[#c8862a] text-lg shrink-0 mt-0.5">✦</span>
                        <p className="font-['Lora',serif] italic text-[15px] text-[#1c1a15] leading-[1.7]">{plan.ai_message}</p>
                    </div>

                    {/* Regen */}
                    <div className="flex gap-3 justify-end">
                        <button
                            className="bg-transparent text-[#5a5446] border border-[rgba(28,26,21,0.12)] rounded-lg px-5 py-2.5 font-['DM_Sans',sans-serif] text-[13px] font-medium cursor-pointer transition-all duration-150 hover:border-[#1c1a15] hover:text-[#1c1a15] hover:bg-[#f5f0e8]"
                            onClick={reset}
                        >
                            ← Буцах
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}