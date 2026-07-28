import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { AboutData, ResolvedAboutData } from '@/lib/types'
import aboutData from '@data/about.json'
import { normalizeSocial } from '@/lib/social'
import { useRemoteData, type RemoteDataStatus } from '@/hooks/useRemoteData'

const FALLBACK = aboutData as unknown as AboutData

/** Normalizes the social groups once, here, so no consumer has to guard for a
    missing or legacy key. See src/lib/social.ts for why either can occur.
    `data` itself is treated as possibly absent for the same reason: the runtime
    copy comes off the network. */
function resolve(data: AboutData | undefined | null): ResolvedAboutData {
  return { ...data, social: normalizeSocial(data?.social) } as ResolvedAboutData
}

interface AboutContextValue {
  about: ResolvedAboutData
  status: RemoteDataStatus
}

const AboutContext = createContext<AboutContextValue>({
  about: resolve(FALLBACK),
  status: 'bundled',
})

/**
 * Provides the About/company data (people, KPIs, capabilities, social links)
 * to the whole app from a single source. Starts from the bundled about.json
 * and, when a GitHub data base is configured, swaps in the newest committed
 * version at runtime — so the footer, contact page, and about page all update
 * together when the file is edited live.
 */
export function AboutProvider({ children }: { children: ReactNode }) {
  const { data, status } = useRemoteData<AboutData>('about.json', FALLBACK)
  // Memoized so the normalized groups aren't rebuilt (and every consumer
  // re-rendered) on unrelated renders of the provider.
  const value = useMemo(() => ({ about: resolve(data), status }), [data, status])

  return <AboutContext.Provider value={value}>{children}</AboutContext.Provider>
}

/** The active About data (bundled or remote), social groups normalized. */
export function useAbout(): ResolvedAboutData {
  return useContext(AboutContext).about
}
