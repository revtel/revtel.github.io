import type { ReactNode } from 'react';

export function Button({ children, href, primary = false }: {
  children: ReactNode;
  href: string;
  primary?: boolean;
}) {
  return (
    <a className={`button ${primary ? 'primary' : 'secondary'}`} href={href}>
      {children}<span aria-hidden="true">↗</span>
    </a>
  );
}

// Localized headings use only explicit line breaks; render all other copy as text.
export function Lines({ text }: { text: string }) {
  return text.split(/<br\s*\/?>/).map((line, index) => (
    <span key={index}>{index > 0 ? <br /> : null}{line}</span>
  ));
}
