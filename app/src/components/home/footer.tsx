"use client";

export function Footer() {
  return (
    <footer
      className="w-full py-6 px-4 border-t-4"
      style={{
        borderColor: 'var(--fallout-brass)',
        backgroundColor: 'var(--fallout-cream)'
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-6 text-sm">
        <a
          href="/privacy"
          className="hover:underline font-medium"
          style={{
            color: 'var(--fallout-brown)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Confidentialité
        </a>
        <span style={{ color: 'var(--fallout-border)' }}>•</span>
        <a
          href="/terms"
          className="hover:underline font-medium"
          style={{
            color: 'var(--fallout-brown)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Conditions d'utilisation
        </a>
        <span style={{ color: 'var(--fallout-border)' }}>•</span>
        <a
          href="/about"
          className="hover:underline font-medium"
          style={{
            color: 'var(--fallout-brown)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          À propos
        </a>
      </div>
    </footer>
  );
}
