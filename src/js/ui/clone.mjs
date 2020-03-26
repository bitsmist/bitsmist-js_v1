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
//	Clone class
// =============================================================================

export default class Clone
{

	// -------------------------------------------------------------------------
	//  Constructor
	// -------------------------------------------------------------------------

	/**
     * Constructor.
     *
	 * @param	{String}		componentName		Component name.
	 * @param	{Object			options				Options for the component.
     */
	constructor(id, element, rootNode, parent)
	{

		this.id = id;
		this.element = element;
		this.rootNode = rootNode;
		this.parent = parent;

		this.modalOptions;
		this.modalResult;
		this.modalPromise;
		this.isModal = false;
		this.isOpen = false;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	/**
	 * Open the clone.
	 *
	 * @return  {Promise}		Promise.
	 */
	open()
	{

		return new Promise((resolve, reject) => {
			console.debug(`Clone.open(): Opening clone. id=${this.id}`);

			if (this.isOpen)
			{
				resolve();
				return;
			}

			Promise.resolve().then(() => {
				if (this.parent.getOption("autoRefresh"))
				{
					return this.refresh();
				}
			}).then(() => {
				return this.parent.events.trigger("_beforeOpen", this, {"clone":this});
			}).then(() => {
				return this.parent.events.trigger("beforeOpen", this, {"clone":this});
			}).then(() => {
				return this.parent.events.trigger("open", this, {"clone":this});
			}).then(() => {
				return this.parent.events.trigger("_open", this, {"clone":this});
			}).then(() => {
				console.debug(`Component.open(): Opened clone. id=${this.id}`);
				this.isOpen = true;
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
     * Open modal.
	 *
	 * @param	{array}			options				Options.
	 *
	 * @return  {Promise}		Promise.
     */
	openModal(options)
	{

		console.debug(`Clone.openModal(): Opening clone. id=${this.id}`);

		return new Promise((resolve, reject) => {
			if (this.isOpen)
			{
				resolve();
				return;
			}

			if (options)
			{
				this.parent.options = Object.assign(this.parent.options, options);
			}
			this.isModal = true;
			this.modalResult = {"result":false};
			this.modalOptions = options;
			this.modalPromise = { "resolve": resolve, "reject": reject };
			this.open();
			this.isOpen = true;
		});

	}


	// -------------------------------------------------------------------------

	/**
	 * Close the clone.
	 *
	 * @return  {Promise}		Promise.
	 */
	close()
	{

		return new Promise((resolve, reject) => {
			console.debug(`Clone.close(): Closing clone. id=${this.id}`);

			if (!this.isOpen)
			{
				resolve();
				return;
			}

			Promise.resolve().then(() => {
				return this.parent.events.trigger("_beforeClose", this, {"clone":this});
			}).then(() => {
				return this.parent.events.trigger("beforeClose", this, {"clone":this});
			}).then(() => {
				return this.parent.events.trigger("close", this, {"clone":this});
			}).then(() => {
				return this.parent.events.trigger("_close", this, {"clone":this});
			}).then(() => {
				console.debug(`Component.close(): Closed clone. id=${this.id}`);
				if (this.isModal)
				{
					this.modalPromise.resolve(this.modalResult);
				}
				this.isOpen = false;
				resolve();
			});
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Refresh the clone.
	 *
	 * @return  {Promise}		Promise.
	 */
	refresh()
	{

		console.debug(`Clone.refresh(): Refreshing clone. id=${this.id}`);

		return new Promise((resolve, reject) => {
			this.parent.events.trigger("_beforeRefresh", this, {"clone":this}).then(() => {
				return this.parent.events.trigger("beforeRefresh", this, {"clone":this});
			}).then(() => {
				return this.parent.events.trigger("refresh", this, {"clone":this});
			}).then(() => {
				return this.parent.events.trigger("_refresh", this, {"clone":this});
			}).then(() => {
				resolve();
			});
		});

	}

}
