// Thin loader for Spotify's official Embed IFrame API. It lets us start
// playback programmatically and — crucially — receive real playback events,
// so the card can reflect true play/pause state instead of guessing.
// Docs: https://developer.spotify.com/documentation/embeds/references/iframe-api

export interface SpotifyController {
  play: () => void
  pause: () => void
  togglePlay: () => void
  resume: () => void
  destroy: () => void
  loadUri: (uri: string) => void
  addListener: (event: string, cb: (e: SpotifyPlaybackEvent) => void) => void
}

export interface SpotifyPlaybackEvent {
  data: {
    isPaused: boolean
    isBuffering: boolean
    duration: number
    position: number
  }
}

interface SpotifyIFrameAPI {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: SpotifyController) => void
  ) => void
}

let apiPromise: Promise<SpotifyIFrameAPI> | null = null

/** Loads the Spotify IFrame API once and resolves with the API object. */
export function getSpotifyIframeApi(): Promise<SpotifyIFrameAPI> {
  if (apiPromise) return apiPromise

  apiPromise = new Promise<SpotifyIFrameAPI>((resolve) => {
    const w = window as unknown as {
      __spotifyIframeApi?: SpotifyIFrameAPI
      onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void
    }

    if (w.__spotifyIframeApi) {
      resolve(w.__spotifyIframeApi)
      return
    }

    w.onSpotifyIframeApiReady = (api) => {
      w.__spotifyIframeApi = api
      resolve(api)
    }

    if (!document.getElementById('spotify-iframe-api')) {
      const s = document.createElement('script')
      s.id = 'spotify-iframe-api'
      s.src = 'https://open.spotify.com/embed/iframe-api/v1'
      s.async = true
      document.body.appendChild(s)
    }
  })

  return apiPromise
}
