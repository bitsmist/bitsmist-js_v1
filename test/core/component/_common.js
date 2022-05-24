import { rest } from 'msw';
import { setupServer } from 'msw/node';
import '../../../src/core/index';
import './_settings.js';

const server = setupServer(...[
		rest.get('http://test.bitsmist.com/bar-main.html', (req, res, ctx) => {
			//return res(ctx.status(200));
			return res(ctx.text('<div>test</div>'));
		}),
		rest.get('http://test.bitsmist.com/test.settings.js', (req, res, ctx) => {
			//return res(ctx.status(200));
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
		};
	}

}
customElements.define("bar-main", BarMain);
