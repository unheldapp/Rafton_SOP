# Supabase Setup Guide - Rafton SOP Management Platform

This guide will walk you through setting up your Supabase database with all the necessary tables, functions, triggers, and security policies.

## Prerequisites

- ✅ Supabase project created
- ✅ Supabase client installed in your React app
- ✅ Environment variables configured

## Setup Steps

### Step 1: Execute Database Migrations

You need to run the SQL migration files in the correct order. Go to your Supabase project dashboard and navigate to the **SQL Editor**.

#### 1.1 Create Initial Schema
Copy and paste the contents of `supabase/migrations/001_initial_schema.sql` into the SQL Editor and execute it.

This creates:
- 27 database tables
- All foreign key relationships
- Check constraints for data validation
- Default values and auto-timestamps

#### 1.2 Create Functions, Triggers, and Indexes
Copy and paste the contents of `supabase/migrations/002_functions_triggers_indexes.sql` into the SQL Editor and execute it.

This creates:
- Folder path computation functions
- Cycle prevention triggers
- Automatic audit logging
- Retention policy enforcement
- Performance indexes
- Full-text search indexes

#### 1.3 Setup Row Level Security (RLS)
Copy and paste the contents of `supabase/migrations/003_row_level_security.sql` into the SQL Editor and execute it.

This creates:
- Multi-tenant access control
- Role-based permissions
- Helper functions for RLS
- Comprehensive security policies

#### 1.4 Setup Storage Buckets
Copy and paste the contents of `supabase/migrations/004_storage_buckets.sql` into the SQL Editor and execute it.

This creates:
- 5 storage buckets with proper configurations
- File type restrictions
- Size limits
- Storage security policies

### Step 2: Configure Authentication

#### 2.1 Enable Email Authentication
1. Go to **Authentication > Settings**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set up email rate limiting

#### 2.2 Configure Social Providers (Optional)
1. Go to **Authentication > Providers**
2. Enable desired providers (Google, Microsoft, etc.)
3. Configure OAuth credentials

#### 2.3 Setup Auth Hooks (Optional)
Create custom auth hooks for:
- User creation (auto-assign to company)
- Email verification
- Password reset

### Step 3: Seed Initial Data

#### 3.1 Create Compliance Frameworks
```sql
-- Insert common compliance frameworks
INSERT INTO compliance_frameworks (name, description, category, authority, active) VALUES
('ISO 27001', 'Information Security Management System', 'Security', 'International Organization for Standardization', true),
('SOC 2', 'Service Organization Control 2', 'Security', 'AICPA', true),
('GDPR', 'General Data Protection Regulation', 'Privacy', 'European Union', true),
('HIPAA', 'Health Insurance Portability and Accountability Act', 'Healthcare', 'US Department of Health', true),
('SOX', 'Sarbanes-Oxley Act', 'Financial', 'SEC', true),
('ISO 9001', 'Quality Management System', 'Quality', 'International Organization for Standardization', true);
```

#### 3.2 Create SOP Templates
```sql
-- Insert basic SOP templates
INSERT INTO sop_templates (name, category, industry, content, difficulty_level, tags) VALUES
('Employee Onboarding Process', 'HR', 'General', 
'<h1>Employee Onboarding Process</h1>
<h2>Purpose</h2>
<p>This procedure outlines the steps for onboarding new employees...</p>
<h2>Scope</h2>
<p>This procedure applies to all new hires...</p>
<h2>Procedure</h2>
<ol>
<li>Pre-boarding preparation</li>
<li>First day orientation</li>
<li>Training schedule</li>
<li>Documentation completion</li>
</ol>', 'beginner', ARRAY['HR', 'Onboarding', 'Process']),

('Data Backup and Recovery', 'IT', 'Technology', 
'<h1>Data Backup and Recovery</h1>
<h2>Purpose</h2>
<p>This procedure ensures regular backup and recovery of critical data...</p>
<h2>Scope</h2>
<p>This procedure applies to all IT systems...</p>
<h2>Procedure</h2>
<ol>
<li>Identify critical data</li>
<li>Schedule automated backups</li>
<li>Test recovery procedures</li>
<li>Document backup locations</li>
</ol>', 'intermediate', ARRAY['IT', 'Backup', 'Recovery']),

('Incident Response Plan', 'Security', 'General', 
'<h1>Incident Response Plan</h1>
<h2>Purpose</h2>
<p>This procedure outlines the steps for responding to security incidents...</p>
<h2>Scope</h2>
<p>This procedure applies to all security incidents...</p>
<h2>Procedure</h2>
<ol>
<li>Incident detection</li>
<li>Initial response</li>
<li>Investigation</li>
<li>Resolution and reporting</li>
</ol>', 'advanced', ARRAY['Security', 'Incident', 'Response']);
```

