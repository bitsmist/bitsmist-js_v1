# BitsmistJS

## Introduction

BitsmistJS is a Web Components-based javascript framework.

- **Independent plain HTML files:** No JSX. Web designer-friendly.
- **Component:** Component-based. Every component is a custom element.
- **Autoloading:** Files are loaded automatically when needed.
- **Event-driven:** Easy to find where the handling code is.

## Installtion

### CDN

Load library from CDN in your HTML files.

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/bitsmist/bitsmist-js_v1@latest/dist/bitsmist-js_v1.min.js"></script>
```

### Download

Download BitsmistJS and put bitsmist-js_v1.min.js in the dist folder somewhere under your websites and load it in your Html files.

```html
<script type="text/javascript" src="/js/bitsmist-js_v1.min.js"></script>
```

## How index.html looks like

### HTML only component

![bitmistjs_htmlonly](https://bitsmist.com/images/en/bitsmistjs_htmlonly.png)

**`index.html`**
``` html
<html>
<head>
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/bitsmist/bitsmist-js_v1@latest/dist/bitsmist-js_v1.min.js"></script>
</head>
<body>
<pad-hello data-autoload="https://example.com/pad-hello.html"></pad-hello>
</body>
</html>
```

**`pad-hello.html`**
``` html
<h1>Hello, World!</h1>
```

### HTML and Javascript component

![bitmistjs_htmlandjs](https://bitsmist.com/images/en/bitsmistjs_htmlandjs.png)

**`index.html`**
``` html
<html>
<head>
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/bitsmist/bitsmist-js_v1@latest/dist/bitsmist-js_v1.min.js"></script>
</head>
<body>
<pad-hello data-autoload="https://example.com/pad-hello.js"></pad-hello>
</body>
</html>
```
**`pad-hello.js`**
``` js
class PadHello extends BITSMIST.v1.Pad
{
  _getSettings()
  {
    return {
      "settings": {
        "name": "PadHello",
      },
      "events": {
        "afterAppend": "onAfterAppend"
      },
      "elements": {
        "go": {
          "rootNode": "button",
          "events": {
            "click": "onButtonClick"
          }
        }
      }
    }
  }

  onAfterAppend(sender, e, ex)
  {
    this.querySelector("h1").innerText = "Ready";
  }

  onButtonClick(sender, e, ex)
  {
    this.querySelector("h1").innerText = "Hello";
  }
}
```

**`pad-hello.html`**
``` html
<h1></h1>
<button>Go</button>
```
## Documentation

- [English](https://bitsmist.com/en/bitsmistjs/docs/start)
- [Japanese（日本語）](https://bitsmist.com/ja/bitsmistjs/docs/start)

## Contribution

Contributions are welcome. Currently, there are no rules on how to contribute yet.

- **Coding:** Bug report, improvement, advice, etc.
- **Translation:** Since I'm not a native English speaker, I appreciate someone translates into nicer English. Of course, other languages are welcome.
