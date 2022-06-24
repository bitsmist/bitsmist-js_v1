// ----------------------------------------------------------------------------
//	Global settings
// ----------------------------------------------------------------------------

BITSMIST.v1.settings.merge({
	"system": {
		"appBaseUrl":					"http://test.bitsmist.com",
		"apiBaseUrl":					"http://api.test.bitsmist.com/v1",
		"env":							"test",
		"splitComponent":				false,
	},
	"organizers": {
		"ErrorOrganizer": {
			"settings": {
				"captureError":			true
			}
		}
	},
	"ajaxUtil": {
		"options": {
			"COMMON":	{
				"withCredentials":		true
			},
		},
		"url": {
			"COMMON": {
				"dataType": 			"json",
				"format": 				"@baseUrl@/@resource@/@id@.@dataType@@query@",
			}
		},
	},
});
