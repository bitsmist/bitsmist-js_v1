# BitsmistJS

## Introduction

BitsmistJS is a Web Components based javascript framework.

- **Independent plain HTML files:** Web designer friendly.
- **Component:** Every component is a custom element.
- **Autoload:** Files are loaded automatically when needed.
- **Event driven:** Easy to find where the handling code is.

## Installtion

### CDN

Load library from CDN in your html files.

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/bitsmist/bitsmist-js_v1@0.9.6/dist/bitsmist-js_v1.min.js"></script>
```

### Download

Download BitsmistJS and put bitsmist-js_v1.min.js in dist folder to somewhere under your web sites and load it in your html files.

```html
<script type="text/javascript" src="/js/bitsmist-js_v1.min.js"></script>
```

## Examples

### HTML only component

![Example1](https://user-images.githubusercontent.com/49435291/114845854-17765700-9e17-11eb-8d92-c4a1e04f2224.png)

<!--
**`index.html`**
``` html
<html>
<head>
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/bitsmist/bitsmist-js_v1@0.9.6/dist/bitsmist-js_v1.min.js"></script>
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
-->

### HTML and Javascript component

![Example-Example2](https://user-images.githubusercontent.com/49435291/115175776-9d8be980-a106-11eb-8405-073cc25bc1da.png)

<!--
**`index.html`**
``` html
<html>
<head>
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/bitsmist/bitsmist-js_v1@0.9.6/dist/bitsmist-js_v1.min.js"></script>
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
			"name":	"PadHello",
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
-->

<!--
## Components

Each component consists of html files and a javascript file. Html files are just plain html, so you can write styles directly in the files or include independent css files. Javascript file contains a class which extends a basic bitsmist class. If you don't need code, you don't need a javascript file. If your component doesn't have visuals you don't need html files.
-->

## Documentation

Working on ...

## Contribution

Contributions are welcome. Currently there are no rules how to contribute yet.

- **Coding:** Bug report, improvement, advice etc.
- **Translation:** Since I'm not a native english speaker, I appreciate someone translate into nicer English. Of course other languages are welcome.

