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

		super("NoNodeError", {"message":message, "constructorOpt": NoNodeError});

	}

}

// =============================================================================
//	No class error class
// =============================================================================

export class NoClassError extends BaseError
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

		super("NoClassError", {"message":message, "constructorOpt": NoClassError});

	}

}

// =============================================================================
//	No method error class
// =============================================================================

export class NoMethodError extends BaseError
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

		super("NoMethodError", {"message":message, "constructorOpt": NoMethodError});

	}

}

// =============================================================================
//	No resourc error class
// =============================================================================

export class NoResourceError extends BaseError
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

		super("NoResourceError", {"message":message, "constructorOpt": NoResourceError});

	}

}

// =============================================================================
//	Not valid function error class
// =============================================================================

export class NotValidFunctionError extends BaseError
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

		super("NotValidFunctionError", {"message":message, "constructorOpt": NotValidFunctionError});

	}

}
