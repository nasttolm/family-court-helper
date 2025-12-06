# Family Court Helper

A free, privacy-focused web application to help UK parents prepare child custody court documents during separation or divorce. This tool assists users in organizing family information and generating professional court-ready documents without requiring legal representation.

## Features

### Core Functionality
- **Dynamic Form System** - Guided questionnaire covering children's information, living arrangements, safety concerns, and proposed custody arrangements
- **Document Generation** - Download court documents in two formats:
  - Q&A Format: Question-and-answer style document
  - Narrative Format: AI-generated professional legal narrative
- **Draft & Progress Saving** - Save work in progress and return later
- **Guest Mode** - Complete and download forms without registration
- **Document Preview** - Review all information before downloading
- **Auto-Delete Protection** - Data automatically deleted after 30 days for privacy

### User Experience
- **Accessibility Controls** - Font size adjustment and high contrast mode
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Progress Tracking** - Visual progress bar based on completed fields
- **Multi-device Support** - Continue applications across devices (registered users)

### Security & Privacy
- **UK GDPR Compliant** - Privacy-first design with minimal data collection
- **Row Level Security (RLS)** - Users can only access their own data
- **Secure Authentication** - Email/password authentication via Supabase
- **Audit Logging** - All data modifications tracked for security
- **No Long-term Storage** - Sensitive data automatically deleted after 30 days

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Frontend:** React 19, Tailwind CSS 4, shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Forms:** Survey.js (survey-core, survey-react-ui, survey-creator-react)
- **Document Generation:** docx library
- **AI Integration:** Hugging Face Inference API (optional)
- **Deployment:** Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier sufficient)
- Git

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd family-court-helper
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Service Role Key (Required for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Hugging Face API (Optional - for AI narrative generation)
HUGGINGFACE_API_KEY=your-huggingface-api-key
```

**Get Supabase credentials:**
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → API
3. Copy `URL` and `anon public` key

### 4. Set up Supabase database

Run these SQL commands in Supabase SQL Editor (Dashboard → SQL Editor):

#### Create applications table

```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dynamic_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Add indexes
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_expires_at ON applications(expires_at);
```

#### Create audit log table

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action);
```

#### Create narrative templates table

```sql
CREATE TABLE narrative_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_config_hash TEXT UNIQUE NOT NULL,
  template_sections JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index
CREATE INDEX idx_narrative_templates_hash ON narrative_templates(form_config_hash);
```

#### Create form configurations table

```sql
CREATE TABLE form_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version INTEGER NOT NULL DEFAULT 1,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Add indexes
CREATE INDEX idx_form_configs_active ON form_configs(is_active) WHERE is_active = true;
CREATE INDEX idx_form_configs_version ON form_configs(version DESC);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_form_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_form_configs_timestamp
  BEFORE UPDATE ON form_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_form_configs_updated_at();

-- Function to activate a form config (deactivates others)
CREATE OR REPLACE FUNCTION activate_form_config(config_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE form_configs SET is_active = false WHERE is_active = true;
  UPDATE form_configs SET is_active = true WHERE id = config_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Enable Row Level Security

```sql
-- Applications RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON applications FOR DELETE
  USING (auth.uid() = user_id);

-- Audit log RLS (read-only for users)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON audit_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- Narrative templates RLS (public read, authenticated write)
ALTER TABLE narrative_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read narrative templates"
  ON narrative_templates FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert templates"
  ON narrative_templates FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update templates"
  ON narrative_templates FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Form configs RLS (public read active, authenticated write)
ALTER TABLE form_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active form config"
  ON form_configs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert configs"
  ON form_configs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update configs"
  ON form_configs FOR UPDATE
  USING (true);
```

#### Create auto-update trigger for updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Create auto-deletion function (optional - requires pg_cron)

```sql
CREATE OR REPLACE FUNCTION delete_expired_applications()
RETURNS void AS $$
BEGIN
  DELETE FROM applications
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron (after enabling pg_cron extension)
SELECT cron.schedule(
  'delete-expired-applications',
  '0 2 * * *', -- Run at 2 AM daily
  'SELECT delete_expired_applications();'
);
```

**Note:** To enable pg_cron:
1. Go to **Database → Extensions** in Supabase Dashboard
2. Search for `pg_cron`
3. Enable the extension
4. Then run the schedule command above

### 5. Configure Supabase Authentication

1. Go to **Authentication → Providers** in Supabase Dashboard
2. Enable **Email** provider
3. (Recommended) Enable **Confirm email** for security
4. (Optional) Configure email templates

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
family-court-helper/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/                    # Admin panel
│   │   │   └── form-builder/
│   │   ├── application/              # Application workflow
│   │   │   ├── new/                  # New application (authenticated)
│   │   │   ├── guest/                # Guest mode (public)
│   │   │   ├── edit/[id]/            # Edit existing application
│   │   │   └── preview/[id]/         # Preview and download
│   │   ├── dashboard/                # User dashboard
│   │   ├── api/                      # API routes
│   │   │   ├── applications/         # CRUD operations
│   │   │   ├── form-config/          # Form configuration
│   │   │   └── narrative-template/   # AI template generation
│   │   ├── privacy/                  # Privacy policy
│   │   ├── terms/                    # Terms of service
│   │   ├── layout.js                 # Root layout
│   │   └── page.js                   # Home page
│   ├── components/                   # React components
│   │   ├── accessibility/            # Accessibility controls
│   │   ├── forms/                    # Form components
│   │   ├── modals/                   # Modal dialogs
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   └── ProtectedRoute.js
│   ├── hooks/                        # Custom React hooks
│   │   └── useAuth.js                # Authentication hook
│   ├── lib/                          # Utility libraries
│   │   ├── supabase/                 # Supabase clients
│   │   │   ├── client.js             # Browser client
│   │   │   ├── server.js             # Server client
│   │   │   └── middleware.js         # Middleware client
│   │   ├── form/                     # Form configuration
│   │   │   ├── defaultFormConfig.js  # Default form structure
│   │   │   └── formStorage.js        # Form config management
│   │   ├── docx/                     # Document generation
│   │   │   ├── dynamicDocxGenerator.js      # Q&A format
│   │   │   ├── narrativeDocxGenerator.js    # Narrative format
│   │   │   └── narrativeTemplateEngine.js   # Template engine
│   │   └── validations.js            # Input validation
│   └── middleware.js                 # Next.js middleware
├── public/                           # Static assets
├── .env.local                        # Environment variables (create this)
├── CLAUDE.md                         # Project context and rules
├── PLAN.md                           # Development plan
├── package.json
└── README.md                         # This file
```

## Database Schema

### applications

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| dynamic_data | JSONB | Form responses (all user input) |
| status | TEXT | 'draft' or 'completed' |
| progress | INTEGER | Progress percentage (0-100) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |
| expires_at | TIMESTAMPTZ | Auto-deletion date (created_at + 30 days) |

### audit_log

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| action | TEXT | Action type (created, updated, deleted) |
| resource_type | TEXT | Resource type (application, form_config) |
| resource_id | UUID | ID of affected resource |
| metadata | JSONB | Additional action details |
| created_at | TIMESTAMPTZ | Timestamp |

### narrative_templates

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| form_config_hash | TEXT | SHA256 hash of form structure (unique) |
| template_sections | JSONB | AI-generated narrative templates |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### form_configs

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| version | INTEGER | Form configuration version number |
| config | JSONB | Survey.js form configuration |
| is_active | BOOLEAN | Whether this is the active form version |
| created_by | UUID | Foreign key to auth.users (admin who created) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |
| notes | TEXT | Optional notes about this version |

## Development

### Code Style Guidelines

- All code comments in **English only**
- **No emojis** in code (comments, strings, variables)
- Use ES6+ syntax (const, arrow functions, async/await)
- Components: PascalCase
- Functions/variables: camelCase
- Keep functions small and focused

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Files to Understand

1. **Form Configuration** (`src/lib/form/defaultFormConfig.js`)
   - Defines all form fields and structure
   - Uses Survey.js JSON format

2. **Document Generators** (`src/lib/docx/`)
   - `dynamicDocxGenerator.js` - Q&A format
   - `narrativeDocxGenerator.js` - Narrative format
   - `narrativeTemplateEngine.js` - Template substitution logic

3. **Authentication** (`src/hooks/useAuth.js`, `src/middleware.js`)
   - Client-side auth hook
   - Server-side route protection

4. **API Routes** (`src/app/api/`)
   - RESTful endpoints for applications
   - Form configuration management
   - AI template generation

## API Endpoints

### Applications

- `GET /api/applications` - List user's applications
- `POST /api/applications` - Create new application
- `GET /api/applications/[id]` - Get single application
- `PATCH /api/applications/[id]` - Update application
- `DELETE /api/applications/[id]` - Delete application

### Configuration

- `GET /api/form-config` - Get current form configuration
- `PUT /api/form-config` - Update form configuration (admin)

### Templates

- `GET /api/narrative-template` - Health check
- `POST /api/narrative-template` - Generate/retrieve narrative template
- `DELETE /api/narrative-template` - Clear template cache

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `HUGGINGFACE_API_KEY` (optional)
4. Deploy

### Environment-Specific Configuration

- **Development:** Uses `.env.local`
- **Production:** Set environment variables in hosting platform

### Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Test authentication flow
- [ ] Test form submission and document generation
- [ ] Verify RLS policies are working
- [ ] Check auto-deletion is scheduled (pg_cron or serverless function)
- [ ] Enable email verification in Supabase
- [ ] Set up error monitoring (Sentry)
- [ ] Configure custom domain (if applicable)

## Security Considerations

### Data Privacy

- **Sensitive Data:** Application handles children's information, health data, domestic abuse disclosures
- **Auto-Deletion:** All application data deleted after 30 days
- **RLS Enabled:** Database-level access control prevents unauthorized access
- **No Long-term Storage:** Guest mode data never touches server
- **Audit Logging:** All data modifications tracked

### Authentication

- Email/password authentication via Supabase
- Session management with HTTP-only cookies
- Middleware-based route protection
- (Recommended) Enable email verification in production

### Best Practices

1. **Never commit `.env.local`** to version control
2. **Use service role key only server-side**
3. **Enable email verification** before production
4. **Implement rate limiting** on API endpoints
5. **Monitor Supabase usage** for suspicious activity
6. **Regular security audits** due to sensitive data nature

## UK GDPR Compliance

This application handles special category data under UK GDPR, including:
- Children's information
- Health conditions
- Domestic abuse allegations
- Social services involvement

### Compliance Features

- **Data minimization** - Only collects necessary information
- **30-day retention** - Automatic deletion after expiry
- **User consent** - Terms and Privacy acceptance required
- **Access control** - RLS ensures data isolation
- **Audit trail** - All modifications logged

### Recommended Additions

- [ ] User data export functionality
- [ ] Manual data deletion option (before 30-day expiry)
- [ ] Data Protection Impact Assessment (DPIA)
- [ ] Privacy by design review

## Troubleshooting

### Common Issues

**Build fails with "Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Supabase connection errors**
- Verify environment variables are set correctly
- Check Supabase project status
- Ensure database tables are created

**Form not loading**
- Check browser console for errors
- Verify form config API endpoint is accessible
- Clear localStorage: `localStorage.clear()`

**Documents not generating**
- Check docx library is installed
- Verify form data structure matches expected format
- Check browser console for errors

**AI templates not working**
- AI generation currently disabled by default (uses static templates)
- To enable: set `HUGGINGFACE_API_KEY` and modify `narrative-template/route.js:305`

## Contributing

This is a private project, but contributions are welcome. Please:

1. Follow existing code style (see CLAUDE.md)
2. Write clear commit messages
3. Test changes thoroughly
4. Update documentation as needed

## License

This project is proprietary. All rights reserved.

## Support

For questions or issues, please contact: Family Court Helper.io

---

**Disclaimer:** This tool is for informational purposes only and does not constitute legal advice. Users should consult a qualified solicitor for legal guidance on their specific situation.
