import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ProfileButton } from "./profile-button";
export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const customUserStr = cookieStore.get("custom_auth_user")?.value;

  let displayIdentifier = "";
  let displayInitials = "";

  if (user && user.email) {
      displayIdentifier = user.email;
      displayInitials = user.email.slice(0, 2).toUpperCase();
  } else if (customUserStr) {
      try {
          const parsed = JSON.parse(customUserStr);
          displayIdentifier = parsed.register_id || "ST";
          displayInitials = displayIdentifier.slice(0, 2).toUpperCase();
      } catch (err) {}
  }

  return (
    <nav className="w-full border-b backdrop-blur-md bg-background/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex h-16 justify-between items-center px-4 md:px-8">
        <div className="flex gap-4 items-center">
          <Link href={"/"} className="font-extrabold text-xl tracking-tighter text-primary hover:opacity-80 transition-opacity">
            EDUMO 🌌
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          <ThemeSwitcher />
          {displayIdentifier ? (
            <ProfileButton initials={displayInitials} email={displayIdentifier} />
          ) : (
            <Link 
              href="/auth/login" 
              className="px-5 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
