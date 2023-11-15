# Sip

Sip is lightweight, native and fast Gulp alternative. It is **8x faster** than Gulp on NodeJS and **4x faster** than Gulp on Bun.

> **Note:** This project is in early development stage.
> By now, it works only with [Bun](https://bun.sh) to achieve maximum performance utilizing ultra-fast [File I/O](https://bun.sh/docs/api/file-io).
> In the future, it will be able to work with NodeJS as well.

## Getting started

First, add package `sipjs` to your project:

```bash
bun install sipjs
```

Then, create `sip.config.js` in the root of your project:

```js
import { pipeline, read, write, gzip } from 'sipjs';

export const html = pipeline(
    // read EJS file inside current working directory by glob
    read('source/**/*.html'),
    // write files to build directory
    write('build'),
    // compress the same file — extenstion will be changed to .html.gz
    gzip({
        level: 9,
    }),
    // write compressed files to build directory
    write('build'),
);
```

Run it:

```bash
bunx sipjs html
```

## Create your own modules

Let's create a module that will minify HTML files. Create two files: `/modules/html-minify/module.js` with actial module...

```js
import { minify }  from '@minify-html/node';
import { SipFile } from 'sip';

// export your module as default
export default function htmlMinify(options) {
    return new TransformStream({
        transform(file, controller) {
            const result = minify(
                file.get(
                    SipFile.TYPE_NODEJS_BUFFER,
                ),
                options,
            );

            file.set(result);

            controller.enqueue(file);
        },
    });
}
```

... and `/modules/html-minify/task.js` with module declaration:

```js
export function minifyHTML(options) {
    return {
        module: () => import('./module.js'),
        // options for @minify-html/node
        args: [ options ],
    };
}
```

Now use that module in your pipeline:

```js
import { pipeline, read, write, gzip } from 'sipjs';
import { htmlMinify } from './modules/html-minify/task.js';

export const html = pipeline(
    read('source/**/*.ejs'),
    htmlMinify({
        do_not_minify_doctype: true,
        keep_html_and_head_opening_tags: true,
        keep_spaces_between_attributes: true,
        minify_js: true,
        minify_css_level_1: true,
    }),
    write('build'),
    gzip({
        level: 9,
    }),
    write('build'),
);
```

## Why Sip fast?

### No imports unless needed

In Gulp, you have to import all your modules in `gulpfile.js`, even if task you run does not use them. For example, running CSS tasks will import modules required by JS task.

In Sip, all modules must have importless declaration — this is why we created two files in "Create your own modules" section. Sip will import actual modules with their dependencies only when you run task that uses them. That approach dramatically reduces startup time.

### Native streams

Sip uses Web Streams API — and core part of Sip modules is [TransformStream](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream). It is native, fast and platform-independent.

### As little dependencies as possible

Sip have only one dependency — [picomatch](https://npmjs.com/package/picomatch) to match files by glob.

| Package | Packages installed | Bundle size |
| --- | --- | --- |
| `gulp` | 336 | 828 233 bytes |
| `sipjs` | 2 (**99% less**) | 60 611 bytes (**93% smaller**) |

### Bun

Sip uses [Bun](https://bun.sh), which starts [4x faster than NodeJS](https://twitter.com/jarredsumner/status/1499225725492076544) and provides File I/O that [10x faster than NodeJS](https://bun.sh/docs/api/file-io#benchmarks).
