import type { Ga4Config } from "@/config/integrations"

type GoogleAnalyticsProps = Readonly<{
  config: Ga4Config
}>

export function GoogleAnalytics({ config }: GoogleAnalyticsProps) {
  if (!config.enabled) {
    return null
  }

  const gtagSource = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.measurementId)}`
  const inlineConfig = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());var el=document.querySelector('script[data-ga-measurement-id]');if(el){var id=el.getAttribute('data-ga-measurement-id');if(id)gtag('config',id);}`

  return (
    <>
      <script async data-ga-measurement-id={config.measurementId} src={gtagSource} />
      <script>{inlineConfig}</script>
    </>
  )
}
