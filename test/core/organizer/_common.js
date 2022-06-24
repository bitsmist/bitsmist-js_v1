import { rest } from 'msw';
import { setupServer } from 'msw/node';
import '../../../src/core/index';
import './_settings.js';

const server = setupServer(...[
		rest.get('http://test.bitsmist.com/bar-footer1.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-footer1</div>'));
		}),
		rest.get('http://test.bitsmist.com/bar-footer2a.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-footer2a</div>'));
		}),
		rest.get('http://test.bitsmist.com/common/bar-footer3.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-footer3</div>'));
		}),
		rest.get('http://test.bitsmist.com/common/bar-footer4a.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-footer4a</div>'));
		}),
		rest.get('http://test.bitsmist.com/bar-footer5.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-footer5</div>'));
		}),
		rest.get('http://test.bitsmist.com/bar-footer6.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-footer6</div>'));
		}),
		rest.get('http://test.bitsmist.com/bar-footer6a.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-footer6a</div>'));
		}),
		rest.get('http://test.bitsmist.com/bar-footer6a.js', (req, res, ctx) => {
			return res(
				ctx.text(' \
					class BarFooter6a extends BITSMIST.v1.Component \
					{\
						_getSettings()\
						{\
							return {\
								"settings": {\
									"name": "BarFooter6a"\
								}\
							}\
						}\
					}\
				'),
			);
		}),
		rest.get('http://test.bitsmist.com/bar-footer7a.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-footer7a</div>'));
		}),
		rest.get('http://test.bitsmist.com/bar-footer8a.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-footer8a</div>'));
		}),
		rest.get('http://test.bitsmist.com/common/bar-footer9.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-footer9</div>'));
		}),
		rest.get('http://test.bitsmist.com/common/bar-footer10a.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-footer10a</div>'));
		}),

		rest.get('http://test.bitsmist.com/bar-main1.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-main1</div>'));
		}),
		rest.get('http://test.bitsmist.com/bar-main1.js', (req, res, ctx) => {
			return res(
				ctx.text(' \
					class BarMain1 extends BITSMIST.v1.Component \
					{\
						_getSettings()\
						{\
							return {\
								"settings": {\
									"name": "BarMain1"\
								}\
							}\
						}\
					}\
				'),
			);
		}),
		rest.get('http://test.bitsmist.com/bar-main2.settings.js', (req, res, ctx) => {
			return res(
				ctx.text(' \
					class BarMain2 extends BITSMIST.v1.Component \
					{\
						_getSettings()\
						{\
							return {\
								"settings": {\
									"name": "BarMain2"\
								}\
							}\
						}\
					}\
				'),
			);
		}),
		rest.get('http://test.bitsmist.com/bar-main2.js', (req, res, ctx) => {
			return res(
				ctx.text('')
			);
		}),
		rest.get('http://test.bitsmist.com/bar-main2.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-main2</div>'));
		}),
		rest.get('http://test.bitsmist.com/bar-main3a.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-main3</div>'));
		}),
		rest.get('http://test.bitsmist.com/bar-main3a.js', (req, res, ctx) => {
			return res(
				ctx.text(' \
					class BarMain3 extends BITSMIST.v1.Component \
					{\
						_getSettings()\
						{\
							return {\
								"settings": {\
									"name": "BarMain3"\
								}\
							}\
						}\
					}\
				'),
			);
		}),
		rest.get('http://test.bitsmist.com/common/bar-main4.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-main4</div>'));
		}),
		rest.get('http://test.bitsmist.com/common/bar-main4.js', (req, res, ctx) => {
			return res(
				ctx.text(' \
					class BarMain4 extends BITSMIST.v1.Component \
					{\
						_getSettings()\
						{\
							return {\
								"settings": {\
									"name": "BarMain4"\
								}\
							}\
						}\
					}\
				'),
			);
		}),
		rest.get('http://test.bitsmist.com/bar-main5a.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-main5a</div>'));
		}),
		rest.get('http://test.bitsmist.com/bar-main5a.js', (req, res, ctx) => {
			return res(
				ctx.text(' \
					class BarMain5 extends BITSMIST.v1.Component \
					{\
						_getSettings()\
						{\
							return {\
								"settings": {\
									"name": "BarMain5"\
								}\
							}\
						}\
					}\
				'),
			);
		}),
		rest.get('http://test.bitsmist.com/common/bar-main6a.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-main6a</div>'));
		}),
		rest.get('http://test.bitsmist.com/common/bar-main6a.js', (req, res, ctx) => {
			return res(
				ctx.text(' \
					class BarMain6 extends BITSMIST.v1.Component \
					{\
						_getSettings()\
						{\
							return {\
								"settings": {\
									"name": "BarMain6"\
								}\
							}\
						}\
					}\
				'),
			);
		}),
		rest.get('http://test.bitsmist.com/bar-main.html', (req, res, ctx) => {
			return res(ctx.text('<div>bar-main</div>'));
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
afterEach(() => {
	server.resetHandlers();
	document.body.innerHTML = "";
});
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
