# GitHub App Setup Guide

This guide walks through creating and configuring the GitHub App for JotChain's team visibility features.

## 1. Create the GitHub App

1. Go to GitHub Settings > Developer Settings > GitHub Apps
2. Click "New GitHub App"
3. Fill in the basic information:
   - **GitHub App name**: `jotchain` (or your preferred name)
   - **Homepage URL**: `https://app.jotchain.com`
   - **Callback URL**: `https://app.jotchain.com/github/callback`
   - **Setup URL (optional)**: `https://app.jotchain.com/settings/integrations`
   - **Webhook URL**: `https://app.jotchain.com/webhooks/github`
   - **Webhook secret**: Generate a secure random string (save this!)

## 2. Configure Permissions

### Repository Permissions

| Permission | Access Level | Purpose |
|------------|--------------|---------|
| Contents | Read | Access commits and file changes |
| Issues | Read | Track issue activity |
| Metadata | Read | Basic repo information |
| Pull requests | Read | Track PR activity, reviews |

### Organization Permissions

| Permission | Access Level | Purpose |
|------------|--------------|---------|
| Members | Read | List organization members |

## 3. Subscribe to Events

Select the following webhook events:
- `push` - New commits pushed
- `pull_request` - PR opened, closed, merged
- `pull_request_review` - Reviews submitted
- `issues` - Issue opened, closed

## 4. Installation Options

- **Where can this GitHub App be installed?**: Choose based on your needs
  - "Only on this account" for testing
  - "Any account" for production

## 5. Generate Private Key

After creating the app:
1. Scroll down to "Private keys"
2. Click "Generate a private key"
3. Download the `.pem` file and store it securely

## 6. Get Credentials

From the GitHub App settings page, note:
- **App ID**: Numeric ID shown at the top
- **Client ID**: OAuth client ID
- **Client Secret**: Generate one if not present

## 7. Configure Environment Variables

Add these to your `.env` file or environment:

```bash
# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_APP_NAME=jotchain
GITHUB_APP_CLIENT_ID=Iv1.abc123def456
GITHUB_APP_CLIENT_SECRET=your_client_secret_here
GITHUB_APP_WEBHOOK_SECRET=your_webhook_secret_here

# Private key (escape newlines with \n for single-line env vars)
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"
```

## 8. Verify Configuration

In Rails console:
```ruby
GitHubApp.configured?
# => true

GitHubApp.jwt
# => "eyJhbGci..." (JWT token)
```

## Local Development

For local development with webhooks:

1. Use a tool like ngrok to expose your local server:
   ```bash
   ngrok http 3000
   ```

2. Update the GitHub App webhook URL to your ngrok URL:
   `https://your-ngrok-id.ngrok.io/webhooks/github`

3. Set your local environment variables accordingly

## Security Notes

- Never commit credentials to version control
- Rotate the webhook secret periodically
- Keep the private key secure and never share it
- Use environment variables or a secrets manager in production
