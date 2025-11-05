# Arquitectura

## Visión general
- **Next.js** sirve la UI y endpoints (Route Handlers).
- **Spins** se resuelven en servidor con lock + transacción.
- **Pesos** según **fairness_mode**:
  - `none`: peso = base_weight
  - `cooldown(C)`: si salió en últimos `C` spins → peso 0
  - `decay(α, W)`: peso = base_weight * f(k en ventana W), p. ej. `exp(-α*k)`
  - `balanced`: `cooldown(1)` + `decay` suave
  - `bingo`: sin repetidos hasta cubrir todos; luego reset

## Diagrama (alto nivel)
```mermaid
flowchart LR
  U[Usuario] -- UI/SSR --> N[Next.js]
  N -- Auth --> G[Google OAuth]
  N -- ORM --> P[(Postgres)]
  N -- Lock/Rate --> R[(Redis)]
  N -- Opcional --> RT[(Realtime)]
  N -- Storage --> S3[(S3/R2)]
