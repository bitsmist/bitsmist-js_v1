// =============================================================================
/**
 * BitsmistJS - Javascript Web Client Framework
 *
 * @copyright		Masaki Yasutake
 * @link			https://bitsmist.com/
 * @license			https://github.com/bitsmist/bitsmist/blob/main/LICENSE
 */
// =============================================================================

import AjaxUtil from "../util/ajax-util.js";
import ChainableStore from "../store/chainable-store.js";
import Perk from "./perk.js";
import Unit from "../unit/unit.js";
import URLUtil from "../util/url-util.js";
import Util from "../util/util.js";

// =============================================================================
//	Style Perk Class
// =============================================================================

export default class StylePerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__vault = new WeakMap();
	static #__applied = {};
	static #__cssReady = {};
	static #__info = {
		"sectionName":		"style",
		"order":			200,
	};
	static #__spells = {
		"summon":			StylePerk.#_loadCSS,
		"apply":			StylePerk.#_applyCSS,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return StylePerk.#__info;

	}

	// -------------------------------------------------------------------------

	static get spells()
	{

		return StylePerk.#__spells;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Init Vars
		StylePerk.#__vault.set(Unit, {"applied": []});

		// Upgrade Unit
		Unit.upgrade("inventory", "style.styles", new ChainableStore());

		StylePerk.#__cssReady["promise"] = new Promise((resolve, reject) => {
			StylePerk.#__cssReady["resolve"] = resolve;
			StylePerk.#__cssReady["reject"] = reject;
		});

		// Load and apply common CSS
		let promises = [];
		Object.entries(Unit.get("setting", "system.style.styles", {})).forEach(([sectionName, sectionValue]) => {
			promises.push(StylePerk.#_loadCSS(Unit, sectionName, sectionValue, true));
		});

		return Promise.all(promises).then(async () => {
			let styles = Unit.get("setting", "system.style.options.apply", []);
			await StylePerk.#__applyAllCSS(Unit, styles);
			StylePerk.#__cssReady["resolve"]();
		});

	}

	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		StylePerk.#__vault.set(unit, {"applied": []});
		unit.upgrade("inventory", "style.styles", new ChainableStore({
			"chain":	Unit.get("inventory", "style.styles"),
		}));

		// Add event handlers
		unit.use("event.add", "beforeTransform", {"handler":StylePerk.#StylePerk_onBeforeTransform, "order":StylePerk.info["order"]});
		unit.use("event.add", "doTransform", {"handler":StylePerk.#StylePerk_onDoTransform, "order":StylePerk.info["order"]});

		StylePerk.#__loadAttrSettings(unit);
		StylePerk.#__adjustSettings(unit);

	}

	// -------------------------------------------------------------------------
	//  Event Handlers (Unit)
	// -------------------------------------------------------------------------

	static async #StylePerk_onBeforeTransform(sender, e, ex)
	{

		// Wait global CSS to be applied
		await StylePerk.#__cssReady.promise;

		// Clear CSS
		StylePerk.#_clearCSS(this);

		// Load common CSS
		let promises = [];
		let css = this.get("setting", "style.options.apply", []);
		for (let i = 0; i < css.length; i++)
		{
			promises.push(StylePerk.#_loadCSS(this, css[i]));
		}

		// Apply common CSS
		await Promise.all(promises);
		await StylePerk.#__applyAllCSS(this,css);

	}

	// -------------------------------------------------------------------------

	static async #StylePerk_onDoTransform(sender, e, ex)
	{

		if (this.get("setting", "style.options.hasStyle", true))
		{
			// Load unit-specific CSS
			let promises = [];
			let css = this.get("setting", `style.styles.${e.detail.styleName}.apply`, []);
			css.push(e.detail.styleName);
			for (let i = 0; i < css.length; i++)
			{
				promises.push(StylePerk.#_loadCSS(this, css[i]));
			}

			// Apply unit-specific CSS
			await Promise.all(promises);
			await StylePerk.#__applyAllCSS(this, css);
		}

	}

	// -------------------------------------------------------------------------
	//  Spells (Unit)
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
	static #_loadCSS(unit, styleName, options, shared)
	{

		let promise = Promise.resolve();
		let styleInfo = unit.get("inventory", "style.styles").get(styleName) || StylePerk.#__createStyleInfo(unit, styleName);
		let styleSettings = options || unit.get("setting", `style.styles.${styleName}`, {});

		if (styleInfo["status"] === "loaded")
		{
			console.debug(`StylePerk.#_loadCSS(): Style already loaded. name=${unit.tagName}, styleName=${styleName}`);
			return Promise.resolve(styleInfo);
		}

		switch (styleSettings["type"]) {
		case "CSS":
			styleInfo["CSS"] = styleSettings["CSS"];
			break;
		case "URL":
		default:
			if (styleInfo["status"] === "loading")
			{
				promise = styleInfo["promise"];
			}
			else
			{
				let url = styleSettings["URL"] || StylePerk.#__getDefaultURL(unit, styleName, styleSettings);
				Util.assert(url, () => `StylePerk.#_loadCSS(): CSS URL is not speicified. name=${unit.tagName}, styleName=${styleName}`);
				promise = AjaxUtil.loadCSS(url).then((css) => {
					styleInfo["CSS"] = css;
				});
				styleInfo["promise"] = promise;
				styleInfo["status"] = "loading";
			}
			break;
		}

		return promise.then(() => {
			styleInfo["status"] = "loaded";
			styleInfo["shared"] = shared;

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
	static async #_applyCSS(unit, styleName)
	{

		let cssInfo = unit.get("inventory", "style.styles").get(styleName);
		Util.assert(cssInfo, () => `StylePerk.#_applyCSS(): CSS not loaded. name=${unit.tagName || "Global"}, styleName=${styleName}, id=${unit.id}, uniqueId=${unit.uniqueId}`, ReferenceError);

		let ss = new CSSStyleSheet();
		await ss.replace(`${cssInfo["CSS"]}`);

		let shadowRoot = unit.get("inventory", "skin.shadowRoot");
		if (shadowRoot)
		{
			// Shadow DOM
			shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, ss];
		}
		else
		{
			// Light DOM
			styleName = (cssInfo["shared"] ? styleName : `${unit.tagName}.${styleName}`);
			if (!(styleName in StylePerk.#__applied) || StylePerk.#__applied[styleName]["count"] <= 0)
			{
				// Apply styles
				StylePerk.#__applied[styleName] = StylePerk.#__applied[styleName] || {};
				document.adoptedStyleSheets = [...document.adoptedStyleSheets, ss];
				StylePerk.#__applied[styleName]["object"] = ss;
				StylePerk.#__applied[styleName]["count"] = 1;
			}
			else
			{
				// Already applied
				StylePerk.#__applied[styleName]["count"]++;
			}

			StylePerk.#__vault.get(unit)["applied"].push(styleName);
		}

		console.debug(`StylePerk.#_applyCSS(): Applied CSS. name=${unit.tagName}, styleName=${cssInfo["name"]}, id=${unit.id}, uniqueId=${unit.uniqueId}`);

	}

	// -------------------------------------------------------------------------

	/**
	 * Clear styles. Works only in ShadowDOM.
	 *
	 * @param	{Unit}			unit				Parent unit.
	 */
	static #_clearCSS(unit)
	{

		let shadowRoot = unit.get("inventory", "skin.shadowRoot");
		if (shadowRoot)
		{
			// Shadow DOM
			shadowRoot.adoptedStyleSheets = [];
		}
		else
		{
			// Light DOM
			let applied = StylePerk.#__vault.get(unit)["applied"];
			if (applied.length > 0)
			{
				for (let i = 0; i < applied.length; i++)
				{
					StylePerk.#__applied[applied[i]]["count"]--;
				}
				StylePerk.#__vault.get(unit)["applied"] = [];

				// Re-apply other CSS
				document.adoptedStyleSheets = [];
				Object.keys(StylePerk.#__applied).forEach((key) => {
					if (StylePerk.#__applied[key]["count"] > 0)
					{
						document.adoptedStyleSheets = [...document.adoptedStyleSheets, StylePerk.#__applied[key]["object"]];
					}
				});
			}
		}

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------

	/**
	 * Apply all CSS.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{Array}			css					Array of CSS names to apply.
	 */
	static #__applyAllCSS(unit, css)
	{

		let chain = Promise.resolve();

		for (let i = 0; i < css.length; i++)
		{
			chain = chain.then(() => {
				return StylePerk.#_applyCSS(unit, css[i]);
			});
		}

		return chain;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get settings from element's attribute.
	 *
	 * @param	{Unit}			unit				Unit.
	 */
	static #__loadAttrSettings(unit)
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
	 * Adjust unit settings.
	 *
	 * @param	{Unit}			unit				Unit.
	 */
	static #__adjustSettings(unit)
	{

		let url = unit.get("setting", "style.options.styleRef");
		if (url === false)
		{
			unit.set("setting", "style.options.hasStyle", false);
		}
		else if (url)
		{
			let styleSettings = unit.get("setting", `style.styles.default`, {});
			styleSettings["type"] = styleSettings["type"] || "URL";
			styleSettings["URL"] = styleSettings["URL"] || ( typeof(url) === "string" ? url : "" );
			unit.set("setting", `style.styles.default`, styleSettings);
			unit.set("setting", "style.options.hasStyle", true);
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
	static #__createStyleInfo(unit, styleName)
	{

		let info = {
			"name": 	styleName,
			"CSS":		"",
			"status":	"",
		}

		unit.get("inventory", `style.styles`).set(styleName, info);

		return info;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to CSS file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		styleName			Style name.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		URL.
	 */
	static #__getDefaultURL(unit, styleName, options)
	{

		let url;

		let cssRef = unit.get("setting", "style.options.styleRef");
		if (cssRef && cssRef !== true)
		{
			// If URL is specified in ref, use it
			url = cssRef;
		}
		else
		{
			// Use default path and filename
			let path = Util.concatPath([
					unit.get("setting", "system.style.options.path",
						unit.get("setting", "system.unit.options.path", "")),
					Util.safeGet(options, "path",
						unit.get("setting", "style.options.path",
							unit.get("setting", "unit.options.path", ""))),
				]);
			let fileName =  StylePerk.#__getDefaultFilename(unit, styleName, options) + ".css";
			let query = unit.get("setting", "unit.options.query");

			url = Util.concatPath([path, fileName]) + (query ? `?${query}` : "");
		}

		return url;

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the default style name.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		styleName			Style name.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{String}		Style name.
	 */
	static #__getDefaultFilename(unit, styleName, options)
	{

		return	Util.safeGet(options, "fileName",
					unit.get("setting", "style.options.fileName",
						unit.get("setting", "unit.options.fileName",
							unit.tagName.toLowerCase())));

	}

}
