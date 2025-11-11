import type { ReactNode, JSX } from 'react';

/**
 * Auth layout - no sidebar or header
 * Auth pages should be standalone
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return <>{children}</>;
}

