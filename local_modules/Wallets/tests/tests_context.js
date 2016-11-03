"use strict"
//
// Hydrate context
var context_object_instantiation_descriptions = 
[ 
	{
		module_path: __dirname + "/../../HostedMoneroAPIClient/HostedMoneroAPIClient",
		instance_key: "hostedMoneroAPIClient",
		options: {}
	},
	{
		module_path: __dirname + "/../../NeDBPersister/NeDBPersister",
		instance_key: "persister",
		options: {}
	}
]
function NewHydratedContext() 
{
	var initialContext = 
	{
		userDataAbsoluteFilepath: "./test_products"
	}

	return require("../../runtime_utils/runtime-context").NewHydratedContext(context_object_instantiation_descriptions, initialContext)
}
module.exports.NewHydratedContext = NewHydratedContext