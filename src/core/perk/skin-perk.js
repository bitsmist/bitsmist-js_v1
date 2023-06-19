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
import Util from "../util/util";

// =============================================================================
//	Skin Perk Class
// =============================================================================

export default class SkinPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"section":		"skin",
			"order":		200,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Upgrade Component
		this.upgrade(BITSMIST.v1.Component, "inventory", "skin.styles", new ChainableStore());
		this.upgrade(BITSMIST.v1.Component, "skill", "skin.summon", function(...args) { return SkinPerk._loadSkin(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "skin.apply", function(...args) { return SkinPerk._applySkin(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "skin.clone", function(...args) { return SkinPerk._cloneSkin(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "style.summon", function(...args) { return SkinPerk._loadCSS(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "style.apply", function(...args) { return SkinPerk._applyCSS(...args); });

		this._cssReady = {};
		this._cssReady["promise"] = new Promise((resolve, reject) => {
			this._cssReady["resolve"] = resolve;
			this._cssReady["reject"] = reject;
		});

		let promises = [];
		BITSMIST.v1.Component.get("inventory", "promise.documentReady").then(() => {
			Object.entries(BITSMIST.v1.Component.get("setting", "skin.styles", {})).forEach(([sectionName, sectionValue]) => {
				promises.push(SkinPerk._loadCSS(BITSMIST.v1.Component, sectionName).then(() => {
					if (sectionValue["global"])
					{
						return SkinPerk._applyCSS(BITSMIST.v1.Component, sectionName);
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
		this.upgrade(component, "inventory", "skin.skins", {});
		this.upgrade(component, "inventory", "skin.styles", new ChainableStore({
			"chain":	BITSMIST.v1.Component.get("inventory", "skin.styles"),
		}));
		this.upgrade(component, "stat", "skin.activeSkinName", "");
		this.upgrade(component, "event", "doApplySettings", SkinPerk.SkinPerk_onDoApplySettings);
		this.upgrade(component, "event", "doTransform", SkinPerk.SkinPerk_onDoTransform);

		SkinPerk.__loadAttrSettings(component);

		// Shadow DOM
		switch (component.get("setting", "skin.options.shadowDOM"))
		{
		case "open":
			component._root = component.attachShadow({mode:"open"});
			break;
		case "closed":
			component._root = component.attachShadow({mode:"closed"});
			break;
		default:
			component._root = component;
			break;
		}

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static SkinPerk_onDoApplySettings(sender, e, ex)
	{

		let promises = [];
		let skinName = SkinPerk.__getDefaultFilename(this);

		// Load component's default CSS
		if (SkinPerk.__hasExternalCSS(this, skinName))
		{
			promises.push(SkinPerk._loadCSS(this, skinName));
		}

		// Load component's default skin
		if (SkinPerk.__hasExternalSkin(this, skinName))
		{
			promises.push(SkinPerk._loadSkin(this, skinName));
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static SkinPerk_onDoTransform(sender, e, ex)
	{

		let skinName = SkinPerk.__getDefaultFilename(this);

		return SkinPerk._cssReady.promise.then(() => {
			let promises = [];
			let chain = Promise.resolve();

			// Apply common CSS
			let css1 = this.get("setting", "skin.options.styleNames", []);
			for (let i = 0; i < css1.length; i++)
			{
				chain = chain.then(() => {
					return SkinPerk._applyCSS(this, css1[i]);
				});
			}

			// Apply component's default CSS
			if (SkinPerk.__hasExternalCSS(this, skinName))
			{
				chain = chain.then(() => {
					return SkinPerk._applyCSS(this, skinName);
				});
			}

			return chain;
		}).then(() => {
			// Apply component's default skin
			if (SkinPerk.__hasExternalSkin(this, skinName))
			{
				return SkinPerk._applySkin(this, skinName);
			}
		});

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Load the skin HTML.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		skinName			Skin name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _loadSkin(component, skinName, options)
	{

		let promise = Promise.resolve();
		let skinInfo = component.get("inventory", `skin.skins.${skinName}`) || SkinPerk.__createSkinInfo(component, skinName);

		switch (component.get("setting", `skin.skins.${skinName}.type`)) {
		case "HTML":
			skinInfo["HTML"] = component.get("setting", `skin.skins.${skinName}.HTML`);
			skinInfo["state"] = "loaded";
			component.set("inventory", `skin.skins.${skinName}`, skinInfo);
			break;
		case "node":
			let rootNode = component.get("setting", `skin.skins.${skinName}.rootNode`);
			skinInfo["HTML"] = component.use("skill", "basic.scan", rootNode).innerHTML;
			skinInfo["state"] = "loaded";
			component.set("inventory", `skin.skins.${skinName}`, skinInfo);
			break;
		case "URL":
		default:
		console.log("@@@url", component.tagName, skinName);
			let url = component.get("setting", `skin.skins.${skinName}.URL`) || SkinPerk.__getSkinURL(component, skinName);
			promise = AjaxUtil.loadHTML(url).then((skin) => {
				skinInfo["HTML"] = skin;
				skinInfo["state"] = "loaded";
				component.set("inventory", `skin.skins.${skinName}`, skinInfo);
			});
			break;
		}

		return promise;

	}

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
		let styleInfo = component.get("inventory", `skin.styles.${styleName}`) || SkinPerk.__createStyleInfo(component, styleName);

		switch (component.get("setting", `skin.styles.${styleName}.type`)) {
		case "CSS":
			styleInfo["CSS"] = component.get("setting", `skin.styles.${styleName}.CSS`);
			styleInfo["state"] = "loaded";
			component.get("inventory", `skin.styles`).set(styleName, styleInfo);
			break;
		case "URL":
		default:
			if (styleInfo["state"] === "loading")
			{
				promise = styleInfo["promise"];
			}
			else
			{
				let url = component.get("setting", `skin.styles.${styleName}.URL`) || SkinPerk.__getCSSURL(component, styleName);
				promise = AjaxUtil.loadCSS(url).then((css) => {
					let styleInfo = component.get("inventory", "skin.styles").get(styleName);
					styleInfo["CSS"] = css;
					styleInfo["state"] = "loaded";
					component.get("inventory", "skin.styles").set(styleName, styleInfo);
				});
				styleInfo["promise"] = promise;
				styleInfo["state"] = "loading";
				component.get("inventory", `skin.styles`).set(styleName, styleInfo);
			}
			break;
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply skin.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		skinName			Skin name.
	 */
	static _applySkin(component, skinName)
	{

		if (component.get("stat", "skin.activeSkinName") === skinName)
		{
			console.debug(`SkinPerk._applySkin(): Skin already applied. name=${component.tagName}, skinName=${skinName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return Promise.resolve();
		}

		let skinInfo = component.get("inventory", `skin.skins.${skinName}`);

		Util.assert(skinInfo,`SkinPerk._applySkin(): Skin not loaded. name=${component.tagName}, skinName=${skinName}, id=${component.id}, uniqueId=${component.uniqueId}`, ReferenceError);

		if (skinInfo["node"])
		{
			// Template node
			let clone = SkinPerk.clone(component, component.get("inventory", `skin.skins`));
			component.insertBefore(clone, component.firstChild);
		}
		else
		{
			// HTML
			component._root.innerHTML = skinInfo["HTML"];
		}

		// Change active skin
		component.set("stat", "skin.activeSkinName", skinName);

		console.debug(`SkinPerk._applySkin(): Applied skin. name=${component.tagName}, skinName=${skinInfo["name"]}, id=${component.id}, uniqueId=${component.uniqueId}`);

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply skin.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		styleName			Style name.
	 */
	static _applyCSS(component, styleName)
	{

		let cssInfo = component.get("inventory", "skin.styles").get(styleName);
		let ss = new CSSStyleSheet();

		Util.assert(cssInfo,`SkinPerk._applyCSS(): CSS not loaded. name=${component.tagName || "Global"}, styleName=${styleName}, id=${component.id}, uniqueId=${component.uniqueId}`, ReferenceError);

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
			console.debug(`SkinPerk._applyCSS(): Applied CSS. name=${component.tagName}, styleName=${cssInfo["name"]}, id=${component.id}, uniqueId=${component.uniqueId}`);
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Clone the component.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		skinName			Skin name.
	 *
	 * @return  {Object}		Cloned component.
	 */
	static _clone(component, skinName)
	{

		skinName = skinName || component.get("setting", "setting.skinName");
		let skinInfo = component.get("inventory", `skin.skins.${skinName}`);

		Util.assert(skinInfo,`SkinPerk._clone(): Skin not loaded. name=${component.tagName}, skinName=${skinName}, id=${component.id}, uniqueId=${component.uniqueId}`, ReferenceError);

		let clone;
		if (skinInfo["node"])
		{
			// A template tag
			clone = document.importNode(skinInfo["node"], true);
		}
		else
		{
			// Not a template tag
			let ele = document.createElement("div");
			ele.innerHTML = skinInfo["HTML"];

			clone = ele.firstElementChild;
		}

		return clone;

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

		if (component.hasAttribute("bm-skinref"))
		{
			component.set("setting", "skin.options.skinRef", component.getAttribute("bm-skinref") || true);
		}

		if (component.hasAttribute("bm-styleref"))
		{
			component.set("setting", "skin.options.styleRef", component.getAttribute("bm-styleref") || true);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Returns a new skin info object.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		skinName			Skin name.
	 *
	 * @return  {Object}		Skin info.
	 */
	static __createSkinInfo(component, skinName)
	{

		return {
			"name":	skinName,
			"HTML": "",
			"state":	"",
		};

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
	 * Check if the component has the external skin file.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return  {Boolean}		True if the component has the external skin file.
	 */
	static __hasExternalSkin(component, skinName)
	{

		let ret = false;

		if (component.get("setting", "skin.options.skinRef", true))
		{
			ret = true;
		}

		return ret;

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

		if (component.get("setting", "skin.options.styleRef"))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to skin file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String	}		skinName			Skin name.
	 *
	 * @return  {String}		URL.
	 */
	static __getSkinURL(component, skinName)
	{

		let path;
		let fileName;
		let query;

		let skinRef = component.get("setting", "skin.options.skinRef");
		if (skinRef && skinRef !== true)
		{
			// If URL is specified in ref, use it
			let url = Util.parseURL(skinRef);
			path = url.path;
			fileName = url.filename;
			query = url.query;
		}
		else
		{
			// Use default path and filename
			path = Util.concatPath([
					component.get("setting", "system.appBaseURL", ""),
					component.get("setting", "system.skinPath", component.get("setting", "system.componentPath", "")),
					component.get("setting", "setting.path", ""),
				]);
			fileName = skinName + ".html";
			query = component.get("setting", "setting.query");
		}

		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to CSS file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String	}		skinName			Skin name.
	 *
	 * @return  {String}		URL.
	 */
	static __getCSSURL(component, styleName)
	{

		let path;
		let fileName;
		let query;

		let cssRef = component.get("setting", "skin.options.styleRef");
		if (cssRef && cssRef !== true)
		{
			// If URL is specified in ref, use it
			let url = Util.parseURL(cssRef);
			path = url.path;
			fileName = url.filename;
			query = url.query;
		}
		else
		{
			// Use default path and filename
			path = Util.concatPath([
					component.get("setting", "system.appBaseURL", ""),
					component.get("setting", "system.skinPath", component.get("setting", "system.componentPath", "")),
					component.get("setting", "setting.path", ""),
				]);
			fileName = styleName + ".css";
			query = component.get("setting", "setting.query");
		}

		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the default skin name.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return 	{String}		Skin name.
	 */
	static __getDefaultFilename(component)
	{

		return component.get("setting", "skin.options.fileName",
			component.get("setting", "setting.fileName",
				component.tagName.toLowerCase()));

	}

}