### Step 4: Test Your Setup

#### 4.1 Create Test Company
```sql
-- Insert test company
INSERT INTO companies (name, domain, industry, size) VALUES
('Test Company', 'test.com', 'Technology', 'small');
```

#### 4.2 Create Test User
```sql
-- Insert test admin user
INSERT INTO users (company_id, email, first_name, last_name, role, email_verified) VALUES
((SELECT id FROM companies WHERE name = 'Test Company'), 'admin@test.com', 'Test', 'Admin', 'admin', true);
```

#### 4.3 Test Database Queries
```sql
-- Test company isolation
SELECT * FROM companies;

-- Test user roles
SELECT * FROM users;

-- Test folder structure
SELECT * FROM sop_folders;

-- Test RLS policies (should only show data for authenticated user's company)
SELECT * FROM sops;
```

### Step 5: Configure Environment Variables

Update your `.env.local` file with additional configuration:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://mzxqnnjojefmyrnqqetf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16eHFubmpvamVmbXlybnFxZXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTY4NTEsImV4cCI6MjA2Nzg3Mjg1MX0.Twvoe76A9gCsUNG6crwR_gw68P6XxRdUbkJfOEyCkF0

# App Configuration
VITE_APP_NAME=Rafton SOP Management Platform
VITE_APP_VERSION=1.0.0

# Storage Configuration
VITE_SUPABASE_STORAGE_URL=https://mzxqnnjojefmyrnqqetf.supabase.co/storage/v1

# Real-time Configuration
VITE_ENABLE_REALTIME=true
VITE_REALTIME_EVENTS_PER_SECOND=10
```

### Step 6: Verify Setup

#### 6.1 Check Tables
Go to **Database > Tables** in your Supabase dashboard and verify all 27 tables are created.

#### 6.2 Check Storage
Go to **Storage** and verify all 5 buckets are created:
- `sop-documents`
- `user-avatars`
- `company-logos`
- `template-previews`
- `comment-attachments`

#### 6.3 Check RLS Policies
Go to **Authentication > Policies** and verify RLS policies are active for all tables.

#### 6.4 Check Functions
Go to **Database > Functions** and verify all helper functions are created:
- `get_user_company_id()`
- `is_user_admin()`
- `is_user_auditor()`
- `get_user_role()`
- Storage helper functions

### Step 7: Setup Monitoring (Optional)

#### 7.1 Database Monitoring
- Set up query performance monitoring
- Configure slow query alerts
- Monitor connection pool usage

#### 7.2 Storage Monitoring
- Monitor storage usage
- Set up file upload alerts
- Configure bandwidth monitoring

#### 7.3 Security Monitoring
- Enable audit logging
- Set up failed login alerts
- Monitor RLS policy violations

## Common Issues and Solutions

### Issue 1: RLS Policy Errors
**Problem**: Users can't access data after enabling RLS
**Solution**: Check that helper functions are created and policies reference correct table relationships

### Issue 2: Storage Upload Errors
**Problem**: Files can't be uploaded to storage
**Solution**: Verify bucket policies and file type restrictions

### Issue 3: Trigger Errors
**Problem**: Database triggers failing
**Solution**: Check function dependencies and ensure all functions are created before triggers

### Issue 4: Foreign Key Violations
**Problem**: Cannot insert data due to foreign key constraints
**Solution**: Ensure parent records exist before creating child records

## Performance Optimization

### Database Optimization
- Indexes are automatically created for common queries
- Use connection pooling for high-traffic applications
- Consider read replicas for reporting queries

### Storage Optimization
- Use CDN for frequently accessed files
- Implement image optimization for avatars and logos
- Set up automatic cleanup for old files

## Security Best Practices

### Authentication
- Enable MFA for admin users
- Use strong password policies
- Implement session timeout

### Authorization
- Regularly review RLS policies
- Audit user permissions
- Monitor access patterns

### Data Protection
- Enable encryption at rest
- Use HTTPS for all connections
- Regular security audits

## Next Steps

1. **Test your React app** - Verify connection to Supabase
2. **Create your first SOP** - Test the full workflow
3. **Set up authentication** - Configure user registration
4. **Deploy to production** - Set up staging and production environments

## Support

If you encounter any issues:
1. Check the Supabase logs in your dashboard
2. Review the migration files for syntax errors
3. Verify all dependencies are installed
4. Check environment variables are correct

For additional help, refer to the [Supabase documentation](https://supabase.com/docs) or reach out to the development team.

---

**Database Schema**: 27 tables, 4 migration files, comprehensive RLS policies
**Storage**: 5 buckets with security policies
**Functions**: 15+ helper functions for automation
**Indexes**: 50+ performance indexes
**Security**: Multi-tenant isolation, role-based access control 