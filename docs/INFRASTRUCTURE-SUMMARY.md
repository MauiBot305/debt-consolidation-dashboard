# Infrastructure Cost Summary
## Debt Consolidation Empire Dashboard - Quick Reference

**Date:** February 24, 2026  
**Platform:** UCaaS/CRM/Case Management for 47+ agents

---

## 🎯 Bottom Line

### **Recommended: Start with Hetzner Cloud**

**47 Agents - Year 1:** **$66,257**  
**Ongoing (Yr 2-5):** **$66,257/year**  
**5-Year TCO:** **$331,283**

**Why?**
- ✅ Lowest startup cost (no hardware)
- ✅ Simple to manage
- ✅ European servers (great for Bulgaria operations)
- ✅ Excellent price/performance
- ✅ Easy to add Mac Studios later if needed

---

## 💰 Cost Comparison: 47 Agents (Year 1)

| Solution | Year 1 | Per Agent/Mo | 5-Yr TCO |
|----------|--------|--------------|----------|
| 🥇 **Cloudflare** | $56,339 | $100 | $281,693 |
| 🥈 **Hetzner** | $66,257 | $117 | $331,283 |
| 🥉 **AWS** | $68,071 | $121 | $340,357 |
| Hybrid (Mac+Cloud) | $95,782 | $170 | $380,918 |
| Self-Hosted (Mac) | $102,970 | $183 | $415,658 |

**Twilio dominates:** $55K/year (83% of Hetzner total cost)

---

## 📊 Scaling Scenarios

### 100 Agents

| Solution | Year 1 | 5-Yr TCO | Winner |
|----------|--------|----------|--------|
| Cloudflare | $119,880 | $599,400 | Best for serverless |
| **Hetzner** | **$141,215** | **$706,075** | **Best overall** |
| AWS | $145,080 | $725,400 | - |
| Hybrid | $192,951 | $773,123 | - |

### 500 Agents

| Solution | Year 1 | 5-Yr TCO | Winner |
|----------|--------|----------|--------|
| Cloudflare | $599,400 | $2,997,000 | Needs more compute |
| **Hybrid** | **$896,417** | **$3,526,021** | **Best for scale** |
| Hetzner | $706,365 | $3,531,825 | Very close |
| Self-Hosted | $899,853 | $3,539,345 | - |

**Tipping point:** Hybrid becomes cost-effective at **~350 agents** due to LLM API savings.

---

## 🖥️ Mac Studio Specs & Costs

**Mac Studio M3 Ultra (512GB RAM, 8TB SSD):**
- **Price:** $11,999 per unit
- **Power:** 9W idle, 270W max (avg 180W)
- **Capacity:** 25-30 agents per unit
- **Electricity (Bulgaria):** $27/month per unit
- **Total for 47 agents:** 2 units = $23,998 (Year 1 hardware)

**When to buy:**
- At 100+ agents for self-hosted LLM (saves $1,500-3,000/year on API costs)
- When voice latency matters (<100ms local vs 200-500ms cloud)
- For development/testing environment

---

## ☁️ Provider Quick Comparison

### Hetzner (Recommended Cloud)
- **Dedicated servers:** AX162-S (AMD Ryzen 9, 128GB RAM) @ $236/mo
- **Database:** AX102 @ $176/mo
- **Bandwidth:** 1Gbps unmetered (FREE)
- **Total:** $943/mo + Twilio ($4,578/mo)

### Cloudflare (Best Serverless)
- **Workers:** $25/mo (serverless compute)
- **R2 Storage:** $15/mo (FREE egress!)
- **D1 Database:** $75/mo
- **Total:** $117/mo + Twilio ($4,578/mo)
- **Caveat:** CPU time limits (10ms/request) — not ideal for heavy LLM

### AWS (Enterprise Option)
- **EC2:** $520/mo (Reserved Instances)
- **RDS:** $414/mo (PostgreSQL Multi-AZ)
- **S3+CloudFront:** $70/mo
- **Total:** $1,094/mo + Twilio ($4,578/mo)

