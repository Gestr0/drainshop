import { Globe } from '@/components/globe'
import { AccessTerminal } from '@/components/access-terminal'

export default function Home() {
  return (
    <main className="cyber-grid relative min-h-screen overflow-hidden bg-background">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, oklch(0.83 0.21 148 / 0.25), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-10 px-6 py-10 lg:flex-row lg:justify-between lg:gap-16 lg:py-16">
        {/* left: identity + globe */}
        <section className="flex w-full flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-foreground text-balance sm:text-5xl">
            DRAINER<span className="text-primary text-glow">SHOP</span>
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
            Global access grid. Nodes are pinging in real time across the
            network. Acquire a key to jack in.
          </p>

          <div className="relative mt-4 w-full max-w-md animate-flicker">
            <Globe />
            <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-6 text-[10px] uppercase tracking-widest text-muted-foreground/70">
              <span>lat 40.71</span>
              <span>lon -74.00</span>
              <span>nodes 10</span>
            </div>
          </div>
        </section>

        {/* right: access terminal */}
        <section className="flex w-full justify-center lg:w-auto lg:justify-end">
          <AccessTerminal />
        </section>
      </div>
    </main>
  )
}
