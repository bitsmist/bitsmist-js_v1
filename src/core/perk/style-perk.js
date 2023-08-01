// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/master/LICENSE
 */
// =============================================================================

import AjaxUtil from "../util/ajax-util";
import ChainableStore from "../store/chainable-store.js";
import Perk from "./perk";
import URLUtil from "../util/url-util.js";
import Util from "../util/util";

// =============================================================================
//	Style Perk Class
// =============================================================================

export default class StylePerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"style",
			"order":		200,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Upgrade Unit
		this.upgrade(BITSMIST.v1.Unit, "vault", "style.applied", []);
		this.upgrade(BITSMIST.v1.Unit, "inventory", "style.styles", new ChainableStore());
		this.upgrade(BITSMIST.v1.Unit, "spell", "style.summon", function(...args) { return StylePerk._loadCSS(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "style.apply", function(...args) { return StylePerk._applyCSS(...args); });

		this._cssReady = {};
		this._cssReady["promise"] = new Promise((resolve, reject) => {
			this._cssReady["resolve"] = resolve;
			this._cssReady["reject"] = reject;
		});

		// Load and apply common CSS
		let chain = Promise.resolve();
		BITSMIST.v1.Unit.get("inventory", "promise.documentReady").then(() => {
			let promises = [];
			Object.entries(BITSMIST.v1.Unit.get("setting", "system.style.styles", {})).forEach(([sectionName, sectionValue]) => {
				promises.push(StylePerk._loadCSS(BITSMIST.v1.Unit, sectionName, sectionValue));
			});

			Promise.all(promises).then(() => {
				let chain = Promise.resolve();
				let styles = BITSMIST.v1.Unit.get("setting", "system.style.options.apply", []);
				for (let i = 0; i < styles.length; i++)
				{
					chain = chain.then(() => {
						return StylePerk._applyCSS(BITSMIST.v1.Unit, styles[i]);
					});
				}

				return chain.then(() => {
					this._cssReady["resolve"]();
				});
			});
		});

	}

	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		this.upgrade(unit, "vault", "style.applied", []);
		this.upgrade(unit, "inventory", "style.styles", new ChainableStore({
			"chain":	BITSMIST.v1.Unit.get("inventory", "style.styles"),
		}));
		this.upgrade(unit, "event", "doTransform", StylePerk.StylePerk_onDoTransform);

		StylePerk.__loadAttrSettings(unit);

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static StylePerk_onDoTransform(sender, e, ex)
	{

		return StylePerk._cssReady.promise.then(() => {
			// List common CSS
			let css = this.get("setting", "style.options.apply", []);

			if (e.detail.styleName || StylePerk.__hasDefaultCSS(this))
			{
				let styleName = e.detail.styleName || "default";

				// Add style specific common CSS
				css = css.concat(this.get("setting", `style.styles.${styleName}.apply`, []));

				// Add unit specific CSS
				css.push(styleName);
			}

			// Load CSS
			let promises = [];
			for (let i = 0; i < css.length; i++)
			{
				promises.push(StylePerk._loadCSS(this, css[i]));
			}

			return Promise.all(promises).then(() => {
				// Clear CSS
				StylePerk._clearCSS(this);

				// Apply CSS
				let chain = Promise.resolve();
				for (let i = 0; i < css.length; i++)
				{
					chain = chain.then(() => {
						return StylePerk._applyCSS(this, css[i]);
					});
				}

				return chain;
			});
		});

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Load the CSS.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		styleName			Style name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _loadCSS(unit, styleName, options)
	{

		let promise = Promise.resolve();
		let styleInfo = unit.get("inventory", "style.styles").get(styleName) || StylePerk.__createStyleInfo(unit, styleName);
		let styleSettings = options || unit.get("setting", `style.styles.${styleName}`, {});

		if (styleInfo["status"] === "loaded")
		{
			console.debug(`StylePerk._loadCSS(): Style already loaded. name=${unit.tagName}, styleName=${styleName}`);
			return promise.then(() => {
				return styleInfo;
			});
		}

		switch (styleSettings["type"]) {
		case "CSS":
			styleInfo["CSS"] = styleSettings["CSS"];
			styleInfo["status"] = "loaded";
			unit.get("inventory", `style.styles`).set(styleName, styleInfo);
			break;
		case "URL":
		default:
			if (styleInfo["status"] === "loading")
			{
				promise = styleInfo["promise"];
			}
			else
			{
				let url = styleSettings["URL"] || (styleName === "default" && StylePerk.__getCSSURL(unit));
				Util.assert(url, `StylePerk._loadCSS(): CSS URL is not speicified. name=${unit.tagName}, styleName=${styleName}`);
				promise = AjaxUtil.loadCSS(url).then((css) => {
					let styleInfo = unit.get("inventory", "style.styles").get(styleName);
					styleInfo["CSS"] = css;
					styleInfo["status"] = "loaded";
					unit.get("inventory", "style.styles").set(styleName, styleInfo);
				});
				styleInfo["promise"] = promise;
				styleInfo["status"] = "loading";
				unit.get("inventory", `style.styles`).set(styleName, styleInfo);
			}
			break;
		}

		return promise.then(() => {
			return styleInfo;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply style.
	 *
	 * @param	{Unit}			unit				Parent unit.
	 * @param	{String}		styleName			Style name.
	 */
	static _applyCSS(unit, styleName)
	{

		let cssInfo = unit.get("inventory", "style.styles").get(styleName);
		let ss = new CSSStyleSheet();

		Util.assert(cssInfo,`StylePerk._applyCSS(): CSS not loaded. name=${unit.tagName || "Global"}, styleName=${styleName}, id=${unit.id}, uniqueId=${unit.uniqueId}`, ReferenceError);

		return Promise.resolve().then(() => {
			return ss.replace(`${cssInfo["CSS"]}`);
		}).then(() => {
			let shadowRoot = unit.get("state", "skin.shadowRoot");
			if (shadowRoot)
			{
				// Shadow DOM
				shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, ss];
			}
			else
			{
				// Light DOM
				styleName = unit.tagName + "." + styleName;
				if (!(styleName in StylePerk.__applied) || StylePerk.__applied[styleName]["count"] <= 0)
				{
					// Apply styles
					StylePerk.__applied[styleName] = StylePerk.__applied[styleName] || {};
					document.adoptedStyleSheets = [...document.adoptedStyleSheets, ss];
					StylePerk.__applied[styleName]["object"] = ss;
					StylePerk.__applied[styleName]["count"] = 1;
				}
				else
				{
					// Already applied
					StylePerk.__applied[styleName]["count"]++;
				}

				let applied = unit.get("vault", "style.applied");
				applied.push(styleName);
				unit.set("vault", "style.applied", applied);
			}

			console.debug(`StylePerk._applyCSS(): Applied CSS. name=${unit.tagName}, styleName=${cssInfo["name"]}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear styles. Works only in ShadowDOM.
	 *
	 * @param	{Unit}			unit				Parent unit.
	 */
	static _clearCSS(unit)
	{

		let shadowRoot = unit.get("state", "skin.shadowRoot");
		if (shadowRoot)
		{
			// Shadow DOM
			shadowRoot.adoptedStyleSheets = [];
		}
		else
		{
			// Light DOM
			let applied = unit.get("vault", "style.applied");
			if (applied.length > 0)
			{
				for (let i = 0; i < applied.length; i++)
				{
					StylePerk.__applied[applied[i]]["count"]--;
				}
				unit.set("vault", "style.applied", []);

				// Re-apply other CSS
				document.adoptedStyleSheets = [];
				Object.keys(StylePerk.__applied).forEach((key) => {
					if (StylePerk.__applied[key]["count"] > 0)
					{
						document.adoptedStyleSheets = [...document.adoptedStyleSheets, StylePerk.__applied[key]["object"]];
					}
				});
			}
		}

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------
	//
	/**
	 * Get settings from element's attribute.
	 *
	 * @param	{Unit}			unit				Unit.
	 */
	static __loadAttrSettings(unit)
	{

		if (unit.hasAttribute("bm-styleref"))
		{
			let styleRef = unit.getAttribute("bm-styleref") || true;
			if (styleRef === "false")
			{
				styleRef = false;
			}

			unit.set("setting", "style.options.styleRef", styleRef);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Returns a new Style info object.
	 *
	 * @param	{Unit}			unit				Parent unit.
	 * @param	{String}		styleName			Style name.
	 *
	 * @return  {Object}		Style info.
	 */
	static __createStyleInfo(unit, styleName)
	{

		return {
			"name": 	styleName,
			"CSS":		"",
			"status":	"",
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the unit has the default CSS file.
	 *
	 * @param	{Unit}			unit				Unit.
	 *
	 * @return  {Boolean}		True if the unit has the external CSS file.
	 */
	static __hasDefaultCSS(unit)
	{

		let ret = false;

		if (unit.get("setting", "style.options.styleRef", true))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to CSS file.
	 *
	 * @param	{Unit}			unit				Unit.
	 *
	 * @return  {String}		URL.
	 */
	static __getCSSURL(unit)
	{

		let path;
		let fileName;
		let query;

		let cssRef = unit.get("setting", "style.options.styleRef");
		if (cssRef && cssRef !== true)
		{
			// If URL is specified in ref, use it
			let url = URLUtil.parseURL(cssRef);
			path = url.path;
			fileName = url.filename;
			query = url.query;
		}
		else
		{
			// Use default path and filename
			path = Util.concatPath([
					unit.get("setting", "system.style.options.path", unit.get("setting", "system.unit.options.path", "")),
					unit.get("setting", "skin.options.path", unit.get("setting", "unit.options.path", "")),
				]);
			fileName =  StylePerk.__getDefaultFilename(unit) + ".css";
			query = unit.get("setting", "unit.options.query");
		}

		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the default style name.
	 *
	 * @param	{Unit}			unit				Unit.
	 *
	 * @return 	{String}		Style name.
	 */
	static __getDefaultFilename(unit)
	{

		return unit.get("setting", "style.options.fileName",
			unit.get("setting", "unit.options.fileName",
				unit.tagName.toLowerCase()));

	}

}

// Init
StylePerk.__applied = {};
