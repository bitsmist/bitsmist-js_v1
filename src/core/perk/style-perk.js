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

		// Upgrade Component
		this.upgrade(BITSMIST.v1.Component, "inventory", "style.styles", new ChainableStore());
		this.upgrade(BITSMIST.v1.Component, "spell", "style.summon", function(...args) { return StylePerk._loadCSS(...args); });
		this.upgrade(BITSMIST.v1.Component, "spell", "style.apply", function(...args) { return StylePerk._applyCSS(...args); });

		this._cssReady = {};
		this._cssReady["promise"] = new Promise((resolve, reject) => {
			this._cssReady["resolve"] = resolve;
			this._cssReady["reject"] = reject;
		});

		let promises = [];
		BITSMIST.v1.Component.get("inventory", "promise.documentReady").then(() => {
			Object.entries(BITSMIST.v1.Component.get("settings", "style.styles", {})).forEach(([sectionName, sectionValue]) => {
				promises.push(StylePerk._loadCSS(BITSMIST.v1.Component, sectionName).then(() => {
					if (sectionValue["global"])
					{
						return StylePerk._applyCSS(BITSMIST.v1.Component, sectionName);
					}
				}));
			});

			return Promise.all(promises).then(() => {
				this._cssReady["resolve"]();
			});
		});

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Upgrade component
		this.upgrade(component, "vault", "style.promise", Promise.resolve());
		this.upgrade(component, "inventory", "style.styles", new ChainableStore({
			"chain":	BITSMIST.v1.Component.get("inventory", "style.styles"),
		}));
		this.upgrade(component, "event", "doApplySettings", StylePerk.StylePerk_onDoApplySettings);
		this.upgrade(component, "event", "doTransform", StylePerk.StylePerk_onDoTransform);

		StylePerk.__loadAttrSettings(component);

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static StylePerk_onDoApplySettings(sender, e, ex)
	{

		let styleName = StylePerk.__getDefaultFilename(this);

		// Load component's default CSS
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
			let css = this.get("settings", "style.options.styleNames", []);
			for (let i = 0; i < css.length; i++)
			{
				chain = chain.then(() => {
					return StylePerk._applyCSS(this, css[i]);
				});
			}

			// Apply component's default CSS
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
	 * @param	{Component}		component			Component.
	 * @param	{String}		styleName			Style name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _loadCSS(component, styleName, options)
	{

		let promise = Promise.resolve();
		let styleInfo = component.get("inventory", `style.styles.${styleName}`) || StylePerk.__createStyleInfo(component, styleName);

		switch (component.get("settings", `style.styles.${styleName}.type`)) {
		case "CSS":
			styleInfo["CSS"] = component.get("settings", `style.styles.${styleName}.CSS`);
			styleInfo["state"] = "loaded";
			component.get("inventory", `style.styles`).set(styleName, styleInfo);
			break;
		case "URL":
		default:
			if (styleInfo["state"] === "loading")
			{
				promise = styleInfo["promise"];
			}
			else
			{
				let url = component.get("settings", `style.styles.${styleName}.URL`) || StylePerk.__getCSSURL(component, styleName);
				promise = AjaxUtil.loadCSS(url).then((css) => {
					let styleInfo = component.get("inventory", "style.styles").get(styleName);
					styleInfo["CSS"] = css;
					styleInfo["state"] = "loaded";
					component.get("inventory", "style.styles").set(styleName, styleInfo);
				});
				styleInfo["promise"] = promise;
				styleInfo["state"] = "loading";
				component.get("inventory", `style.styles`).set(styleName, styleInfo);
			}
			break;
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply style.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		styleName			Style name.
	 */
	static _applyCSS(component, styleName)
	{

		let cssInfo = component.get("inventory", "style.styles").get(styleName);
		let ss = new CSSStyleSheet();

		Util.assert(cssInfo,`StylePerk._applyCSS(): CSS not loaded. name=${component.tagName || "Global"}, styleName=${styleName}, id=${component.id}, uniqueId=${component.uniqueId}`, ReferenceError);

		return Promise.resolve().then(() => {
			return ss.replace(`${cssInfo["CSS"]}`);
		}).then(() => {
			if (component.shadowRoot)
			{
				component._root.adoptedStyleSheets = [...component._root.adoptedStyleSheets, ss];
			}
			else
			{
				document.adoptedStyleSheets = [...document.adoptedStyleSheets, ss];
			}
			console.debug(`StylePerk._applyCSS(): Applied CSS. name=${component.tagName}, styleName=${cssInfo["name"]}, id=${component.id}, uniqueId=${component.uniqueId}`);
		});

	}

	// -------------------------------------------------------------------------
	//  Privates
	// -------------------------------------------------------------------------
	//
	/**
	 * Get settings from element's attribute.
	 *
	 * @param	{Component}		component			Component.
	 */
	static __loadAttrSettings(component)
	{

		if (component.hasAttribute("bm-styleref"))
		{
			component.set("settings", "style.options.styleRef", component.getAttribute("bm-styleref") || true);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Returns a new Style info object.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		styleName			Style name.
	 *
	 * @return  {Object}		Style info.
	 */
	static __createStyleInfo(component, styleName)
	{

		return {
			"name": 	styleName,
			"CSS":		"",
			"state":	"",
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the component has the external CSS file.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return  {Boolean}		True if the component has the external CSS file.
	 */
	static __hasExternalCSS(component, styleName)
	{

		let ret = false;

		if (component.get("settings", "style.options.styleRef"))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to CSS file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String	}		styleName			Style name.
	 *
	 * @return  {String}		URL.
	 */
	static __getCSSURL(component, styleName)
	{

		let path;
		let fileName;
		let query;

		let cssRef = component.get("settings", "style.options.styleRef");
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
					component.get("settings", "system.appBaseURL", ""),
					component.get("settings", "system.stylePath", component.get("settings", "system.componentPath", "")),
					component.get("settings", "unit.options.path", ""),
				]);
			fileName = styleName + ".css";
			query = component.get("settings", "unit.options.query");
		}

		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the default style name.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return 	{String}		Style name.
	 */
	static __getDefaultFilename(component)
	{

		return component.get("settings", "style.options.fileName",
			component.get("settings", "unit.options.fileName",
				component.tagName.toLowerCase()));

	}

}
