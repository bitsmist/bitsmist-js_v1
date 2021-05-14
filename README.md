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

## How component looks like

Basically, each component consists of one or more HTML files and one javascript file. You can create a component without a script file if the component doesn't have event handlers, without HTML files if the component doesn't have an interface. Html files are just plain HTML, so you can write styles directly in the HTML files or include independent CSS files. Javascript files are classes that inherit BitsmistJS base component objects which initialize, trigger events, and load HTML files.

![Example-Component](https://user-images.githubusercontent.com/49435291/115198078-a2639400-a12c-11eb-89da-8fdcef16fa8e.png)

## Documentation

Working on ...

## Contribution

Contributions are welcome. Currently, there are no rules on how to contribute yet.

- **Coding:** Bug report, improvement, advice, etc.
- **Translation:** Since I'm not a native English speaker, I appreciate someone translates into nicer English. Of course, other languages are welcome.
