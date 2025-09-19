# JotChain Implementation Plan

## Overview
This document outlines the implementation plan for JotChain's premium features, subscription management, and authentication enhancements.

## Key Updates (Completed)
✅ Stripe Integration with monthly ($5) and yearly ($50) plans
✅ Free tier with 3-day history limitation
✅ Billing section in tabbed settings interface
✅ AI insights access control for Pro users
✅ Export restrictions for free users
✅ Upgrade banners and CTAs throughout the app

---

## Pricing Structure

### Plans
- **Free Plan**: $0/forever
  - 3 days of entry history
  - Unlimited daily entries
  - No AI insights
  - No export functionality

- **Pro Monthly**: $5/month
  - Unlimited history
  - AI-powered insights
  - Export in multiple formats
  - Priority support

- **Pro Yearly**: $50/year (save $10)
  - All Pro features
  - 2 months free

---

## 1. Stripe Integration (✅ COMPLETED)

### Database Setup (✅ Completed)
- **Subscriptions table created**
  - `user_id` (foreign key)
  - `stripe_customer_id` (string)
  - `stripe_subscription_id` (string)
  - `status` (string)
  - `current_period_end` (datetime)
  - `plan_name` (string)
  - `timestamps`

- **Users table updated**
  - Added `stripe_customer_id` column
  - Added unique index on stripe_customer_id

- **Subscription model created**
  - Belongs to User relationship
  - Plan validation and status tracking
  - Helper methods for feature access (days_of_history_allowed, ai_insights_allowed, export_allowed)
  - Auto-creation of free subscription for new users

### Stripe Configuration (✅ Completed)
- **Add to Rails credentials:**
  ```yaml
  stripe:
    publishable_key: pk_test_...
    secret_key: sk_test_...
    webhook_secret: whsec_...
    price_ids:
      pro_monthly: price_...
      pro_yearly: price_...
      premium_monthly: price_...
      premium_yearly: price_...
  ```

- **Create Stripe initializer** (`config/initializers/stripe.rb`)
  - Configure Stripe API version
  - Set API keys from credentials

- **Set up webhook endpoint**
  - Route: `POST /stripe/webhooks`
  - Handle events: subscription.created, subscription.updated, subscription.deleted, invoice.payment_succeeded

### Controllers & Services (✅ Completed)

#### BillingController (Implemented)
- `index` - Show billing dashboard
- `checkout` - Create Stripe Checkout session
- `success` - Handle successful payment
- `cancel` - Handle canceled payment
- `portal` - Redirect to Stripe Customer Portal

#### StripeService (Implemented)
- `create_customer(user)`
- `create_checkout_session(user, price_id)`
- `create_portal_session(user)`
- `handle_subscription_created(event)`
- `handle_subscription_updated(event)`
- `handle_subscription_deleted(event)`

#### StripeWebhooksController (Implemented)
- Verify webhook signature
- Process Stripe events
- Update subscription records
- Handle edge cases and errors

---

## 2. Billing Section in Settings (✅ COMPLETED)

### UI Components (✅ Completed)

#### Settings Page Structure
- Implemented tabbed interface using Stimulus controller
- Four tabs: Profile, Password, Billing, Danger Zone
- Billing tab loads content via Turbo Frame for better performance

#### Subscription Status Component (✅ Implemented)
- Current plan display (Free/Pro/Premium)
- Renewal date
- Payment status indicator
- Quick actions (Upgrade/Manage/Cancel)

#### Plan Selection Cards (✅ Implemented)
- Responsive pricing cards with monthly/yearly toggle
- Clear feature comparison
- Stripe Checkout integration for secure payments

### Features to Implement
- **Subscription Management**
  - Display current subscription status
  - Show next billing date and amount
  - Usage statistics (entries, AI calls)

- **Payment Methods**
  - Link to Stripe Customer Portal
  - Update card information
  - View payment history

- **Plan Changes**
  - Upgrade/downgrade flow
  - Proration information
  - Confirmation modals

---

## 3. Complete AI Insights Functionality (✅ COMPLETED)

### Backend Improvements (✅ Completed)

#### Subscription-based Limitations
- Free users cannot access AI insights (redirected to billing)
- Pro users have unlimited AI usage
- Access control implemented in InsightsController

#### Usage Tracking (✅ Implemented)
- Created `ai_usage_logs` table
  - user_id
  - insight_type
  - tokens_used
  - created_at

- Add monthly usage counter to User model
- Reset counters via scheduled job

#### Caching Strategy
- Cache generated insights for 24 hours
- Use Rails.cache with user-specific keys
- Implement cache warming for popular content

#### AiUsageLog Model (✅ Created)
- Tracks all AI insights usage
- Records insight type and tokens used
- Monthly usage aggregation methods

