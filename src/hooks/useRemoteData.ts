import { useEffect, useState } from 'react'
import { REMOTE_DATA_ENABLED, fetchRemoteJson } from '@/lib/remoteData'

export type RemoteDataStatus = 'bundled' | 'loading' | 'remote' | 'error'

export interface RemoteData<T> {
  data: T
  status: RemoteDataStatus
}

/**
 * Loads a dataset from a GitHub-hosted JSON file at runtime, starting
 * from the bundled fallback so there is never an empty flash.
 *
 * @param file      JSON file name relative to the configured base, e.g. "products.json"
 * @param fallback  The compiled-in data used until (or unless) the remote loads
 */
export function useRemoteData<T>(file: string, fallback: T): RemoteData<T> {
  const [data, setData] = useState<T>(fallback)
  const [status, setStatus] = useState<RemoteDataStatus>('bundled')

  useEffect(() => {
    if (!REMOTE_DATA_ENABLED) return

    let active = true
    setStatus('loading')

    fetchRemoteJson<T>(file)
      .then((remote) => {
        if (!active) return
        setData(remote)
        setStatus('remote')
      })
      .catch((err) => {
        if (!active) return
        console.warn(
          `[data] "${file}" remote load failed — using bundled data.`,
          err
        )
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [file])

  return { data, status }
}
