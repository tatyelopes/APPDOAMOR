import { applyMigrations } from '../server/src/infra/migrations.js'

const result = await applyMigrations({ logger: console.log })
console.log(
  JSON.stringify(
    {
      status: 'ok',
      migrationsFound: result.discovered.length,
      migrationsApplied: result.applied.length,
      alreadyApplied: result.alreadyApplied,
    },
    null,
    2,
  ),
)