### Frontend Enhancements

#### UI Improvements
- **Loading States**
  - Skeleton loaders
  - Progress bars for long operations
  - Estimated time remaining

- **Copy & Export Features**
  - Individual item copy buttons
  - Bulk export to PDF/Markdown
  - Email insights to self


### Free Tier Restrictions (✅ Implemented)

#### Entry Access Control
- Free users can only access entries from the last 3 days
- `accessible_entries` method on User model filters by subscription
- Older entry access redirects to billing page

#### Export Restrictions
- Export functionality disabled for free users
- Export button shows upgrade prompt
- Redirects to billing page when attempted

#### Upgrade Banners
- Created UpgradeBannerComponent for consistent CTAs
- Context-aware messaging (history limit, AI insights, export)
- Displayed on relevant pages for free users

---

## Pending Features

### Google OAuth Authentication
- Add `omniauth-google-oauth2` gem
- Configure OAuth credentials
- Update Devise settings
- Add "Sign in with Google" button

### Enhanced AI Insight Types
- Professional achievement announcements
- Industry insights and thoughts
- Team celebration posts

#### Weekly Reflection Prompts
- What went well this week?
- Key learnings and insights
- Areas for improvement

#### Goal Progress Analysis
- Track progress against stated goals
- Identify blockers and solutions
- Suggest next actions

#### Team Update Summaries
- Format for different audiences (manager, peers, reports)
- Include metrics and KPIs
- Highlight cross-team collaborations

---

## Implementation Status

### ✅ Completed
- Stripe integration with webhooks
- Database migrations (subscriptions, AI usage logs)
- Subscription and AiUsageLog models
- Billing controller and views
- Tabbed settings interface
- Free tier restrictions (3-day history)
- AI insights access control
- Export functionality restrictions
- Upgrade banners and CTAs
- Usage tracking for AI insights

### 🔄 In Progress
- Testing Stripe integration in development
- Configuring production Stripe keys

### 📋 TODO
- Google OAuth authentication
- Enhanced AI insight types (LinkedIn posts, weekly reflections)
- Email notifications for subscription changes
- Admin dashboard for subscription management
- Referral program implementation

---

## Technical Considerations

### Security
- Store all sensitive data encrypted
- Use Strong Parameters for all forms
- Implement rate limiting for AI endpoints
- Validate webhook signatures

### Performance
- Background jobs for heavy operations
- Database indexing for common queries
- CDN for static assets
- Implement caching strategically

### Monitoring
- Track Stripe webhook failures
- Monitor AI API usage and costs
- Set up alerts for subscription issues
- Log all billing events

### Testing Strategy
- Unit tests for models and services
- Integration tests for Stripe workflows
- System tests for critical paths
- Use Stripe test mode for development

---

## Configuration Requirements

### Environment Variables Needed
- STRIPE_PUBLISHABLE_KEY (test and production)
- STRIPE_SECRET_KEY (test and production)
- STRIPE_WEBHOOK_SECRET
- STRIPE_MONTHLY_PRICE_ID
- STRIPE_YEARLY_PRICE_ID
- OPENAI_API_KEY (already configured)

### Database Indexes (✅ Created)
- users.stripe_customer_id (unique)
- subscriptions.user_id
- subscriptions.stripe_subscription_id (unique)
- subscriptions.status
- ai_usage_logs.user_id
- ai_usage_logs.insight_type

### Background Jobs
- [ ] Subscription renewal reminders
- [ ] Usage reset job (monthly)
- [ ] Insight cache warming
- [ ] Failed payment notifications

### Frontend Assets
- [ ] Stripe.js library
- [ ] Loading animations
- [ ] Success/error icons
- [ ] Export functionality scripts

---

## Success Metrics

- **Conversion Rate**: Free to paid conversion
- **Churn Rate**: Monthly subscription cancellations
- **AI Usage**: Average insights generated per user
- **Revenue**: MRR growth
- **User Satisfaction**: NPS score for billing experience

---

## Deployment Notes

### Before Production Launch
1. Configure Stripe production keys in Rails credentials
2. Set up Stripe webhook endpoint URL in Stripe Dashboard
3. Create Stripe products and price IDs
4. Test complete subscription flow in staging
5. Ensure SSL certificate is properly configured
6. Set up monitoring for webhook failures
7. Configure email notifications for subscription events

### Migration Strategy for Existing Users
1. All existing users will automatically get a free subscription
2. Send email announcement about new Pro features
3. Offer early-bird discount for first month
4. Grandfather any promised features to early adopters

### Support Considerations
- Create FAQ for billing questions
- Document refund policy
- Set up customer support email for billing issues
- Create internal admin tools for subscription management