---

## 📞 Twilio Costs (All Scenarios)

**Fixed per agent, not infrastructure:**

| Agents | Calls/Mo | Minutes/Mo | Monthly Cost | Annual Cost |
|--------|----------|------------|--------------|-------------|
| 47 | 41,360 | 330,880 | $4,578 | $54,936 |
| 100 | 88,000 | 704,000 | $9,739 | $116,868 |
| 500 | 440,000 | 3,520,000 | $48,694 | $584,328 |

**Rates:**
- Inbound: $0.013/min
- Outbound: $0.014/min
- Phone numbers: $1/mo each
- SMS: $0.0079/msg
- Recording storage: $0.25/GB

**💡 Optimization:** Negotiate volume discount with Twilio — at $55K/year, you qualify for 10-15% off.

---

## 🔄 Hybrid Architecture (Best for 500+ Agents)

**Mac Studios (On-Premise):**
- LLM inference (Ollama — FREE vs $5K-20K/year cloud API)
- Voice processing (low latency, <100ms)
- Heavy compute

**Cloud (Hetzner):**
- App hosting (CRM dashboard)
- Database (PostgreSQL)
- CDN (Cloudflare)
- Redundancy

**Cost Breakdown (47 agents):**
- Mac Studios: $26,085 Year 1, $2,087/year ongoing
- Cloud (Hetzner): $8,052/year
- Twilio: $54,936/year
- Support: $13,500/year
- **Total Year 1:** $95,782

---

## 💡 Cost Savings Tips

1. **Negotiate Twilio volume pricing** → Save $5-8K/year
2. **Use Hetzner over AWS** → Save $20K/year (40% cheaper)
3. **Cloudflare R2 for storage** → FREE egress (vs $1K+/year AWS)
4. **Self-host LLMs (Ollama)** → Save $500-20K/year depending on scale
5. **Reserved Instances (AWS/GCP)** → Save 30-50% if using cloud
6. **Self-host monitoring** → Save $2-5K/year (Grafana vs Datadog)
7. **SIP trunking instead of Twilio** → Save 50% on voice ($0.006/min)

---

## 🛠️ Additional Monthly Costs (All Scenarios)

| Service | Cost | Provider | Notes |
|---------|------|----------|-------|
| **Internet (Bulgaria)** | $60/location | A1/Vivacom | 2.5 Gbps fiber |
| **Power (per Mac Studio)** | $27 | Local utility | Bulgaria: $0.26/kWh |
| **Cloudflare Business** | $200 | Cloudflare | Load balancing + WAF |
| **Email (SES)** | $1 | AWS | 10K emails/mo |
| **Backups (Backblaze)** | $6 | Backblaze B2 | 1TB storage |
| **Monitoring (self-hosted)** | $0 | Grafana/Prometheus | Free |
| **SSL Certificates** | $0 | Let's Encrypt | Free |

---

## 🔐 Security Costs

