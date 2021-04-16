# BitsmistJS

## Introduction

BitsmistJS is a Web Components based javascript framework.

- **Independent plain HTML files:** Web designer friendly.
- **Component:** Every component is a custom element.
- **Autoload:** Files are loaded automatically when needed.
- **Event driven:** Easy to find where the handling code is.

## Examples

### HTML only

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

### HTML and Javascript

![Example-Example2](https://user-images.githubusercontent.com/49435291/114963611-15a8a400-9ea8-11eb-8801-dbb6e79ec79b.png)

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

## Documentation

Working on ...

## Contribution

Contributions are welcome. Currently there are no rules how to contribute yet.

- **Coding:** Bug report, improvement, advice etc.
- **Translation:** Since I'm not a native english speaker, I appreciate someone translate into nicer English. Ofcourse other languages are welcome.

