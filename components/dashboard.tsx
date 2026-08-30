'use client'

import { useState } from 'react'
import {
  Activity,
  Boxes,
  Cpu,
  Fingerprint,
  Gauge,
  LogOut,
  Radar,
  ShieldCheck,
  Terminal,
  Wallet,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type Product = {
  id: string
  name: string
  tag: string
  price: string
  desc: string
  status: 'live' | 'beta' | 'sold out'
  icon: React.ComponentType<{ className?: string }>
}

const PRODUCTS: Product[] = [
  {
    id: 'multi-chain',
    name: 'Multi-Chain Drainer',
    tag: 'EVM · SOL · TON',
    price: '0.35 BTC',
    desc: 'Universal wallet interaction module supporting 40+ chains with auto token-priority sweeping.',
    status: 'live',
    icon: Boxes,
  },
  {
    id: 'seaport',
    name: 'Seaport NFT Kit',
    tag: 'ERC-721 / 1155',
    price: '0.18 BTC',
    desc: 'Signature-based NFT collection transfer toolkit with gasless approval flows.',
    status: 'live',
    icon: Fingerprint,
  },
  {
    id: 'permit2',
    name: 'Permit2 Engine',
    tag: 'Uniswap Permit2',
    price: '0.22 BTC',
    desc: 'Batch permit signature harvester with automatic allowance escalation.',
    status: 'beta',
    icon: Cpu,
  },
  {
    id: 'phishing-cdn',
    name: 'Cloaked CDN',
    tag: 'Anti-bot · TDS',
    price: '0.09 BTC',
    desc: 'Bulletproof front-end delivery with referrer filtering and crawler evasion.',
    status: 'live',
    icon: Radar,
  },
  {
    id: 'drain-panel',
    name: 'Ops Control Panel',
    tag: 'Realtime C2',
    price: '0.14 BTC',
    desc: 'Live victim telemetry, balance sniping and auto-payout routing dashboard.',
    status: 'live',
    icon: Gauge,
  },
  {
    id: 'flash-mixer',
    name: 'Flash Mixer',
    tag: 'Privacy',
    price: '0.27 BTC',
    desc: 'Multi-hop tumbling with randomized delays and fresh-wallet distribution.',
    status: 'sold out',
    icon: Zap,
  },
]

const STATS = [
  { label: 'Active nodes', value: '1,204', icon: Activity },
  { label: 'Volume 24h', value: '38.7 BTC', icon: Wallet },
  { label: 'Uptime', value: '99.98%', icon: ShieldCheck },
]

const NEWS = [
  {
    tag: 'UPDATE',
    text: 'Multi-Chain Drainer v4.2 — added TON + Tron sweeping and 30% faster signature relay.',
  },
  {
    tag: 'NEWS',
    text: 'New bulletproof CDN region deployed. Reduced detection rate on major wallets.',
  },
  {
    tag: 'NOTICE',
    text: 'Permit2 Engine exits beta next cycle. Early-access pricing ends soon.',
  },
]

export function Dashboard({
  accessKey,
  onLogout,
}: {
  accessKey: string
  onLogout: () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <main className="cyber-grid relative min-h-screen bg-background">
      <div
        className="pointer-events-none absolute right-0 top-0 h-[50vh] w-[50vh] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, oklch(0.83 0.21 148 / 0.2), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        {/* top bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-primary text-glow" />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                DRAINER<span className="text-primary text-glow">SHOP</span>
              </h1>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Marketplace console
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2 sm:flex">
              <Fingerprint className="h-4 w-4 text-primary" />
              <code className="text-xs tracking-[0.25em] text-primary">
                {accessKey}
              </code>
            </div>
            <Button
              variant="ghost"
              className="gap-2 text-xs text-muted-foreground hover:text-destructive"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">LOG OUT</span>
            </Button>
          </div>
        </header>

        {/* news / updates banner */}
        <section className="mt-6 overflow-hidden rounded-lg border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 border-b border-primary/20 px-4 py-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary text-glow">
              Updates &amp; News
            </span>
          </div>
          <ul className="divide-y divide-border">
            {NEWS.map((n) => (
              <li
                key={n.text}
                className="flex items-start gap-3 px-4 py-2.5 text-xs"
              >
                <span className="shrink-0 rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-accent">
                  {n.tag}
                </span>
                <span className="text-muted-foreground">{n.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* stats */}
        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-lg border border-border bg-card/60 p-4"
            >
              <s.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* products */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
              Services
            </h2>
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {PRODUCTS.length} listings
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p) => {
              const active = selected === p.id
              const soldOut = p.status === 'sold out'
              return (
                <article
                  key={p.id}
                  className={`box-glow flex flex-col rounded-lg border bg-card/70 p-4 transition-colors ${
                    active ? 'border-primary/70' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-secondary/40">
                      <p.icon className="h-5 w-5 text-primary" />
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-foreground">
                    {p.name}
                  </h3>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {p.tag}
                  </p>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-base font-bold text-primary text-glow">
                      {p.price}
                    </span>
                    <Button
                      size="sm"
                      disabled={soldOut}
                      variant={active ? 'default' : 'secondary'}
                      className="h-8 gap-1.5 text-xs tracking-widest"
                      onClick={() => setSelected(active ? null : p.id)}
                    >
                      {soldOut ? 'SOLD OUT' : active ? 'SELECTED' : 'ACQUIRE'}
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <footer className="mt-10 border-t border-border pt-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground/60">
          Session encrypted · node {accessKey.slice(0, 4)}··{accessKey.slice(-2)}
        </footer>
      </div>
    </main>
  )
}

function StatusBadge({ status }: { status: Product['status'] }) {
  const map = {
    live: 'border-primary/40 bg-primary/10 text-primary',
    beta: 'border-accent/40 bg-accent/10 text-accent',
    'sold out': 'border-destructive/40 bg-destructive/10 text-destructive',
  } as const
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${map[status]}`}
    >
      {status}
    </span>
  )
}
