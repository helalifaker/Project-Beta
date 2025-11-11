# Database Migration Guide

## Overview

This guide covers the database migration process for adding new admin models (CapexCategory, CapexRule, AuditLog, RentModelTemplate).

## Prerequisites

1. Ensure `.env.local` contains:
   - `DATABASE_URL` (pgBouncer connection string)
   - `DIRECT_URL` (direct connection string)
   - Both must include `sslmode=require`

2. Ensure you're in the project directory:
   ```bash
   cd school-relocation-planner
   ```

## Migration Steps

### 1. Review Schema Changes

The following models have been added to `prisma/schema.prisma`:
- `CapexCategory` - Capex category management
- `CapexRule` - Capex reinvestment rules
- `AuditLog` - System activity tracking
- `RentModelTemplate` - Rent model templates

New enums:
- `CapexTriggerType` - CYCLE, UTILIZATION, CUSTOM_DATE
- `RentModelType` - FIXED_ESC, REV_SHARE, PARTNER

### 2. Create Migration

```bash
pnpm prisma migrate dev --name add_admin_models
```

This will:
1. Create a new migration file in `prisma/migrations/`
2. Apply the migration to your database
3. Regenerate the Prisma Client

### 3. Verify Migration

Check that the migration was successful:

```bash
pnpm prisma migrate status
```

### 4. Regenerate Prisma Client

If needed, regenerate the Prisma Client:

```bash
pnpm prisma generate
```

### 5. Seed Initial Data (Optional)

If you want to seed initial data:

```bash
pnpm db:seed
```

## Rollback (if needed)

If you need to rollback the migration:

```bash
pnpm prisma migrate reset
```

**Warning:** This will delete all data in your database!

## Troubleshooting

### Error: Environment variable not found

Ensure `.env.local` exists and contains both `DATABASE_URL` and `DIRECT_URL`.

### Error: Invalid database string

Copy the exact connection strings from Supabase dashboard (they're pre-encoded).

### Error: Migration conflicts

If you have conflicting migrations:
1. Check `prisma/migrations/` for existing migrations
2. Resolve conflicts manually
3. Or reset and recreate: `pnpm prisma migrate reset`

## Post-Migration Checklist

- [ ] Migration applied successfully
- [ ] Prisma Client regenerated
- [ ] All API routes working
- [ ] Admin pages accessible
- [ ] No TypeScript errors

## Next Steps

After migration:
1. Test admin features
2. Create initial templates
3. Configure workspace settings
4. Set up capex categories and rules

