# API Documentation

All endpoints require `Authorization: Bearer <API_SECRET>` header (except health checks).

## Twilio Worker

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check (no auth) |
| GET | /api/twilio/token?identity=X | Generate Twilio access token |
| POST | /api/twilio/sms | Send SMS. Body: `{to, body}` |
| POST | /api/twilio/hold | Toggle hold. Body: `{callSid, hold}` |
| POST | /api/twilio/record | Toggle recording. Body: `{callSid, record}` |
| POST | /api/twilio/transfer | Transfer call. Body: `{callSid, to}` |
| POST | /api/twilio/conference | 3-way call. Body: `{callSid, thirdPartyNumber}` |
| GET | /api/twilio/twiml/outbound?to=X | Generate outbound TwiML |

## Dashboard Worker

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check (no auth) |
| GET | /api/v1/dashboard/leads/search?q=X | Search leads (min 2 chars) |
| GET | /api/v1/dashboard/leads/:id | Get lead by ID |
| GET | /api/v1/dashboard/leads/by-phone/:phone | Get lead by phone |
| GET | /api/v1/dashboard/cases/:id | Get case by ID |
| GET | /api/v1/dashboard/pipeline/status | Pipeline summary |
| GET | /api/v1/dashboard/agents/available | Available agents |
| GET | /api/v1/dashboard/agents/:id/stats | Agent performance |
| GET | /api/v1/dashboard/analytics/summary | Analytics overview |
| GET | /api/v1/dashboard/compliance/:clientId | Compliance status |
| GET | /api/v1/dashboard/scripts/:category | Talk scripts |
| POST | /api/v1/dashboard/calls/log | Log call activity |

### Error Responses
- 401: Missing or invalid Bearer token
- 404: Resource not found
- 413: Payload too large (>1MB)
- 429: Rate limited (100 req/10 min)
- 500: Internal server error

All responses include `X-Request-ID` header for debugging.
