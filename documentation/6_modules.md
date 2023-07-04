# Modules

You can create Abc-Map modules and use them online on any instance of Abc-Map.

<!-- toc -->

- [Why should I create an Abc-Map module ?](#why-should-i-create-an-abc-map-module-)
- [Getting started](#getting-started)
- [What is the development/deployment workflow ?](#what-is-the-developmentdeployment-workflow-)
- [How does it work ?](#how-does-it-work-)
- [Status, API, documentation](#status-api-documentation)
- [Templates](#templates)
- [Developing with a local Abc-Map monorepo](#developing-with-a-local-abc-map-monorepo)

<!-- tocstop -->

## Why should I create an Abc-Map module ?

- It is relatively simple to write: using a template you just have to implement your feature
- It will be easily accessible to users: you can share your modules thanks to Gitlab pages and GitHub pages

## Getting started

You must install NodeJS 18 or above. You can use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating):

```
    $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
    $ source ~/.bashrc  # or restart your terminal
```

Initialize your module:

```
  $ npx -p @abc-map/create-module create-module --name my-module
```

Start it:

```
  $ cd my-module
  $ npm dev
```

## What is the development/deployment workflow ?

1. Create a module: `$ npx -p @abc-map/create-module create-module --name my-module`
2. Implement your feature using `Openlayers`, `TurfJS`, `@abc-map/module-api` and whatever you want
3. Publish your module on Gitlab or GitHub, or on any static server
4. Share the public URL of your module, per example `https://abc-map.gitlab.io/module-template/`
5. Users can now browse this URL and enable module in their browsers

Watch this video to see the whole process in action: https://www.youtube.com/embed/mqt_CzSplJg

## How does it work ?

Abc-Map modules are JSX functions that returns a `Module` instance. They are loaded at runtime in [Abc-Map](https://abc-map.fr/)

```
// See: https://gitlab.com/abc-map/abc-map/-/tree/master/packages/module-api
export interface Module {
    // Metadata methods
    getId(): ModuleId;
    getReadableName(): string;
    getShortDescription(): string;
    getFullDescription(): string | undefined;

    // User interface of module
    getView(): ReactElement;
}

function moduleFactory(): Module {
  return new ModuleImplementation()
}

export default moduleFactory;
```

This template includes [Openlayers](https://openlayers.org/) and [Turfjs](https://turfjs.org/).

It is built with [Webpack](https://webpack.js.org/), you can distribute assets (images, videos, +) with
your modules.

## Status, API, documentation

Module system is young, there is little documentation, and the API can change quickly.

See [@abc-map/module-api](../packages/module-api) package source code.

## Templates

- Typescript + web workers: [https://gitlab.com/abc-map/module-template](https://gitlab.com/abc-map/module-template)
- Python: TBD
- WebASM: TBD

## Developing with a local Abc-Map monorepo

Link local module-api package:

    $ cd abc-map/packages/module-api
    $ npm link

Link local dependency:

    $ npm link "@abc-map/module-api"

Use this URL to open your module:

    $ xdg-open http://localhost:7000/?instance=local
