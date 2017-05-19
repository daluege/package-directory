# package-directory

Lets you configure the path where local dependencies are installed. In NPM, the default is `node_modules`. Behaves similar to the [`.bowerrc`](https://bower.io/docs/config/) `"directory"` property. Compatible to POSIX-compliant systems.

## Installation

Install this package using NPM:

    npm install package-directory --save

## Configuration

Add a `"directory"` to your `package.json` configuration as follows:

    {
      "directory": "dist/modules"
    }

Node modules will be placed in `dist/modules` relative to your package root.

## License

MIT © 2016 Filip Dalüge ([see license](./LICENSE))
