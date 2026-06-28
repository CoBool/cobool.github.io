import type { Ga4Config } from "@/config/integrations"

type GoogleAnalyticsProps = Readonly<{
  config: Ga4Config
}>

export function GoogleAnalytics({ config }: GoogleAnalyticsProps) {
  if (!config.enabled) {
    return null
  }

  const gtagSource = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.measurementId)}`
  const inlineConfig = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${config.measurementId}');
`

  return (
    <>
      <script src={gtagSource} async />
      <script>{inlineConfig}</script>
    </>
  )
}
