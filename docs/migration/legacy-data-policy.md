# Legacy Data Policy

## Decision

This rebuild starts with a fresh application database and does not migrate existing Symfony content, accounts, or analytics records into the new production stack.

## What Carries Forward

- feature scope
- domain concepts
- route intent
- content model patterns
- dashboard workflows worth preserving

## What Does Not Carry Forward

- current MySQL data
- current Doctrine migration history
- legacy passwords and security records
- legacy uploaded assets unless selected manually later

## Operational Implications

- local and production databases can be initialized from zero
- seed data may be added later for categories, demo users, or demo posts
- any legacy content needed for reference must be copied manually from `legacy/symfony-blog`

## Exception Policy

If the rebuild later requires selective migration, create a new migration plan doc rather than editing this baseline decision in place.

