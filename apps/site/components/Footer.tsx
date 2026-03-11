import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-navy-200 bg-navy-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900">
                <span className="text-sm font-bold text-amber-400">T</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-navy-900">
                Tell
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-navy-500">
              The open standard for encoding strategic intent. Machine-readable. Human-meaningful.
            </p>
          </div>

          {/* Protocol */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-400">
              Protocol
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/install" className="text-sm text-navy-600 transition-colors hover:text-navy-900">
                  Install
                </Link>
              </li>
              <li>
                <Link href="/cli" className="text-sm text-navy-600 transition-colors hover:text-navy-900">
                  CLI Reference
                </Link>
              </li>
              <li>
                <Link href="/spec" className="text-sm text-navy-600 transition-colors hover:text-navy-900">
                  Specification
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-sm text-navy-600 transition-colors hover:text-navy-900">
                  Getting Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-400">
              Community
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://github.com/apophenic/tell-protocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-navy-600 transition-colors hover:text-navy-900"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/apophenic/tell-protocol/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-navy-600 transition-colors hover:text-navy-900"
                >
                  Report an Issue
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/apophenic/tell-protocol/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-navy-600 transition-colors hover:text-navy-900"
                >
                  Contributing
                </a>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-navy-400">
              Platform
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://apophenic.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-navy-600 transition-colors hover:text-navy-900"
                >
                  Apophenic
                </a>
              </li>
              <li>
                <Link href="/about" className="text-sm text-navy-600 transition-colors hover:text-navy-900">
                  About Tell
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-navy-200 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-navy-400">
              Tell is an open protocol.{' '}
              <a
                href="https://apophenic.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-500 underline decoration-navy-300 underline-offset-2 transition-colors hover:text-navy-700"
              >
                Apophenic
              </a>{' '}
              is the canonical implementation.
            </p>
            <p className="text-xs text-navy-400">
              &copy; {new Date().getFullYear()} Apophenic Pty Ltd
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
