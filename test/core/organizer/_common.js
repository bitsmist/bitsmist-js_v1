import { rest } from 'msw';
import { setupServer } from 'msw/node';
import '../../../src/core/index';
import './_settings.js';

const server = setupServer(...[
		rest.get('http://test.bitsmist.com/bar-main.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-main</div>'));
		}),
		rest.get('http://test.bitsmist.com/bar-main2.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-main2</div>'));
		}),
		rest.get('http://test.bitsmist.com/bar-main3.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-main3</div>'));
		}),
		rest.get('http://test.bitsmist.com/test.settings.js', (req, res, ctx) => {
			return res(ctx.json({
				"settings": {
					"externalSettingsTest": true
				}
			}));
		}),
	]
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

export class BarMain extends BITSMIST.v1.Component
{

	_getSettings()
	{
		return this.__getSettings();
	}

	__getSettings()
	{
		return {
			"settings": {
				"name": "BarMain",
			},
			"events": {
				"this": {
					"handlers": {
						// "beforeStart": [
						// 	{"handler": this.onBeforeStart},
						// ],
						"beforeStart": [this.init],
						"doStart": [this.onEvent],
						"afterStart": [this.onEvent],
						"beforeStop": [this.onEvent],
						"doStop": [this.onEvent],
						"afterStop": [this.onEvent],
						"beforeSetup": [this.onEvent],
						"doSetup": [this.onEvent],
						"afterSetup": [this.onEvent],
						"afterAppend": [this.onEvent],
						"beforeRefresh": [this.onEvent],
						"doRefresh": [this.onEvent],
						"afterRefresh": [this.onEvent],
						"doTarget": [this.onEvent],
						"beforeFetch": [this.onEvent],
						"doFetch": [this.onEvent],
						"afterFetch": [this.onEvent],
						"beforeFill": [this.onEvent],
						"doFill": [this.onEvent],
						"afterFill": [this.onEvent],
						"beforeStop": [this.onEvent],
						"doStop": [this.onEvent],
						"afterStop": [this.onEvent],
					}
				}
			},
		};
	}

	init(sender, e, ex)
	{
		this.testVars = {
			"eventCalled": {
				"beforeStart": false,
				"doStart": false,
				"afterStart": false,
				"beforeStop": false,
				"doStop": false,
				"afterStop": false,
				"beforeSetup": false,
				"doSetup": false,
				"afterSetup": false,
				"afterAppend": false,
				"beforeRefresh": false,
				"doRefresh": false,
				"afterRefresh": false,
				"doTarget": false,
				"beforeFetch": false,
				"doFetch": false,
				"afterFetch": false,
				"beforeFill": false,
				"doFill": false,
				"afterFill": false,
			}
		};

		this.testVars["eventCalled"]["beforeStart"] = true;
	}

	onEvent(sender, e, ex)
	{
		this.testVars["eventCalled"][e.type] = true;
	}

}
customElements.define("bar-main", BarMain);
