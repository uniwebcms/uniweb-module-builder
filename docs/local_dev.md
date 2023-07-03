# Development with a local Uniweb instance

If you have access to a local version of Uniweb, you can build your widget collections using the same computer that hosts the Uniweb instance.

```bash
TARGET_MODULE=[name] yarn watch:local
```

This script will will create a bundle of Javascript code with `watch` option. The destination directory is `build_dev/[name]`. It will also update the `remoteRegistry.json` file.
