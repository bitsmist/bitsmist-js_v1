# BitsmistJS

## Introduction

BitsmistJS is a Web Components based javascript framework.

- **Independent plain HTML files:** No JSX. Web designer friendly.
- **Component:** Component based. Every component is a custom element.
- **Auto loading:** Files are loaded automatically when needed.
- **Event driven:** Easy to find where the handling code is.

## Installtion

### CDN

Load library from CDN in your html files.

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/bitsmist/bitsmist-js_v1@latest/dist/bitsmist-js_v1.min.js"></script>
```

### Download

Download BitsmistJS and put bitsmist-js_v1.min.js in dist folder to somewhere under your web sites and load it in your html files.

```html
<script type="text/javascript" src="/js/bitsmist-js_v1.min.js"></script>
```

## How index.html looks like

### HTML only component

![bitmist_htmlonly](https://user-images.githubusercontent.com/49435291/117800924-a77cb480-b28e-11eb-81cc-fb970df386ec.png)

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

![bitmist_htmlandjs](https://user-images.githubusercontent.com/49435291/117800938-ac416880-b28e-11eb-9c1a-912106af0cf6.png)

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

## How components look like

Basically each component consists of one or more html files and one javascript file. You can create a component without a script file if the component doesn't have event handlers, without html files if the component doesn't have interface. Html files are just plain html, so you can write styles directly in the html files or include independent css files. Javascript files are classes which inherits bitsmist base component objects which initialize, trigger events and load html files.

![Example-Component](https://user-images.githubusercontent.com/49435291/115198078-a2639400-a12c-11eb-89da-8fdcef16fa8e.png)

## Documentation

Working on ...

## Contribution

Contributions are welcome. Currently there are no rules how to contribute yet.

- **Coding:** Bug report, improvement, advice etc.
- **Translation:** Since I'm not a native english speaker, I appreciate someone translate into nicer English. Of course other languages are welcome.

