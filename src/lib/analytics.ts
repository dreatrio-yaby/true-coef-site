// Google Analytics event tracking utilities

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
  }
}

// Track page views
export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
      page_path: url,
    })
  }
}

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Предопределенные события для вашего приложения

export const trackBetTypeChange = (betType: string) => {
  event({
    action: 'bet_type_change',
    category: 'filters',
    label: betType,
  })
}

export const trackBookmakerSelect = (bookmaker: string) => {
  event({
    action: 'bookmaker_select',
    category: 'filters',
    label: bookmaker,
  })
}

export const trackProfitabilityFilter = (enabled: boolean) => {
  event({
    action: 'profitability_filter_toggle',
    category: 'filters',
    label: enabled ? 'enabled' : 'disabled',
  })
}

export const trackMatchClick = (matchId: string) => {
  event({
    action: 'match_click',
    category: 'engagement',
    label: matchId,
  })
}

export const trackOddsView = (betType: string, profitability: string) => {
  event({
    action: 'odds_view',
    category: 'engagement',
    label: `${betType}_${profitability}`,
  })
}
