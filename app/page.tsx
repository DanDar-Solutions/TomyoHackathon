import Hero from "@/components/hero";

export default function Home() {
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5 mt-10">
        <div className="flex-1 flex flex-col gap-6 px-4">
          <Hero />
        </div>
      </div>
    </div>
  );
}
