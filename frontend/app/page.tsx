import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Elements - Subtle depth */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white/5 to-transparent opacity-20 pointer-events-none" />

      {/* Hero Section */}
      <section className="w-full max-w-md px-6 py-12 flex flex-col items-center text-center space-y-10 z-10">
        <div className="relative w-32 h-32 md:w-40 md:h-40">
          <Image
            src="/logo.jpg"
            alt="TheTribe Logo"
            fill
            className="object-contain mix-blend-screen [mask-image:radial-gradient(circle,black_60%,transparent_100%)]"
            priority
          />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          A private members club meets a modern environment brooding disciplined men.
        </h1>

        <div className="w-16 h-[1px] bg-tribe-gold/50" />

        {/* Philosophy Section */}
        <div className="space-y-4 text-tribe-light/80">
          <p className="text-lg font-medium">Brotherhood. Growth. Accountability.</p>
          <p className="text-sm leading-relaxed max-w-xs mx-auto text-tribe-light/60">
            For founders, leaders, and professionals who value privacy, structure, and discipline.
          </p>
        </div>

        {/* Access / CTA Section */}
        <div className="w-full space-y-4 pt-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-tribe-gold/80 font-semibold">
              Invite Only
            </p>
            <p className="text-sm text-tribe-light/40">
              Access is restricted to admin-approved members.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full pt-4">
            <Link href="/auth/invite" className="w-full">
              <Button variant="outline" fullWidth size="lg">
                Enter Invite Code
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full">
              <Button variant="ghost" fullWidth size="sm" className="text-tribe-light/50 hover:text-white">
                Member Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer / Copyright */}
      <footer className="absolute bottom-6 text-xs text-tribe-light/20">
        &copy; {new Date().getFullYear()} TheTribe. All rights reserved.
      </footer>
    </main>
  );
}
