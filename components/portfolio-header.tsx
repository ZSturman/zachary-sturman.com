export function PortfolioHeader() {
  return (
    <header className="mb-12 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
        Zachary Sturman
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
        A curated collection of projects spanning code, science, games, film, television, literature, and visual arts.
        Each piece represents a unique exploration of creativity and technical innovation.
      </p>
      <nav aria-label="Contact and social links" className="mt-6">
        <ul className="flex items-center justify-center gap-6 text-sm">
          <li>
            <a
              href="https://github.com/ZSturman"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-foreground hover:underline"
              aria-label="Zachary Sturman's GitHub"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.372 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577 0-.286-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.085 1.84 1.238 1.84 1.238 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.76-1.605-2.665-.303-5.467-1.334-5.467-5.932 0-1.31.468-2.382 1.235-3.222-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.243 2.874.12 3.176.77.84 1.233 1.912 1.233 3.222 0 4.61-2.807 5.625-5.479 5.921.43.372.823 1.102.823 2.222 0 1.604-.015 2.897-.015 3.293 0 .32.218.694.825.576C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/zachary-sturman"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-foreground hover:underline"
              aria-label="Zachary Sturman's LinkedIn"
            >
              {/* simple LinkedIn SVG to avoid depending on a missing icon file */}
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.2 8.98h4.56V24H.2V8.98zM9.58 8.98h4.37v2.05h.06c.61-1.16 2.1-2.38 4.33-2.38 4.63 0 5.48 3.05 5.48 7.02V24h-4.56v-7.21c0-1.72-.03-3.93-2.4-3.93-2.4 0-2.77 1.88-2.77 3.81V24H9.58V8.98z" />
              </svg>
              LinkedIn
            </a>
          </li>
          <li>
            <a href="/contact" className="text-muted-foreground hover:underline" aria-label="Contact page">
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
