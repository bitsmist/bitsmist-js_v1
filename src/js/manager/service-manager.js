// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import LoaderUtil from '../util/loader-util';

// =============================================================================
//	Service manager class
// =============================================================================

// -----------------------------------------------------------------------------
//  Constructor
// -----------------------------------------------------------------------------

/**
 * Constructor.
 *
 * @param	{Object}		options				Options.
 */
 export default function ServiceManager(options)
{

	this._options = Object.assign({}, options);
	this._app = options["app"];
	this._services;
	this._index;

	// Load services
	if (this._options["services"])
	{
		this.loadServices(this._options["services"]);
	}

	/*
	return new Proxy(this, {
		get: (target, property) => {
			if (property in target)
			{
				return target[property];
			}
			else
			{
				return (...args) => {
					return this._callMethod(property, args);
				};
			}
		}
	});
	*/

}

// -----------------------------------------------------------------------------
//  Methods
// -----------------------------------------------------------------------------

/**
 * Add a service.
 *
 * @param	{String}		serviceName			Service name.
 * @param	{Object}		options				Options for the service.
 */
ServiceManager.prototype.add = function(serviceName, options)
{

	options = Object.assign({}, options);
	let className =  ("className" in options ? options["className"] : serviceName);
	options["app"] = this._app;

	let component = LoaderUtil.createObject(className, options);
	this._services.push(component);
	this._index[serviceName] = component;

}

// Error

ServiceManager.prototype.handle = function(options, filter)
{

	return new Promise((resolve, reject) => {
		this._callMethod("handle", [options], filter).then(() => {
			resolve();
		});;
	});

}

// Preferences

ServiceManager.prototype.load = function(options, filter)
{

	return new Promise((resolve, reject) => {
		this._callMethod("load", [options], filter).then((result) => {
			resolve(result);
		});;
	});

}

ServiceManager.prototype.save = function(options, filter)
{

	return new Promise((resolve, reject) => {
		this._callMethod("save", [options], filter).then(() => {
			resolve();
		});;
	});

}

ServiceManager.prototype.setup = function(options, filter)
{

	return new Promise((resolve, reject) => {
		this._callMethod("setup", [options], filter).then(() => {
			resolve();
		});;
	});

}

ServiceManager.prototype.register = function(component, options, filter)
{

	return new Promise((resolve, reject) => {
		this._callMethod("register", [component, options], filter).then(() => {
			resolve();
		});;
	});

}

// -----------------------------------------------------------------------------

/**
 * Add a service.
 *
 * @param	{Object}		settings			Service settings.
 */
ServiceManager.prototype.loadServices = function(settings)
{

	// Clear
	this._services = [];
	this._index = {};

	// Add services
	Object.keys(settings).forEach((key) => {
		this.add(key, settings[key]);
	});

}

// -----------------------------------------------------------------------------

/**
 * Get service.
 *
 * @param	{String}		serviceName			Service name.
 */
ServiceManager.prototype.getService = function(serviceName)
{

	return this._index[serviceName];

}

// -----------------------------------------------------------------------------
//  Protected
// -----------------------------------------------------------------------------

/**
 * Call service method.
 *
 * @param	{String}		methodName			Method name.
 * @param	{Array}			args				Arguments to method.
 *
 * @return  {Promise}		Promise.
 */
//ServiceManager.prototype._callMethod = function(methodName, args)
ServiceManager.prototype._callMethod = function(methodName, args, filter)
{

//	let filter = ( args.length > 1 && typeof args[1] == "function" ? args[1] : undefined );

	return new Promise((resolve, reject) => {
		let promises = [];
		for (let i = 0; i < this._services.length; i++)
		{
			if (typeof this._services[i][methodName] == "function")
			{
				if (!filter || filter(this._services[i]))
				{
					promises.push(this._services[i][methodName].apply(this._services[i], args));
				}
			}
		}

		Promise.all(promises).then((results) => {
			resolve(results);
		});
	});

}
