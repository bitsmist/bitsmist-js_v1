/**
 * @jest-environment jsdom
 */
import { BarMain, BarFooter } from './_common.js';
window.BarMain = BarMain;
window.BarFooter = BarFooter;

// -----------------------------------------------------------------------------

test('Waiting for Children Test - should wait for all the children to be "ready"', async () => {
	document.body.innerHTML = "<bar-main1 bm-autoload></bar-main1><bar-main2 bm-autoload bm-split></bar-main2>";

	return BITSMIST.v1.DefaultLoader.loadTags(document.body, {"waitForTags":true}).then(() => {
		expect(document.querySelector("bar-main1").state).toBe("ready");
		expect(document.querySelector("bar-main2").state).toBe("ready");
		expect(document.body.innerHTML).toBe('<bar-main1 bm-autoload="" bm-powered=""><div>bar-main1</div></bar-main1><bar-main2 bm-autoload="" bm-split="" bm-powered=""><div>bar-main2</div></bar-main2>');
	});
});