- **WAF:** Included in Cloudflare Business ($200/mo)
- **DDoS Protection:** Included (Cloudflare)
- **VPN (WireGuard):** FREE (self-hosted)
- **SSL:** FREE (Let's Encrypt)
- **Penetration Testing:** $3K-5K/year (annual)

**Total:** ~$2,400/year (Cloudflare) + $4K (annual pentest) = **$6,400/year**

---

## 📈 Per-Agent Economics

**Total Cost Per Agent Per Month (47 agents):**

| Component | Per Agent | Notes |
|-----------|-----------|-------|
| Twilio (voice) | $97.40 | 83% of infrastructure cost |
| Infrastructure (Hetzner) | $20.07 | Compute + storage + network |
| **Total** | **$117.47** | |

**At 100 agents:** $117.80/agent/month  
**At 500 agents:** $117.37/agent/month

**Scaling is linear** due to Twilio dominating costs.

---

## 🎬 Decision Matrix

### Choose **Hetzner Cloud** if:
- ✅ You want the simplest start
- ✅ Budget-conscious (lowest Year 1 cost)
- ✅ No hardware maintenance
- ✅ Easy to scale up/down

### Choose **Hybrid (Mac Studios + Cloud)** if:
- ✅ You expect to scale to 300+ agents
- ✅ LLM inference is heavy (>10M tokens/month)
- ✅ You need sub-100ms voice latency
- ✅ You have sysadmin expertise

### Choose **Cloudflare** if:
- ✅ Your app is mostly static/JAMstack
- ✅ You want edge compute globally
- ✅ FREE egress matters (serving lots of data)
- ✅ You can work within 10ms CPU limits

### **Avoid pure Mac Studio** unless:
- You're at 500+ agents
- You need total control/compliance
- Cloud costs exceed $100K/year

---

## 📋 Recommended Deployment: 47 Agents

### Phase 1: Launch (Months 1-6)
**Provider:** Hetzner Cloud  
**Monthly:** $5,521  
**Why:** Fast setup, low risk, proven stack

**Stack:**
- 3× AX162-S (app servers, load balanced)
- 1× AX102 (PostgreSQL database)
- Cloudflare (CDN + load balancing)
- Twilio (voice)
- Backblaze (backups)

### Phase 2: Scale (Months 7-12, if growing to 100+ agents)
**Add:** 2× Mac Studio M3 Ultra  
**Cost:** $24K hardware + $2,087/year operational  
**Why:** Offset LLM API costs, improve latency

**Hybrid Architecture:**
- Mac Studios: LLM inference (Ollama), voice processing
- Hetzner: Database, app hosting, redundancy
- Cloudflare: CDN, load balancing

### Phase 3: Optimize (Year 2+)
- Negotiate Twilio discount (10-15% off)
- Consider SIP trunking ($0.006/min vs $0.013)
- Add monitoring (Datadog or keep self-hosted)
- Optimize call duration (reduce avg from 8 to 6 minutes = -25% cost)

---

## 🧮 Quick TCO Calculator

**Formula:**

```
Monthly Cost = (Infrastructure) + (Twilio) + (Support)

Hetzner: $943 + $4,578 + $1,125 = $6,646/month
AWS: $1,094 + $4,578 + $1,125 = $6,797/month
Hybrid: $2,382 + $4,578 + $750 = $7,710/month
```

**For your agents:**
- **47 agents:** Hetzner = $5,521/mo, Hybrid = $7,982/mo
- **100 agents:** Hetzner = $11,768/mo, Hybrid = $16,079/mo
- **500 agents:** Hetzner = $58,864/mo, Hybrid = $54,784/mo

---

## 📞 Questions for Patrick

1. **Expected growth rate?** (Impacts hardware vs cloud decision)
2. **LLM usage intensity?** (Light: cloud API; Heavy: self-host)
3. **Voice latency requirements?** (<100ms = Mac Studios; <500ms = cloud OK)
4. **Sysadmin availability?** (Hybrid needs 20h/month; cloud needs 10h/month)
5. **Budget constraints?** (Upfront: Hetzner; Spread over time: Hybrid)
6. **Compliance requirements?** (HIPAA/SOC2 may favor AWS/Azure)

---

## ✅ Next Steps

1. **Start with Hetzner** (3× AX162-S, 1× AX102) — **$943/month**
2. **Set up Cloudflare Business** (load balancing, WAF) — **$255/month**
3. **Configure Twilio** (47 phone numbers, webhooks) — **$4,578/month**
4. **Deploy monitoring** (Grafana + Prometheus, self-hosted) — **FREE**
5. **Run for 3 months**, measure actual usage
6. **Decide on Mac Studios** if LLM costs >$500/month or latency issues

**Total launch cost:** ~$6,646/month = **$19,938 for first 3 months**

---

**Prepared by:** Maui (OpenClaw Infrastructure Team)  
**Date:** February 24, 2026  
**Review:** Pending Patrick approval

For full details, see: [INFRASTRUCTURE-COSTS.md](./INFRASTRUCTURE-COSTS.md)
