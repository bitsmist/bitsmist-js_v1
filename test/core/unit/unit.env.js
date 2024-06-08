import {http} from 'msw';
import {setupServer} from 'msw/node';
import {Unit} from '../../../src/core/index';

const server = setupServer(...[
	http.get('/bar-main.html', async ({request}) => {
		return new Response('<div>bar-main</div>');
	}),
	http.get('/bar-main.css', async ({request}) => {
		return new Response('');
	}),
	http.get('/bar-main.settings1.js', async ({request}) => {
		return new Response(`{
			"basic": {
				"options": {
					"autoRestart": true
				}
			}
		}`);
	}),
	/*
	http.get('/bar-main.settings1.js', async ({request}) => {
		return new Response(`{
			"event": {
				"events": {
					"this": {
						"handlers": {
							"afterReady": "onAfterReady",
//							"beforeStop": "onBeforeStop"
						}
					}
				}
			}
		}`);
	}),
	*/
]);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// =============================================================================
// 	Unit
// =============================================================================

export class BarMain extends Unit
{

	/*
	_getSettings()
	{
		return this.__getSettings();
	}
	*/

	_getSettings()
//	__getSettings()
	{
		return {
			"basic": {
				"options": {},
			},
			"event": {
				"events": {
					"this": {
						"handlers": {
							"beforeStart": [this.init, this.onEvent],
							"doStart": [this.onEvent],
							"afterStart": [this.onEvent],
							"afterReady": [this.onEvent],
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
			}
		};
	}

	init(sender, e, ex)
	{

		this.testVars = {
			"eventOrder": [],
			"eventCalled": {},
			/*
			"eventCalled": {
				"beforeStart": false,
				"doStart": false,
				"afterStart": false,
				"afterReady": false,
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
			*/
		};
	}

	onEvent(sender, e, ex)
	{
		this.testVars["eventOrder"].push(e.type);
		this.testVars["eventCalled"][e.type] = true;
	}

}

customElements.define("bar-main", BarMain);
