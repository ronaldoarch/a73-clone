import * as Sentry from '@sentry/vue'

export function initSentry(app, router) {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) {
    console.warn('[Sentry] No DSN configured, skipping initialization')
    return
  }

  Sentry.init({
    app,
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        networkDetailAllowUrls: ['/api']
      }),
      Sentry.feedbackIntegration({
        colorScheme: 'dark',
        isNameRequired: false,
        isEmailRequired: false,
        buttonLabel: 'Feedback',
        submitButtonLabel: 'Enviar',
        cancelButtonLabel: 'Cancelar',
        formTitle: 'Enviar Feedback',
        messagePlaceholder: 'Descreva o problema...'
      })
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,
    tracePropagationTargets: ['localhost', /^\//],
    beforeSend(event) {
      if (import.meta.env.DEV) {
        console.debug('[Sentry Event]', event)
      }
      return event
    }
  })

  app.config.errorHandler = (err, vm, info) => {
    Sentry.captureException(err, {
      extra: { componentInfo: info }
    })
    console.error('[Vue Error]', err)
  }

  app.config.warnHandler = (msg, vm, trace) => {
    if (import.meta.env.PROD) {
      Sentry.captureMessage(msg, {
        level: 'warning',
        extra: { trace }
      })
    }
  }
}

export function captureError(error, context = {}) {
  Sentry.captureException(error, { extra: context })
}

export function captureMessage(message, level = 'info') {
  Sentry.captureMessage(message, { level })
}

export function setUser(user) {
  Sentry.setUser(user)
}

export function clearUser() {
  Sentry.setUser(null)
}

export function addBreadcrumb(breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb)
}
