import '../../../src/core/index';
import './_settings.js';

export class BarMain extends BITSMIST.v1.Component
{

	_getSettings()
	{
		return this.__getSettings();
	}

	__getSettings()
	{
		return {
			"loadings": {
				"path": "common",
			},
			"settings": {
				"name": "BarMain",
			},
		};
	}

	init(sender, e, ex)
	{
		this.testVars = {};
	}

}
customElements.define("bar-main", BarMain);
