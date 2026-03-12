# 📊 Observability Deep Dive: Prometheus & Grafana

In production, you can't just look at the server logs to know if your app is healthy. You need **Observability**—the ability to see the "Internal Organs" of your application while it's running.

---

## 💓 1. The "Heartbeat" (Metrics)

Our Quarkus app is now set up to "Broadcast" its health data.

- **Endpoint**: `/management/prometheus`
- **What it sends**: Thousands of lines of data about memory usage, garbage collection, CPU speed, and how many HTTP requests are coming in per second.

---

## 🕵️ 2. The Collector (Prometheus)

Prometheus is like a **Biographer**.

1.  **Scraping**: Every 15 seconds, it "calls" our app and reads all those metrics.
2.  **Storage**: It saves that data over time so we can see trends (e.g., "Our memory usage has been rising for 6 hours!").

### Our Config (`prometheus.yml`)

We told Prometheus exactly where to find our app:

```yaml
static_configs:
  - targets:
      - host.docker.internal:8081
```

---

## 🎨 3. The Dashboard (Grafana)

Prometheus data is just a bunch of numbers. Grafana turns those numbers into **Beautiful Charts**.

- **Datasource**: We connected it to Prometheus.
- **JVM Dashboard**: We imported a professional dashboard (`JVM.json`) that shows you:
  - 📈 **Memory Heap**: Is the app running out of RAM?
  - 🧵 **Threads**: Are too many users trying to connect at once?
  - 🚦 **Uptime**: How long has the server been running without a crash?

---

## 🐳 4. How to use it

We've provided a simple Docker command to start everything:

```bash
docker compose -f src/main/docker/monitoring.yml up -d
```

- This starts **Prometheus** (The Biographer) and **Grafana** (The Artist) together.
- You can then open your browser to `http://localhost:3000` to see your professional dashboard!

---

## 🚀 Why this makes you a "Pro"

1.  **Proactive vs. Reactive**: You see the "Smoke" before the "Fire." You can fix a memory leak before the app actually crashes.
2.  **Data-Driven**: Instead of saying "The app feels slow," you can say "API response time increased by 200ms after we added that complex SQL query."
3.  **Standardized**: This is the industry-standard "Golden Signal" monitoring stack.
