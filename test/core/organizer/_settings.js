// ----------------------------------------------------------------------------
//	Global settings
// ----------------------------------------------------------------------------

BITSMIST.v1.settings.merge({
	"system": {
		"specPath":						"/specs/",
		"templatePath":					"/components/",
		"componentPath":				"/components/",
		"appBaseUrl":					"http://dev.sale-quest.com",
		"apiBaseUrl":					"http://saleapi.dev.sale-quest.com/v1",
		"env":							"test",
		"splitComponent":				true,
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
