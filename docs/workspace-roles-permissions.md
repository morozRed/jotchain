# Workspace Roles and Permissions

This document defines the role-based access control model for workspaces and team GitHub metrics.

## Overview

Workspaces are the team container for shared GitHub data. Each user belongs to one or more workspaces through `WorkspaceMembership` with an assigned role.

## Roles

### Owner

The workspace creator. Full administrative control.

- **Limit**: Exactly one owner per workspace (can be transferred)
- **Cannot be removed** without transferring ownership first

### Admin

Elevated permissions for managing the workspace and integrations.

- **Typical use**: Team leads, engineering managers
- **Can be multiple admins** per workspace

### Member

Standard team member with read access to shared data.

- **Typical use**: Individual contributors
- **Default role** for new invitations

---

## Permission Matrix

| Action | Owner | Admin | Member |
|--------|-------|-------|--------|
| **Workspace Settings** |
| View workspace settings | ✅ | ✅ | ❌ |
| Edit workspace name/settings | ✅ | ✅ | ❌ |
| Delete workspace | ✅ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ |
| **Membership** |
| View members list | ✅ | ✅ | ✅ |
| Invite new members | ✅ | ✅ | ❌ |
| Remove members | ✅ | ✅ | ❌ |
| Change member roles | ✅ | ✅* | ❌ |
| Leave workspace | ❌** | ✅ | ✅ |
| **GitHub Integration** |
| Install GitHub App | ✅ | ✅ | ❌ |
| Remove GitHub installation | ✅ | ✅ | ❌ |
| Select/deselect repos for sync | ✅ | ✅ | ❌ |
| View installation status | ✅ | ✅ | ✅ |
| **Team Metrics (Shared Data)** |
| View team dashboard | ✅ | ✅ | ✅ |
| View contributor profiles | ✅ | ✅ | ✅ |
| View repository metrics | ✅ | ✅ | ✅ |
| View signals/alerts | ✅ | ✅ | ✅ |
| Export team metrics | ✅ | ✅ | ❌ |
| **Private Data (User-Scoped)** |
| Link contributors to own Persons | ✅ | ✅ | ✅ |
| Link projects to repos | ✅ | ✅ | ✅ |
| View own notes/entries | ✅ | ✅ | ✅ |
| View others' notes/entries | ❌ | ❌ | ❌ |
| **Billing** |
| View billing info | ✅ | ✅ | ❌ |
| Manage subscription | ✅ | ❌ | ❌ |

**Notes:**
- `*` Admins can change roles to/from member, but cannot promote to owner or demote other admins
- `**` Owner cannot leave without transferring ownership first

---

## Data Visibility by Role

### Shared (Workspace-Level) Data

All workspace members can view:

1. **GitHub Installations**: Which GitHub accounts/orgs are connected
2. **Repositories**: Synced repos with metadata (name, sync status)
3. **Contributors**: GitHub usernames, avatars, activity
4. **Commits**: Commit history for synced repos
5. **Pull Requests**: PRs with status, author, reviewers
6. **Reviews**: Review activity and turnaround
7. **Issues**: Issue tracking data
8. **Metrics**: Computed metrics and snapshots
9. **Signals**: Team health alerts (stale PRs, bottlenecks)

### Private (User-Level) Data

Each user's private data is **never visible to others**:

1. **Entries (Notes)**: Personal journal entries
2. **Persons**: User's contact/people tracking
3. **Projects**: User's project organization
4. **Signals (from notes)**: AI-detected patterns in entries
5. **GitHubContributorLinks**: User's mapping of contributors to their Persons
6. **ProjectRepositories**: User's mapping of projects to repos

---

## Role Assignment Rules

### Initial Workspace Creation

When a user creates a workspace:
```ruby
WorkspaceMembership.create!(
  workspace: workspace,
  user: creator,
  role: :owner
)
```

### Invitations

When inviting a new member:
- Default role: `member`
- Admin can specify: `member` or `admin`
- Owner can specify: `member` or `admin`

### Role Changes

```ruby
# Admin promoting member to admin
current_user.admin? && target.member? → allowed
current_user.admin? && target.admin? → denied (cannot modify fellow admins)

# Owner can do anything except remove themselves
current_user.owner? → allowed (except self-removal)
```

### Ownership Transfer

```ruby
# Only owner can transfer
def transfer_ownership(new_owner)
  return false unless current_membership.owner?
  return false unless new_owner.workspace_id == workspace_id

  transaction do
    current_membership.update!(role: :admin)
    new_owner.update!(role: :owner)
  end
end
```

---

## Implementation Notes

### WorkspaceMembership Model

```ruby
class WorkspaceMembership < ApplicationRecord
  belongs_to :workspace
  belongs_to :user

  enum :role, { member: 0, admin: 1, owner: 2 }

  validates :role, presence: true
  validates :user_id, uniqueness: { scope: :workspace_id }

  # Ensure exactly one owner per workspace
  validate :single_owner, if: :owner?

  private

  def single_owner
    existing_owner = workspace.memberships.owner.where.not(id: id).exists?
    errors.add(:role, "workspace already has an owner") if existing_owner
  end
end
```

### Authorization Helpers

```ruby
# In ApplicationController or concern
def authorize_workspace_admin!
  unless current_membership&.admin? || current_membership&.owner?
    raise NotAuthorizedError, "Admin access required"
  end
end

def authorize_workspace_owner!
  unless current_membership&.owner?
    raise NotAuthorizedError, "Owner access required"
  end
end

def current_membership
  @current_membership ||= current_workspace.memberships.find_by(user: current_user)
end
```

### Policy Objects (Optional)

```ruby
class WorkspacePolicy
  def initialize(user, workspace)
    @membership = workspace.memberships.find_by(user: user)
  end

  def manage_settings?
    admin_or_owner?
  end

  def manage_members?
    admin_or_owner?
  end

  def install_github?
    admin_or_owner?
  end

  def view_metrics?
    member?
  end

  def export_metrics?
    admin_or_owner?
  end

  def delete?
    owner?
  end

  private

  def member?
    @membership.present?
  end

  def admin_or_owner?
    @membership&.admin? || @membership&.owner?
  end

  def owner?
    @membership&.owner?
  end
end
```

---

## Personal Workspace Behavior

Every user has a "personal workspace" created automatically:

- User is the owner
- Cannot be deleted
- Can have additional members invited (becomes a team workspace)
- Single-user workspace has no practical permission restrictions

```ruby
# During user signup or migration
workspace = Workspace.create!(
  name: "#{user.name}'s Workspace",
  slug: user.email.split('@').first,
  owner: user
)

WorkspaceMembership.create!(
  workspace: workspace,
  user: user,
  role: :owner
)
```

---

## Future Considerations

1. **Custom Roles**: Allow workspaces to define custom permission sets
2. **Team-Level Permissions**: Different permissions for different repo subsets
3. **Audit Log**: Track permission changes and admin actions
4. **SSO/SAML**: Enterprise identity provider integration with role mapping
