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
import URLUtil from "../util/url-util.js";
import Util from "../util/util.js";

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
		BITSMIST.v1.Unit.upgrade("vault", "style.applied", []);
		BITSMIST.v1.Unit.upgrade("inventory", "style.styles", new ChainableStore());
		BITSMIST.v1.Unit.upgrade("spell", "style.summon", function(...args) { return StylePerk._loadCSS(...args); });
		BITSMIST.v1.Unit.upgrade("spell", "style.apply", function(...args) { return StylePerk._applyCSS(...args); });

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
				promises.push(StylePerk._loadCSS(BITSMIST.v1.Unit, sectionName, sectionValue, true));
			});

			return Promise.all(promises).then(() => {
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
		unit.upgrade("vault", "style.applied", []);
		unit.upgrade("inventory", "style.styles", new ChainableStore({
			"chain":	BITSMIST.v1.Unit.get("inventory", "style.styles"),
		}));
		unit.upgrade("event", "beforeTransform", StylePerk.StylePerk_onBeforeTransform, {"order":this.info["order"]});
		unit.upgrade("event", "doTransform", StylePerk.StylePerk_onDoTransform, {"order":this.info["order"]});

		StylePerk.__loadAttrSettings(unit);
		StylePerk.__adjustSettings(unit);

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static StylePerk_onBeforeTransform(sender, e, ex)
	{

		return StylePerk._cssReady.promise.then(() => {
			let promises = [];

			// List common CSS
			let css = this.get("setting", "style.options.apply", []);

			if (this.get("setting", "style.options.hasStyle", true))
			{
				// List style-specific common CSS
				css = css.concat(this.get("setting", `style.styles.${e.detail.styleName}.apply`, []));

				// Load unit-specific CSS
				promises.push(StylePerk._loadCSS(this, e.detail.styleName, e.detail.styleOptions));
			}

			// Load common CSS
			for (let i = 0; i < css.length; i++)
			{
				promises.push(StylePerk._loadCSS(this, css[i]));
			}

			return Promise.all(promises);
		});

	}

	// -------------------------------------------------------------------------

	static StylePerk_onDoTransform(sender, e, ex)
	{

		// List common CSS
		let css = this.get("setting", "style.options.apply", []);

		if (this.get("setting", "style.options.hasStyle", true))
		{
			// List style-specific common CSS
			css = css.concat(this.get("setting", `style.styles.${e.detail.styleName}.apply`, []));

			// List unit-specific CSS
			css.push(e.detail.styleName);
		}

		// Clear CSS
		StylePerk._clearCSS(this);

		// Apply All CSS
		let chain = Promise.resolve();
		for (let i = 0; i < css.length; i++)
		{
			chain = chain.then(() => {
				return StylePerk._applyCSS(this, css[i]);
			});
		}

		return chain;

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
	static _loadCSS(unit, styleName, options, shared)
	{

		let promise = Promise.resolve();
		let styleInfo = unit.get("inventory", "style.styles").get(styleName) || StylePerk.__createStyleInfo(unit, styleName);
		let styleSettings = options || unit.get("setting", `style.styles.${styleName}`, {});

		if (styleInfo["status"] === "loaded")
		{
			console.debug(`StylePerk._loadCSS(): Style already loaded. name=${unit.tagName}, styleName=${styleName}`);
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
				let url = styleSettings["URL"] || StylePerk.__getDefaultURL(unit, styleName, styleSettings);
				Util.assert(url, `StylePerk._loadCSS(): CSS URL is not speicified. name=${unit.tagName}, styleName=${styleName}`);
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
				styleName = (cssInfo["shared"] ? styleName : `${unit.tagName}.${styleName}`);
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
	 * Adjust unit settings.
	 *
	 * @param	{Unit}			unit				Unit.
	 */
	static __adjustSettings(unit)
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
	static __createStyleInfo(unit, styleName)
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
	static __getDefaultURL(unit, styleName, options)
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
					unit.get("setting", "system.style.options.path",
						unit.get("setting", "system.unit.options.path", "")),
					Util.safeGet(options, "path",
						unit.get("setting", "style.options.path",
							unit.get("setting", "unit.options.path", ""))),
				]);
			fileName =  StylePerk.__getDefaultFilename(unit, styleName, options) + ".css";
			query = unit.get("setting", "unit.options.query");
		}

		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

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
	static __getDefaultFilename(unit, styleName, options)
	{

		return	Util.safeGet(options, "fileName",
					unit.get("setting", "style.options.fileName",
						unit.get("setting", "unit.options.fileName",
							unit.tagName.toLowerCase())));

	}

}

// Init
StylePerk.__applied = {};
