

# Cumorah Wheel (Wheel of Names+)

Una web app tipo [wheelofnames.com](https://wheelofnames.com/) pero con:
- Autenticación (Google Sign-In).
- Wheels guardadas por usuario (Postgres).
- Modos de **fairness** para repartir participación (cooldown, decay, “bingo” sin repetidos).
- Historial de spins, auditoría y (opcional) tiempo real.

> Objetivo: simple de usar, justa para grupos, transparente y auditable.

## Stack (propuesto)
- **Frontend/SSR**: Next.js (App Router)
- **Auth**: Auth.js (Google)
- **DB**: Postgres (Supabase/Neon) + Prisma
- **Cache/Locks**: Redis (Upstash) para lock de spins y rate limit
- **Realtime (opcional)**: Socket.IO o Supabase Realtime
- **Storage**: S3-compatible (sonidos/temas)
- **Deploy**: Vercel
- **Observabilidad**: Sentry + PostHog

## Arquitectura
- El **spin se decide en el servidor** (no en el cliente).
- Se calcula un snapshot de **pesos finales** según el modo de fairness.
- RNG determinístico con **seed** firmada (auditable).
- Transacción atómica: guarda `spins` + `result_snapshot`.
- Lock por `wheel_id` para evitar condiciones de carrera.

> Ver detalles en [`docs/architecture.md`](docs/architecture.md).

## Roadmap (MVP → Plus)
- **MVP**: Auth Google, CRUD de wheels/entries, spin server-side, historial, fairness básico (cooldown=1), share link.
- **Plus**: decay configurable, “balanced” (cooldown+decay), realtime, métricas de participación, colaboradores con roles.

## Desarrollo
1. Clonar repo y configurar variables de entorno (ver `docs/requirements.md`).
2. Crear esquema en Postgres (Prisma).
3. Rutas de API para wheels/entries/spin.

## Seguridad y privacidad
- No se confía en pesos del cliente.
- Rate limit para `/spin`.
- Logs sin datos sensibles; opción de borrar cuenta/wheels.

## Licencia
MIT (a definir).
