import { Providers } from '@/app/providers'
import { AppShell } from '@/components/shared/app-shell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  )
}
