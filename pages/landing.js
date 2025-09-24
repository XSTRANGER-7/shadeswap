import Head from 'next/head'
import Link from 'next/link'

export default function Landing() {
  const title = 'ShadeSwap — Trade Privately'
  const description = 'Privacy-first DEX with anonymous personas on Oasis Sapphire and Uniswap.'
  const ogImage = 'https://dummyimage.com/1200x630/0a0a0a/e5e7eb&text=ShadeSwap'

  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60 bg-neutral-950 border-b border-neutral-900">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-white text-neutral-900 flex items-center justify-center font-black" aria-hidden>SS</div>
            <span className="text-base sm:text-lg font-semibold tracking-tight">ShadeSwap</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-300" aria-label="Primary">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/app" className="btn btn-primary" aria-label="Open the app">Open App</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="animate-fade-up [animation-delay:80ms] opacity-0">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="chip">Oasis Sapphire</span>
              <span className="chip">Uniswap V3</span>
              <span className="chip">Private Personas</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
              Trade privately with shape‑shifting personas
            </h1>
            <p className="mt-4 text-gray-400 text-base sm:text-lg max-w-prose">
              Create multiple identities per wallet and swap tokens without linking your real address to trading activity. Powered by confidential compute on Sapphire.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/app" className="btn btn-primary">Launch App</Link>
              <a href="#features" className="btn btn-ghost">See Features</a>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[{k:'Personas',v:'Multi'}, {k:'Mid‑trade',v:'Switch'}, {k:'History',v:'Per‑identity'}].map(({k,v},i)=> (
                <div key={k} className="card animate-fade-up opacity-0" style={{animationDelay:`${120 + i*60}ms`}}><div className="card-body py-3">
                  <div className="text-sm text-gray-400">{k}</div>
                  <div className="text-lg text-white font-medium">{v}</div>
                </div></div>
              ))}
            </div>
          </div>
          <div className="relative animate-fade-up [animation-delay:160ms] opacity-0">
            {/* Simple product mock */}
            <div className="card hover:translate-y-[-2px] transition-transform duration-300">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white text-neutral-900 flex items-center justify-center font-semibold">D</div>
                  <div>
                    <div className="text-sm text-white font-medium">Degen Ape</div>
                    <div className="text-xs text-gray-400">Active persona</div>
                  </div>
                  <span className="ml-auto chip">Private</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">From</div>
                    <div className="input">1.00 ETH</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">To (est.)</div>
                    <div className="input">1795.20 DAI</div>
                  </div>
                </div>
                <button className="btn btn-primary w-full mt-4">Simulate Swap</button>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-48 sm:w-56 card rotate-3 animate-fade-up opacity-0 [animation-delay:220ms]">
              <div className="card-body">
                <div className="text-xs text-gray-400">Recent swaps</div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-300">ETH → DAI</span><span className="text-white">+1795</span></div>
                  <div className="flex justify-between"><span className="text-gray-300">UNI → ETH</span><span className="text-white">+0.42</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="mx-auto max-w-6xl px-4 py-6 animate-fade-up opacity-0 [animation-delay:240ms]">
        <div className="card"><div className="card-body">
          <div className="text-center text-sm text-gray-400 mb-4">Trusted by builders</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-gray-500 text-sm">
            {['TOZO','Cocokind','Oxyfresh','Belieft'].map(x => (
              <div key={x} className="border border-neutral-800 rounded-md py-3 text-center hover:bg-neutral-900 transition-colors">{x}</div>
            ))}
          </div>
        </div></div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6">Why ShadeSwap</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {title:'Create Personas', desc:'Spin up multiple identities per wallet with confidential metadata stored on Sapphire.', icon:'🧩'},
            {title:'Switch Mid‑Trade', desc:'Split a single flow across personas to fragment on‑chain traces.', icon:'🎛️'},
            {title:'Private History', desc:'View per‑persona swaps privately; only you can access your logs.', icon:'🔐'},
          ].map(({title,desc,icon},i) => (
            <div key={title} className="card animate-fade-up opacity-0" style={{animationDelay:`${i*80}ms`}}>
              <div className="card-body">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-white font-medium mb-1">{title}</div>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[{n:'2%',l:'Default slippage in sim'}, {n:'3‑4h',l:'MVP build scope'}, {n:'V3',l:'Uniswap router'}].map(({n,l},i) => (
            <div key={l} className="card animate-fade-up opacity-0" style={{animationDelay:`${i*60}ms`}}><div className="card-body text-center">
              <div className="text-3xl text-white font-semibold">{n}</div>
              <div className="text-sm text-gray-400">{l}</div>
            </div></div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {step:'01', title:'Create personas', desc:'Give them names and optional metadata.'},
            {step:'02', title:'Pick active persona', desc:'Swap on Uniswap under that identity.'},
            {step:'03', title:'Switch anytime', desc:'Even mid‑trade for the demo.'},
          ].map(({step,title,desc},i) => (
            <div key={step} className="card animate-fade-up opacity-0" style={{animationDelay:`${i*80}ms`}}>
              <div className="card-body">
                <div className="chip">Step {step}</div>
                <div className="mt-2 text-white font-medium">{title}</div>
                <p className="text-gray-400 text-sm mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12 animate-fade-up opacity-0 [animation-delay:120ms]">
        <div className="card">
          <div className="card-body flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-white text-xl font-semibold">Ready to shapeshift your trades?</div>
              <div className="text-gray-400 text-sm">Open the app and create your first persona.</div>
            </div>
            <Link href="/app" className="btn btn-primary">Open App</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6">FAQ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{
            q: 'What networks are supported?',
            a: 'The MVP targets Oasis Sapphire. The UI includes a simulation mode when no router is set.'
          },{
            q: 'How are personas private?',
            a: 'Persona metadata and per-identity history are stored and processed with Sapphire confidential compute.'
          },{
            q: 'Can I switch persona mid‑trade?',
            a: 'Yes, the demo includes an optional mid‑trade switch prior to swap execution.'
          },{
            q: 'Is this production ready?',
            a: 'This is an MVP for demos. Always review code and contracts before mainnet use.'
          }].map(({q,a}, i) => (
            <div key={q} className="card animate-fade-up opacity-0" style={{animationDelay: `${i*60}ms`}}>
              <div className="card-body">
                <div className="text-white font-medium mb-1">{q}</div>
                <p className="text-sm text-gray-400">{a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 border-t border-neutral-900">
        <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-md bg-white text-neutral-900 flex items-center justify-center font-black">SS</div>
              <span className="text-white font-semibold">ShadeSwap</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm">Privacy-first trading with personas. Built on Oasis Sapphire & Uniswap.</p>
          </div>
          <div className="text-sm">
            <div className="text-gray-300 font-medium mb-2">Product</div>
            <ul className="space-y-1 text-gray-400">
              <li><Link className="hover:text-white" href="/app">Open App</Link></li>
              <li><a className="hover:text-white" href="#features">Features</a></li>
              <li><a className="hover:text-white" href="#how">How it works</a></li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="text-gray-300 font-medium mb-2">Community</div>
            <ul className="space-y-1 text-gray-400">
              <li><a className="hover:text-white" href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a></li>
              <li><a className="hover:text-white" href="https://discord.com" target="_blank" rel="noreferrer">Discord</a></li>
              <li><a className="hover:text-white" href="https://github.com" target="_blank" rel="noreferrer">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 py-6 border-t border-neutral-900">© {new Date().getFullYear()} ShadeSwap</div>
      </footer>

      {/* Page animations (minimal) */}
      <style jsx global>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fade-up .5s ease-out forwards; }
      `}</style>
    </div>
  )
}
