# 📟 krosh

Tiniest CLI builder for Node.js, Deno and Bun:

- Zero Dependency
- Simple API
- Tiny Size
- Auto `--help`
- Object Router

## Overview

For the times when you do not need bloated CLI builders and your needs are simple!
The project is based on native Node.js' util.parseArgs and is aimed at providing the smallest footprint possible.

## Install

```sh
$ npm install krosh
```

## Usage

```js
import { krosh, defineCommand } from "krosh";

const hello = defineCommand({
  description: "Greets the user.",
  alias: ["hi"],
  options: {
    name: {
      description: "Name of the user",
      short: "n",
      type: "string",
    },
  },
  run: ({ args }) => console.log(`Hello, ${args?.name}!`),
});

const time = defineCommand({
  description: "Returns current time.",
  run: () => console.log(new Date()),
});

const bye = defineCommand({
  description: "Say bye.",
  run: () => console.log("Bye!"),
});

krosh({
  meta: {
    name: "myapp",
    version: "1.0.0",
    description: "My awesome app",
  },
  commands: {
    hello,
    say: {
      time,
      bye,
    },
  },
});
```

## Result

```
E:\myapp> node myapp.js
My awesome app (1.0.0)

Usage: myapp <command> [...flags] [...args]

Commands:
  hello     hi    Greets the user.
  say time        Returns current time.
  say bye         Say bye.

E:\myapp> node myapp.js hello --help
Usage: myapp hello [...flags] [...args]
Alias: myapp hi

Greets the user.

Flags:
  -n, --name     Name of the user

E:\myapp> node myapp.js say time
2025-03-21T00:50:13.430Z
```
