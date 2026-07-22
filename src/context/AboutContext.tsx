import { createContext, useContext, type ReactNode } from 'react'
import type { AboutData } from '@/lib/types'
import aboutData from '@data/about.json'
import { useRemoteData, type RemoteDataStatus } from '@/hooks/useRemoteData'

const FALLBACK = aboutData as unknown as AboutData

interface AboutContextValue {
  about: AboutData
  status: RemoteDataStatus
}

const AboutContext = createContext<AboutContextValue>({
  about: FALLBACK,
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
  return (
    <AboutContext.Provider value={{ about: data, status }}>
      {children}
    </AboutContext.Provider>
  )
}

/** The active About data (bundled or remote). */
export function useAbout(): AboutData {
  return useContext(AboutContext).about
}
