# TODO

- The way the Durable Objects are built is still pretty weird. Partly it's because the `BackupDO` needs to be able to pull in the atproto `NodeOAuthClient`. I think in an ideal setup, this would all be broken into a few separate packages in a monorepo and built with proper TS project references. For now, we awkwardly end up with `.durable-objects/durable-objects` for output.
