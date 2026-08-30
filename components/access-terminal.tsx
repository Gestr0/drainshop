'use client'

import { useState } from 'react'
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  Terminal,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PAYMENT,
  isKnownKey,
  isValidKeyFormat,
  issueKey,
} from '@/lib/access'

type Mode = 'acquire' | 'login'
type Step = 'intro' | 'pay' | 'verifying' | 'issued'

export function AccessTerminal({
  onGranted,
}: {
  onGranted?: (key: string) => void
}) {
  const [mode, setMode] = useState<Mode>('acquire')
  const [step, setStep] = useState<Step>('intro')
  const [issuedKey, setIssuedKey] = useState('')
  const [copied, setCopied] = useState<'addr' | 'key' | null>(null)

  const [keyInput, setKeyInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [granted, setGranted] = useState(false)

  async function copy(value: string, which: 'addr' | 'key') {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(which)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  function confirmPayment() {
    setStep('verifying')
    // simulated on-chain scan
    setTimeout(() => {
      setIssuedKey(issueKey())
      setStep('issued')
    }, 2600)
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const key = keyInput.trim().toUpperCase()
    if (!isValidKeyFormat(key)) {
      setLoginError('INVALID FORMAT — KEY MUST BE 10 LETTERS [A-Z]')
      setGranted(false)
      return
    }
    if (!isKnownKey(key)) {
      setLoginError('ACCESS DENIED — KEY NOT RECOGNIZED')
      setGranted(false)
      return
    }
    setLoginError('')
    setGranted(true)
    onGranted?.(key)
  }

  return (
    <div className="w-full max-w-md">
      {/* window chrome */}
      <div className="box-glow overflow-hidden rounded-lg border border-border bg-card/80 backdrop-blur-md">
        <header className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          <div className="ml-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Terminal className="h-3.5 w-3.5" />
            <span>root@drainshop:~/access</span>
          </div>
        </header>

        {/* mode tabs */}
        <div className="grid grid-cols-2 border-b border-border text-xs font-medium tracking-widest">
          <button
            onClick={() => setMode('acquire')}
            className={`px-4 py-3 uppercase transition-colors ${
              mode === 'acquire'
                ? 'bg-primary/10 text-primary text-glow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Acquire Key
          </button>
          <button
            onClick={() => setMode('login')}
            className={`border-l border-border px-4 py-3 uppercase transition-colors ${
              mode === 'login'
                ? 'bg-primary/10 text-primary text-glow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Login
          </button>
        </div>

        <div className="p-5">
          {mode === 'acquire' ? (
            <AcquirePanel
              step={step}
              setStep={setStep}
              issuedKey={issuedKey}
              copied={copied}
              copy={copy}
              confirmPayment={confirmPayment}
              goLogin={() => {
                setMode('login')
                setKeyInput(issuedKey)
                setLoginError('')
              }}
            />
          ) : (
            <LoginPanel
              keyInput={keyInput}
              setKeyInput={setKeyInput}
              loginError={loginError}
              granted={granted}
              onSubmit={handleLogin}
              reset={() => {
                setGranted(false)
                setKeyInput('')
                setLoginError('')
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- ACQUIRE ----------------------------- */

function AcquirePanel({
  step,
  setStep,
  issuedKey,
  copied,
  copy,
  confirmPayment,
  goLogin,
}: {
  step: Step
  setStep: (s: Step) => void
  issuedKey: string
  copied: 'addr' | 'key' | null
  copy: (v: string, w: 'addr' | 'key') => void
  confirmPayment: () => void
  goLogin: () => void
}) {
  if (step === 'intro') {
    return (
      <div className="flex flex-col gap-4">
        <Line prompt>initializing secure channel...</Line>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Access to the network requires a one-time key. Purchase unlocks a
          unique <span className="text-primary">10-character</span> credential
          bound to this node.
        </p>
        <div className="rounded-md border border-border bg-secondary/30 p-3 text-xs">
          <Row label="PRICE" value={`${PAYMENT.amount} ${PAYMENT.currency}`} />
          <Row label="NETWORK" value={PAYMENT.network} />
          <Row label="KEY LENGTH" value="10 x [A-Z]" />
        </div>
        <Button
          className="w-full gap-2 font-medium tracking-widest"
          onClick={() => setStep('pay')}
        >
          <Wallet className="h-4 w-4" />
          INITIATE PAYMENT
        </Button>
      </div>
    )
  }

  if (step === 'pay') {
    return (
      <div className="flex flex-col gap-4">
        <Line prompt>awaiting transfer of {PAYMENT.amount} {PAYMENT.currency}</Line>
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Amount due
          </span>
          <span className="text-2xl font-bold text-primary text-glow">
            {PAYMENT.amount} <span className="text-base">{PAYMENT.currency}</span>
          </span>
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Deposit address ({PAYMENT.network})
          </span>
          <div className="mt-1.5 flex items-stretch gap-2">
            <code className="flex-1 break-all rounded-md border border-border bg-background/60 p-2.5 text-xs text-accent">
              {PAYMENT.address}
            </code>
            <button
              onClick={() => copy(PAYMENT.address, 'addr')}
              aria-label="Copy address"
              className="flex w-10 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/40 text-muted-foreground transition-colors hover:text-primary"
            >
              {copied === 'addr' ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            className="w-full gap-2 font-medium tracking-widest"
            onClick={confirmPayment}
          >
            <ShieldCheck className="h-4 w-4" />
            I HAVE SENT PAYMENT
          </Button>
          <Button
            variant="ghost"
            className="w-full text-xs text-muted-foreground"
            onClick={() => setStep('intro')}
          >
            cancel
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'verifying') {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="w-full space-y-1.5 text-left text-xs">
          <Line prompt>connecting to mempool...</Line>
          <Line prompt>scanning inbound transactions...</Line>
          <Line prompt>
            verifying {PAYMENT.amount} {PAYMENT.currency} transfer
            <span className="animate-blink">_</span>
          </Line>
        </div>
      </div>
    )
  }

  // issued
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-primary text-glow">
        <ShieldCheck className="h-5 w-5" />
        <span className="text-sm font-bold uppercase tracking-widest">
          Payment confirmed
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Your unique access key has been generated. Store it securely — it will
        not be shown again.
      </p>
      <div>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Access key
        </span>
        <div className="mt-1.5 flex items-stretch gap-2">
          <code className="flex-1 rounded-md border border-primary/50 bg-primary/10 p-3 text-center text-xl font-bold tracking-[0.35em] text-primary text-glow">
            {issuedKey}
          </code>
          <button
            onClick={() => copy(issuedKey, 'key')}
            aria-label="Copy key"
            className="flex w-11 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/40 text-muted-foreground transition-colors hover:text-primary"
          >
            {copied === 'key' ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <Button
        className="w-full gap-2 font-medium tracking-widest"
        onClick={goLogin}
      >
        <KeyRound className="h-4 w-4" />
        PROCEED TO LOGIN
      </Button>
    </div>
  )
}

/* ------------------------------ LOGIN ------------------------------ */

function LoginPanel({
  keyInput,
  setKeyInput,
  loginError,
  granted,
  onSubmit,
  reset,
}: {
  keyInput: string
  setKeyInput: (v: string) => void
  loginError: string
  granted: boolean
  onSubmit: (e: React.FormEvent) => void
  reset: () => void
}) {
  if (granted) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="relative">
          <ShieldCheck className="h-12 w-12 text-primary text-glow" />
        </div>
        <div className="space-y-1.5 text-left text-xs">
          <Line prompt>key accepted</Line>
          <Line prompt>establishing encrypted session...</Line>
          <Line prompt>
            <span className="text-primary text-glow">ACCESS GRANTED</span>
            <span className="animate-blink">_</span>
          </Line>
        </div>
        <Button
          variant="ghost"
          className="text-xs text-muted-foreground"
          onClick={reset}
        >
          log out
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Line prompt>authenticate with access key</Line>
      <div>
        <label
          htmlFor="access-key"
          className="text-xs uppercase tracking-widest text-muted-foreground"
        >
          Access key
        </label>
        <div className="mt-1.5 flex items-center gap-2 rounded-md border border-border bg-background/60 px-3 focus-within:border-primary/60">
          <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            id="access-key"
            value={keyInput}
            onChange={(e) =>
              setKeyInput(
                e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10),
              )
            }
            placeholder="XXXXXXXXXX"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent py-3 text-lg tracking-[0.3em] text-primary outline-none placeholder:tracking-[0.3em] placeholder:text-muted-foreground/40"
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/70">
          <span>10 letters [A-Z]</span>
          <span>{keyInput.length}/10</span>
        </div>
      </div>

      {loginError && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {loginError}
        </p>
      )}

      <Button type="submit" className="w-full gap-2 font-medium tracking-widest">
        <KeyRound className="h-4 w-4" />
        AUTHENTICATE
      </Button>
    </form>
  )
}

/* ---------------------------- primitives --------------------------- */

function Line({
  children,
  prompt,
}: {
  children: React.ReactNode
  prompt?: boolean
}) {
  return (
    <p className="font-mono text-xs text-muted-foreground">
      {prompt && <span className="mr-1.5 text-primary">$</span>}
      {children}
    </p>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-primary">{value}</span>
    </div>
  )
}
