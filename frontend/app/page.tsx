import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center relative overflow-x-hidden lg:items-start">
      {/* Background Elements - Subtle depth */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white/5 to-transparent opacity-20 pointer-events-none" />

      {/* Hero Section */}
      <section className="w-full max-w-md px-6 py-16 flex flex-col items-center text-center space-y-10 z-10 lg:max-w-none lg:min-h-screen lg:grid lg:grid-cols-12 lg:gap-16 lg:px-20 lg:py-0 lg:pt-16 lg:text-left lg:items-center lg:space-y-0">

        {/* Logo - Mobile: Top. Desktop: Right Column */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 lg:col-span-4 lg:col-start-9 lg:w-full lg:h-[500px] lg:flex lg:items-center lg:justify-end lg:pr-8">
          <div className="relative w-full h-full lg:w-[360px] lg:h-[360px]">
            <Image
              src="/logo.jpg"
              alt="TheTribe Logo"
              fill
              className="object-contain mix-blend-screen [mask-image:radial-gradient(circle,black_60%,transparent_100%)]"
              priority
            />
          </div>
        </div>

        {/* Text Content - Mobile: Bottom. Desktop: Left Column */}
        <div className="flex flex-col items-center text-center space-y-10 w-full lg:items-start lg:text-left lg:space-y-10 lg:order-first lg:col-span-7 lg:col-start-1 lg:row-start-1">

          <h1 className="text-3xl md:text-4xl lg:text-[4.5rem] lg:leading-[1.05] lg:tracking-[-0.02em] font-bold text-white lg:max-w-[680px]">
            A private members club meets a modern environment brooding disciplined men.
          </h1>

          <div className="w-16 h-[1px] bg-tribe-gold/50 lg:w-20 lg:my-2" />

          {/* Philosophy Section */}
          <div className="space-y-4 text-tribe-light/80 lg:space-y-5">
            <p className="text-lg font-medium lg:text-2xl lg:font-semibold lg:text-white lg:tracking-tight">
              Brotherhood. Growth. Accountability.
            </p>
            <p className="text-sm leading-relaxed max-w-xs mx-auto text-tribe-light/60 lg:text-lg lg:max-w-[480px] lg:mx-0 lg:leading-[1.7]">
              For founders, leaders, and professionals who value privacy, structure, and discipline.
            </p>
          </div>

          {/* Access / CTA Section */}
          <div className="w-full space-y-4 pt-8 lg:pt-6 lg:space-y-5">
            <div className="space-y-2 lg:space-y-3">
              <p className="text-xs uppercase tracking-widest text-tribe-gold/80 font-semibold lg:text-[13px] lg:tracking-[0.2em]">
                Invite Only
              </p>
              <p className="text-sm text-tribe-light/40 lg:text-base lg:text-tribe-light/50">
                Access is restricted to admin-approved members.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full pt-4 lg:flex-row lg:w-auto lg:gap-4 lg:pt-2">
              <Link href="/auth/invite" className="w-full lg:w-auto">
                <Button variant="outline" fullWidth={false} className="w-full lg:w-52 lg:h-13 lg:text-[15px]" size="lg">
                  Enter Invite Code
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full lg:w-auto">
                <Button variant="ghost" fullWidth={false} className="w-full lg:w-auto lg:px-6 lg:h-13 lg:text-[15px] text-tribe-light/50 hover:text-white" size="sm">
                  Member Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Exists Section - Connected to hero intent */}
      <section className="w-full max-w-md px-6 py-20 text-center z-10 lg:max-w-none lg:pt-0 lg:pb-48 lg:px-20 lg:text-left">
        <div className="lg:max-w-[640px]">
          <h2 className="text-xl font-bold text-white mb-8 lg:text-[28px] lg:font-semibold lg:mb-12 lg:tracking-tight lg:text-tribe-light/90">
            Why This Exists
          </h2>

          <div className="space-y-6 text-tribe-light/60 text-sm leading-relaxed lg:text-[16px] lg:leading-[2.1] lg:space-y-7">
            <p className="lg:text-tribe-light/60">
              Most environments for men today are either performative or chaotic.
            </p>

            <p className="lg:text-tribe-light/50">
              Social feeds reward noise. Networking events reward shallow connection.
              Masterminds reward whoever talks the loudest.
            </p>

            <p className="lg:text-white lg:font-medium lg:text-[19px] lg:py-6 lg:leading-[1.6]">
              TheTribe was built for the opposite.
            </p>

            <p className="lg:text-tribe-light/55">
              A space where conversations happen without an audience. Where growth is personal, not public.
              Where you are surrounded by men who take their craft, their families, and their character
              seriously—because they chose to, not because someone is watching.
            </p>

            <div className="pt-6 lg:pt-12 lg:border-l lg:border-tribe-gold/20 lg:pl-6 lg:ml-0">
              <p className="text-tribe-light/40 lg:text-tribe-light/45 lg:text-[15px] lg:italic lg:leading-[1.8]">
                This is not a community. It is an environment.
              </p>
              <p className="text-tribe-light/40 lg:text-tribe-light/35 lg:text-[15px] lg:mt-3">
                One designed for those who are already building, not looking to be sold to.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For Section - Asymmetric layout */}
      <section className="w-full max-w-md px-6 py-20 text-center z-10 lg:max-w-none lg:pt-24 lg:pb-56 lg:px-20 lg:text-left">
        {/* Desktop: 2-column asymmetric grid */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-20">
          {/* Left column - Who it's for */}
          <div className="lg:col-span-5 lg:col-start-1">
            <h2 className="text-xl font-bold text-white mb-8 lg:text-[28px] lg:font-semibold lg:mb-10 lg:tracking-tight">
              Who This Is For
            </h2>

            <div className="space-y-4 text-tribe-light/60 text-sm leading-relaxed lg:text-[15px] lg:leading-[2] lg:space-y-5 mb-12 lg:mb-0">
              <p className="lg:text-tribe-light/65">Founders, executives, and professionals who value privacy over popularity.</p>
              <p className="lg:text-tribe-light/65">Men who are already executing and seek sharpening, not motivation.</p>
              <p className="lg:text-tribe-light/65">Those who show up consistently, not just when convenient.</p>
            </div>
          </div>

          {/* Right column - Who it's not for (offset down) */}
          <div className="lg:col-span-4 lg:col-start-8 lg:pt-20">
            <h3 className="text-lg font-semibold text-tribe-light/40 mb-6 lg:text-[17px] lg:font-medium lg:mb-8 lg:text-tribe-light/30 lg:uppercase lg:tracking-[0.15em]">
              Not For
            </h3>

            <div className="space-y-4 text-tribe-light/40 text-sm leading-relaxed lg:text-[14px] lg:leading-[1.9] lg:space-y-4 lg:text-tribe-light/30">
              <p>Those seeking quick wins or instant community.</p>
              <p>Anyone uncomfortable with accountability, feedback, or silence.</p>
              <p>People looking for content consumption, not contribution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Statement - Resolves the page */}
      <section className="w-full max-w-md px-6 py-12 text-center z-10 lg:max-w-none lg:pt-0 lg:pb-24 lg:px-20 lg:text-left">
        <p className="text-tribe-light/20 text-xs lg:text-[13px] lg:tracking-[0.1em] lg:text-tribe-light/25">
          Application by invitation. Membership by approval.
        </p>
      </section>

      {/* Footer / Copyright */}
      <footer className="w-full py-16 text-center text-xs text-tribe-light/15 lg:py-20 lg:pb-12 lg:text-left lg:px-20">
        &copy; {new Date().getFullYear()} TheTribe. All rights reserved.
      </footer>
    </main>
  );
}

