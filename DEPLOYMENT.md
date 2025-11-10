# Deployment Guide

This document describes the deployment process for the School Relocation Planner application.

## 🚀 Deployment Platform

The application is deployed on **Vercel** with automatic deployments configured for:
- **Production**: `main` branch
- **Preview**: All pull requests and `develop` branch

## 📋 Prerequisites

1. **Vercel Account**: Team account with appropriate permissions
2. **GitHub Integration**: Repository connected to Vercel
3. **Environment Variables**: All required variables configured in Vercel
4. **Supabase Project**: Database and auth configured

## 🔧 Environment Variables

### Required Variables

Configure these in Vercel project settings:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Database
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres

# Vercel
VERCEL_URL=auto-populated

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Redis (Vercel KV)
KV_URL=redis://xxx
KV_REST_API_URL=https://xxx
KV_REST_API_TOKEN=xxx
KV_REST_API_READ_ONLY_TOKEN=xxx

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=https://xxx
UPSTASH_REDIS_REST_TOKEN=xxx

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=auto-populated
```

### Environment-Specific Variables

- **Production**: Use production Supabase project
- **Preview**: Use staging Supabase project (recommended)
- **Development**: Use local `.env.local` file

## 🔄 Deployment Process

### Automatic Deployments

#### Production Deployment

1. **Merge to Main**:
   ```bash
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   ```

2. **Vercel Auto-Deploy**:
   - Vercel detects push to `main`
   - Runs build process
   - Deploys to production domain
   - Updates DNS automatically

3. **Verification**:
   - Check Vercel dashboard for deployment status
   - Visit production URL
   - Verify functionality
   - Check error monitoring (Sentry)

#### Preview Deployments

1. **Create Pull Request**:
   ```bash
   git checkout -b feat/new-feature
   git push origin feat/new-feature
   # Create PR on GitHub
   ```

2. **Automatic Preview**:
   - Vercel creates preview deployment
   - Unique URL generated
   - Comment added to PR with preview link

3. **Testing**:
   - Test on preview URL
   - Share with stakeholders
   - Verify changes

### Manual Deployment

If needed, deploy manually using Vercel CLI:

```bash
# Install Vercel CLI
pnpm i -g vercel

# Login
vercel login

# Link project (first time only)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🏗️ Build Process

### Build Steps

1. **Install Dependencies**: `pnpm install --frozen-lockfile`
2. **Type Check**: `tsc --noEmit`
3. **Lint**: `eslint .`
4. **Build**: `next build`
5. **Optimize**: Vercel optimization (image optimization, edge functions)

### Build Configuration

- **Framework**: Next.js 14
- **Node Version**: 20.x
- **Package Manager**: pnpm 8.x
- **Output**: Standalone
- **Edge Runtime**: Enabled for API routes

### Build Time

- **Expected**: 2-4 minutes
- **Maximum**: 10 minutes (timeout)

## 🔍 Post-Deployment Verification

### Automated Checks

- ✅ Build succeeds
- ✅ No TypeScript errors
- ✅ No linting errors
- ✅ All tests pass
- ✅ Lighthouse score ≥95

### Manual Checks

1. **Functionality**:
   - [ ] Home page loads
   - [ ] Authentication works
   - [ ] Version creation works
   - [ ] Financial statements generate
   - [ ] Comparison works

2. **Performance**:
   - [ ] Page load <800ms
   - [ ] Statement generation <400ms
   - [ ] No console errors

3. **Monitoring**:
   - [ ] Sentry receiving events
   - [ ] Vercel Analytics tracking
   - [ ] Speed Insights enabled

## 🔙 Rollback Procedure

If a deployment causes issues:

### Quick Rollback (Vercel Dashboard)

1. Go to Vercel dashboard
2. Navigate to Deployments
3. Find previous working deployment
4. Click "Promote to Production"

### Git Rollback

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to previous commit
git reset --hard <previous-commit-hash>
git push origin main --force
```

### Database Rollback

If database migration is involved:

1. Revert migration:
   ```bash
   pnpm prisma migrate resolve --rolled-back <migration-name>
   ```

2. Deploy previous code version

3. Verify database state

## 🚨 Troubleshooting

### Build Failures

**Issue**: Build fails with TypeScript errors
**Solution**: 
```bash
pnpm type-check
# Fix errors locally
git commit -am "fix: resolve type errors"
git push
```

**Issue**: Build fails with dependency errors
**Solution**:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Runtime Errors

**Issue**: 500 errors in production
**Solution**:
1. Check Vercel logs
2. Check Sentry for error details
3. Verify environment variables
4. Check database connection

**Issue**: Slow performance
**Solution**:
1. Check Vercel Speed Insights
2. Review database queries
3. Check Redis cache hit rate
4. Optimize heavy API routes

### Database Issues

**Issue**: Database connection fails
**Solution**:
1. Verify `DATABASE_URL` and `DIRECT_URL`
2. Check Supabase project status
3. Verify connection pooling settings
4. Check RLS policies

## 📊 Monitoring

### Vercel Dashboard

- **Deployments**: Track all deployments
- **Analytics**: User metrics and page views
- **Speed Insights**: Core Web Vitals
- **Logs**: Runtime logs and errors

### Sentry

- **Error Tracking**: All runtime errors
- **Performance**: Transaction monitoring
- **Releases**: Track deployments
- **Alerts**: Configured for critical errors

### Supabase Dashboard

- **Database**: Query performance
- **Auth**: User sessions
- **Storage**: File uploads
- **Logs**: Database logs

## 🔐 Security

### Pre-Deployment Checklist

- [ ] No secrets in code
- [ ] Environment variables configured
- [ ] RLS policies enabled
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] CORS configured properly

### Post-Deployment Security

- [ ] Run security audit: `pnpm audit`
- [ ] Check for exposed secrets
- [ ] Verify authentication works
- [ ] Test authorization rules
- [ ] Verify rate limiting

## 📈 Performance Targets

### Production Metrics

- **Page Load (TTI)**: <800ms (p95)
- **Statement Generation**: <400ms (p95)
- **Comparison**: <500ms (p95)
- **Lighthouse Score**: ≥95
- **Uptime**: 99.9%

### Monitoring Thresholds

- **Error Rate**: <0.1%
- **Response Time**: <1s (p95)
- **Database Queries**: <100ms (p95)
- **Cache Hit Rate**: >80%

## 🔄 Continuous Deployment

### Branch Strategy

```
main (production)
  ↑
develop (staging)
  ↑
feature/* (preview)
```

### Deployment Flow

1. **Feature Development**:
   - Create feature branch
   - Develop and test locally
   - Push for preview deployment
   - Create PR

2. **Staging**:
   - Merge to `develop`
   - Auto-deploy to staging
   - QA testing
   - Stakeholder review

3. **Production**:
   - Merge to `main`
   - Auto-deploy to production
   - Monitor for issues
   - Verify metrics

## 📞 Support

### Deployment Issues

- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.com
- **Team Lead**: [Contact Info]

### Emergency Contacts

- **On-Call Engineer**: [Contact Info]
- **DevOps Lead**: [Contact Info]
- **Product Owner**: Faker Helali

---

**Last Updated**: November 10, 2025  
**Version**: 1.0.0

