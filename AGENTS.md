# Repository Guidelines

## Project Structure & Module Organization
- `backend/` hosts the Rails + Inertia application. `app/controllers`, `app/models`, and `app/jobs` follow standard Rails domains, while `app/frontend` contains the React client (feature folders such as `components/`, `hooks/`, `pages/`, `routes/`).
- RSpec lives in `spec/` (`spec/requests` for HTTP flows, `spec/support` for shared helpers). Database migrations are under `db/migrate`.
- `landing_page/` is an Astro marketing site; keep static assets in `public/` and author content in `src/`.
- `PRD.md` captures product direction; keep it updated when behavior changes.

## Build, Test, and Development Commands
- From `backend/`, run `bin/setup` once to install gems, npm packages, and prepare the database.
- Use `bin/dev` to launch the Rails server and Vite dev server together (defined in `Procfile.dev`).
- Create migration: `be rails g migration {migration_name}`
- Execute `be rake db:migrate` whenever schema changes ship; include `RAILS_ENV=test` when preparing CI.
- Frontend tooling lives alongside Rails: `npm run lint`, `npm run format`, and `npm run check` operate on `app/frontend`.
- For the landing site, `cd landing_page && npm install`, `npm run dev` for local preview, and `npm run build` for publishable output.

## Coding Style & Naming Conventions
- Ruby follows the default 2-space indentation and Rails naming (`User` model, `UsersController`). Run `bundle exec rubocop` (rubocop-rails-omakase) before opening a PR.
- TypeScript components live in `app/frontend`. Use PascalCase for component files under `components/` and route directories under `pages/` with `index.tsx` entry points. Hooks stay camelCase inside `hooks/`.
- Prettier and ESLint enforce formatting; rely on `npm run format:fix` or `npm run lint:fix` rather than manual tweaks.

## Testing Guidelines
- Prefer request and feature coverage with RSpec (`*_spec.rb`). Run `bundle exec rspec` locally, and ensure new specs load data via factories in `spec/factories`.
- Keep fixtures deterministic; reset the test DB with `bin/rails db:test:prepare` after migration changes.

## Commit & Pull Request Guidelines
- Follow the existing Conventional Commit style (`feat:`, `fix:`, `chore:`) with a concise imperative summary.
- PRs should describe the change, link to the relevant issue or ticket, outline test coverage, and attach UI screenshots for visual updates.
- Request review once CI passes; note follow-up tasks explicitly in the description.

## Environment & Deployment Notes
- Secrets live in `backend/config/credentials.yml.enc`; use `bin/rails credentials:edit` with the shared key.
- Kamal deployment settings reside in `backend/config/deploy.yml`; update the SSR section only when enabling SSR support.
