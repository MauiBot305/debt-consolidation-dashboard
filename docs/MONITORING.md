# Monitoring & Alerting

## Built-in
- **Cloudflare Analytics:** Free, automatic via Pages dashboard
- **Worker Analytics:** Available in Cloudflare Workers dashboard

## Recommended Setup
1. **UptimeRobot** — Free tier, monitor https://debt.alldayautomations.ai every 5 min
2. **Sentry** — Error tracking (script tag ready in index.html, just uncomment and add DSN)
3. **Cloudflare Web Analytics** — Privacy-focused, no-cookie analytics

## Sentry Setup
1. Create account at sentry.io
2. Create a Browser JavaScript project
3. Add DSN to index.html:
```html
<script src="https://browser.sentry-cdn.com/8.x.x/bundle.min.js" crossorigin="anonymous"></script>
<script>Sentry.init({ dsn: 'YOUR_DSN_HERE' });</script>
```

## Health Endpoints
- Twilio Worker: `GET /health`
- Dashboard Worker: `GET /health`
