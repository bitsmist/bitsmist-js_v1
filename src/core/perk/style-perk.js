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
		this.upgrade(BITSMIST.v1.Unit, "inventory", "style.styles", new ChainableStore());
		this.upgrade(BITSMIST.v1.Unit, "spell", "style.summon", function(...args) { return StylePerk._loadCSS(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "style.apply", function(...args) { return StylePerk._applyCSS(...args); });

		this._cssReady = {};
		this._cssReady["promise"] = new Promise((resolve, reject) => {
			this._cssReady["resolve"] = resolve;
			this._cssReady["reject"] = reject;
		});

		let promises = [];
		BITSMIST.v1.Unit.get("inventory", "promise.documentReady").then(() => {
			Object.entries(BITSMIST.v1.Unit.get("settings", "style.styles", {})).forEach(([sectionName, sectionValue]) => {
				promises.push(StylePerk._loadCSS(BITSMIST.v1.Unit, sectionName).then(() => {
					if (sectionValue["global"])
					{
						return StylePerk._applyCSS(BITSMIST.v1.Unit, sectionName);
					}
				}));
			});

			return Promise.all(promises).then(() => {
				this._cssReady["resolve"]();
			});
		});

	}

	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		this.upgrade(unit, "vault", "style.promise", Promise.resolve());
		this.upgrade(unit, "inventory", "style.styles", new ChainableStore({
			"chain":	BITSMIST.v1.Unit.get("inventory", "style.styles"),
		}));
		this.upgrade(unit, "event", "doApplySettings", StylePerk.StylePerk_onDoApplySettings);
		this.upgrade(unit, "event", "doTransform", StylePerk.StylePerk_onDoTransform);

		StylePerk.__loadAttrSettings(unit);

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static StylePerk_onDoApplySettings(sender, e, ex)
	{

		let styleName = StylePerk.__getDefaultFilename(this);

		// Load unit's default CSS
		if (StylePerk.__hasExternalCSS(this, styleName))
		{
			this.set("vault", "style.promise", StylePerk._loadCSS(this, styleName));
		}

	}

	// -------------------------------------------------------------------------

	static StylePerk_onDoTransform(sender, e, ex)
	{

		let styleName = StylePerk.__getDefaultFilename(this);

		return Promise.all([StylePerk._cssReady.promise, this.get("vault", "style.promise")]).then(() => {
			let promises = [];
			let chain = Promise.resolve();

			// Apply common CSS
			let css = this.get("settings", "style.options.apply", []);
			for (let i = 0; i < css.length; i++)
			{
				chain = chain.then(() => {
					return StylePerk._applyCSS(this, css[i]);
				});
			}

			// Apply unit's default CSS
			if (StylePerk.__hasExternalCSS(this, styleName))
			{
				chain = chain.then(() => {
					return StylePerk._applyCSS(this, styleName);
				});
			}

			return chain;
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
		let styleInfo = unit.get("inventory", `style.styles.${styleName}`) || StylePerk.__createStyleInfo(unit, styleName);

		switch (unit.get("settings", `style.styles.${styleName}.type`)) {
		case "CSS":
			styleInfo["CSS"] = unit.get("settings", `style.styles.${styleName}.CSS`);
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
				let url = unit.get("settings", `style.styles.${styleName}.URL`) || StylePerk.__getCSSURL(unit, styleName);
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

		return promise;

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
			if (unit.shadowRoot)
			{
				unit._root.adoptedStyleSheets = [...unit._root.adoptedStyleSheets, ss];
			}
			else
			{
				document.adoptedStyleSheets = [...document.adoptedStyleSheets, ss];
			}
			console.debug(`StylePerk._applyCSS(): Applied CSS. name=${unit.tagName}, styleName=${cssInfo["name"]}, id=${unit.id}, uniqueId=${unit.uniqueId}`);
		});

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

			unit.set("settings", "style.options.styleRef", styleRef);
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
	 * Check if the unit has the external CSS file.
	 *
	 * @param	{Unit}			unit				Unit.
	 *
	 * @return  {Boolean}		True if the unit has the external CSS file.
	 */
	static __hasExternalCSS(unit, styleName)
	{

		let ret = false;

		if (unit.get("settings", "style.options.styleRef"))
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
	 * @param	{String	}		styleName			Style name.
	 *
	 * @return  {String}		URL.
	 */
	static __getCSSURL(unit, styleName)
	{

		let path;
		let fileName;
		let query;

		let cssRef = unit.get("settings", "style.options.styleRef");
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
					unit.get("settings", "system.appBaseURL", ""),
					unit.get("settings", "system.stylePath", unit.get("settings", "system.unitPath", "")),
					unit.get("settings", "unit.options.path", ""),
				]);
			fileName = styleName + ".css";
			query = unit.get("settings", "unit.options.query");
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

		return unit.get("settings", "style.options.fileName",
			unit.get("settings", "unit.options.fileName",
				unit.tagName.toLowerCase()));

	}

}
