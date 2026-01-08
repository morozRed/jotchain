# GitHub Metrics Security & Privacy Review

## Overview

This document summarizes the QA pass on permissions, privacy boundaries, and data visibility for the GitHub metrics feature (GH-027).

## Data Access Boundaries

### Workspace-Shared Data (Team Visibility)
The following data is shared across all members of a workspace:
- GitHub Installations (linked to workspace)
- GitHub Repositories (via installation)
- GitHub Contributors (workspace-scoped)
- GitHub Commits, Pull Requests, Reviews, Issues (cascade from repositories)
- GitHub Metric Snapshots (team and per-contributor)

**Enforcement**: All queries use `Current.workspace.github_*` associations, ensuring data is scoped to the authenticated user's current workspace.

### User-Private Data
The following data remains private to each user:
- Entries (notes) - `belongs_to :user`
- Persons - `belongs_to :user`
- Projects - `belongs_to :user`
- ContributorPersonLinks - Each user has their own mapping of GitHub contributors to their Persons

**Enforcement**: Queries use `Current.user.entries`, `Current.user.persons`, etc.

## Permission Model

### Workspace Roles
- **Member (0)**: View team data, use dashboards
- **Admin (1)**: Manage members, settings, install integrations
- **Owner (2)**: All admin permissions, can delete workspace

### Permission Checks
| Action | Required Role |
|--------|---------------|
| View team dashboard | Any member |
| View contributor profiles | Any member |
| View repositories | Any member |
| Install GitHub App | Admin or Owner |
| Remove GitHub Installation | Admin or Owner |
| Toggle repo sync | Admin or Owner |
| Manage workspace settings | Admin or Owner |
| Delete workspace | Owner only |

## Controller Security

### Session Authentication
- `ApplicationController#authenticate` requires valid session
- `Current.session` loaded from signed cookie
- Invalid sessions redirect to sign-in

### Workspace Context
- `Session#workspace` validates user membership before returning workspace
- `Session#switch_workspace!` validates membership before allowing switch
- `Current.workspace_membership` retrieved fresh on each request

### Data Queries
All GitHub-related controllers scope queries through `Current.workspace`:
- `TeamController`: `Current.workspace.github_contributors`, `Current.workspace.github_repositories`
- `RepositoriesController`: `Current.workspace.github_repositories`
- `Settings::IntegrationsController`: `Current.workspace.github_installations`

## API Security

### CSRF Protection
- All state-changing API calls require CSRF token
- Token included in meta tag and sent with requests

### Authorization Checks
- `can_manage_integrations?` checked before installation management
- Integration API uses `Current.workspace_membership&.can_install_integrations?`

## Identified Concerns

### Low Priority
1. **Metric Events**: Currently any authenticated user can track events. Consider rate limiting if abuse is possible.

### Recommendations
1. Add request logging for GitHub webhook endpoint for audit purposes
2. Consider adding workspace-level audit logs for integration changes
3. Add rate limiting to API endpoints if not already present

## Conclusion

The implementation correctly enforces:
- Workspace-level isolation for team data
- User-level isolation for private data (entries, persons, projects)
- Role-based access control for administrative actions
- Proper authentication on all endpoints
