# blusky-backup-webapp

HOT HOT HOT backups for your ATProto PDS

## Local

### Set up `.env`

First, please copy `.env.tpl` to `.env` and take a moment to review the contents and ensure they are correct for your dev plans.

### Set up Postgresql

On OSX you can do this with:

```bash
brew install postgresql
```

You may need to start the postgres service after installation with

```bash
brew services start postgresql
```

After setup you'll need to create your development database. Use `psql` to start a database session:

```bash
psql
```

If this is your first time setting up postgres on your machine. There's a chance the command above fails when you run it. If that happens, try the one below instead:

```bash
psql postgres
```

And then in the SQL console:

```sql
create database bsky_backups_dev;
create role admin with login password 'bluey';
grant all privileges on database bsky_backups_dev to admin;
```

These names and credentials match the examples in `.env.tpl` and should be customized for your setup.

### Set up `ngrok`

1. Run `pnpm dev`.
2. In another terminal, run `script/start-tunnel`.
   - (optional) You may want to set up a [static domain in ngrok](https://dashboard.ngrok.com/domains). Once you've set up a static domain, you can use it by instead running `script/start-tunnel --url spicy-rooster-fondly.ngrok-free.app` (replacing the URL with your own).
3. Visit your forwarding URL in the browser.

### Storybook

For many types of UI development you don't need a running app. Simply run `pnpm storybook` and visit `http://localhost:6006` to see our Storybook.

## Deployment

Deployment is handled via terrform using a Makefile.

Prerequisites:

- Install and properly configured `aws` cli tool
- Install OpenTofu (OpenTofu is a fork of Terraform that retains a full open source license -- please use OpenTofu when deploying Storacha services in order to avoid licensing issues).

```terminal
brew update
brew install opentofu
tofu -u version
```

- Install Docker (DockerDesktop for Mac for example)

To setup a deployment you can use for remote testing, do the following:

1. Copy `.env.terraform.tpl` to `.env.terraform`
2. Fill out the missing variables in `.env.terraform` (put your name in for TF_WORKSPACE for dev purposes)
3. Run `make apply` -- the first time you run this, it will take a LONG time to deploy everything - also you'll have to confirm deploying various things a few times along the way
4. If all is well, there's still a "blue-green" deployment to finish, so you'll want to `make wait-deploy` to wait for that to complete
5. Lastly, run `make db-migrate` to run migrations on the remote database

Your environment should be deployed at `~your-name~.bsky.storage`
