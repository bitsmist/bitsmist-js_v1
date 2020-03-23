// =============================================================================
/**
 * Bitsmist WebView - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

// =============================================================================
//	Base error class
// =============================================================================

export class BaseError extends Error
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		message				Error message.
     */
	constructor(errorName, options)
	{

		let message = ( options["message"] ? options["message"] : "");
		let constructorOpt = ( options["constructorOpt"] ? options["constructorOpt"] : undefined);

		super(message);

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, constructorOpt);
		}

		this.name = errorName;

	}

}

// =============================================================================
//	No route error class
// =============================================================================

export class NoRouteError extends BaseError
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		message				Error message.
     */
	constructor(message)
	{

		super("NoRouteError", {"message":message, "constructorOpt": NoRouteError});

	}

}

// =============================================================================
//	No node error class
// =============================================================================

export class NoNodeError extends BaseError
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		message				Error message.
     */
	constructor(message)
	{

		super("NoNodeError", {"message":message, "constructorOpt": NoRouteError});

	}

}

// =============================================================================
//	No class error class
// =============================================================================

export class NoClassError extends Error
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		message				Error message.
     */
	constructor(message)
	{

		super("NoClassError", {"message":message, "constructorOpt": NoRouteError});

	}

}

// =============================================================================
//	No method error class
// =============================================================================

export class NoMethodError extends Error
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		message				Error message.
     */
	constructor(message)
	{

		super("NoMethodError", {"message":message, "constructorOpt": NoRouteError});

	}

}

// =============================================================================
//	No resourc error class
// =============================================================================

export class NoResourceError extends Error
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		message				Error message.
     */
	constructor(message)
	{

		super("NoResourceError", {"message":message, "constructorOpt": NoRouteError});

	}

}

// =============================================================================
//	Not valid function error class
// =============================================================================

export class NotValidFunctionError extends Error
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		message				Error message.
     */
	constructor(message)
	{

		super("NotValidFunctionError", {"message":message, "constructorOpt": NoRouteError});

	}

}
