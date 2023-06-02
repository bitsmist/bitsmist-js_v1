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
		this.upgrade(BITSMIST.v1.Component, "inventory", "skin.css", new ChainableStore());
		this.upgrade(BITSMIST.v1.Component, "skill", "skin.summon", function(...args) { return SkinPerk._loadSkin(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "skin.apply", function(...args) { return SkinPerk._applySkin(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "skin.clone", function(...args) { return SkinPerk._cloneSkin(...args); });

		BITSMIST.v1.Component.promises.documentReady.then(() => {
			Object.entries(BITSMIST.v1.Component.get("setting", "skin.css", {})).forEach(([sectionName, sectionValue]) => {
				SkinPerk._loadCSS(BITSMIST.v1.Component, sectionName);
			});
		});

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Upgrade component
		this.upgrade(component, "inventory", "skin.skins", {});
		this.upgrade(component, "inventory", "skin.css", new ChainableStore({
			"chain":	BITSMIST.v1.Component.get("inventory", "skin.css"),
		}));
		this.upgrade(component, "stat", "skin.activeSkinName", "");
		this.upgrade(component, "event", "doTransform", SkinPerk.SkinPerk_onDoTransform);
		this.upgrade(component, "event", "doApplySettings", SkinPerk.SkinPerk_onDoApplySettings);

		// Shadow DOM
		switch (component.get("setting", "setting.shadowDOM"))
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

		Object.entries(Util.safeGet(e.detail, "settings.skin.css", {})).forEach(([sectionName, sectionValue]) => {
			promises.push(SkinPerk._loadCSS(this, sectionName).then(() => {
				return SkinPerk._applyCSS(this, sectionName);
			}));
		});

		if (this.get("setting", "skin.options.hasCSS", true))
		{
			promises.push(SkinPerk._loadCSS(this, skinName).then(() => {
				return SkinPerk._applyCSS(this, skinName);
			}));
		}

		if (this.get("setting", "skin.options.hasSkin", true))
		{
			promises.push(SkinPerk._loadSkin(this, skinName));
		}

		return Promise.all(promises);

	}

	// -------------------------------------------------------------------------

	static SkinPerk_onDoTransform(sender, e, ex)
	{

		if (this.get("setting", "skin.options.hasSkin", true))
		{
			return SkinPerk._applySkin(this, SkinPerk.__getDefaultFilename(this));
		}

	}

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Load the skin HTML.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		skinName			Skin name. Use "" to use default name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _loadSkin(component, skinName, options)
	{

		// Skin(File) Name
		skinName = skinName || SkinPerk.__getDefaultFilename(component);

		let promise = Promise.resolve();
		let skinInfo = component.get("inventory", `skin.skins.${skinName}`) || SkinPerk.__createSkinInfo(component, skinName);

		switch (component.get("setting", `skin.skins.${skinName}.type`)) {
		case "html":
			skinInfo["html"] = component.get("setting", `skin.skins.${skinName}.html`);
			break;
		case "node":
			let rootNode = component.get("setting", `skin.skins.${skinName}.rootNode`);
			skinInfo["html"] = Util.scopedSelectorAll(component, rootNode)[0].innerHTML;
			break;
		case "url":
		default:
			if (SkinPerk.__hasExternalSkin(component, skinName))
			{
				promise = AjaxUtil.loadHTML(SkinPerk.__getSkinURL(component, skinName)).then((skin) => {
					skinInfo["html"] = skin;
				});
			}
			break;
		}

		return promise.then(() => {
			skinInfo["isLoaded"] = true;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the CSS.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		skinName			Skin name. Use "" to use default name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _loadCSS(component, cssName, options)
	{

		// File Name
		cssName = cssName || SkinPerk.__getDefaultFilename(component);

		let promise = Promise.resolve();
		let cssInfo = component.get("inventory", "skin.css").get(cssName) || SkinPerk.__createCSSInfo(component, cssName);

		switch (component.get("setting", `skin.skins.${cssName}.type`)) {
		case "css":
			cssInfo["css"] = component.get("setting", `skin.css.${cssName}.css`);
			cssInfo["state"] = "loaded";
			cssInfo["isLoaded"] = true;
			break;
		case "url":
		default:
			if (SkinPerk.__hasExternalCSS(component, cssName))
			{
				if (cssInfo["state"] === "loading")
				{
					promise = cssInfo["promise"];
				}
				else
				{
					promise = AjaxUtil.loadCSS(SkinPerk.__getCSSURL(component, cssName)).then((css) => {
						cssInfo["css"] = css;
						cssInfo["state"] = "loaded";
						cssInfo["isLoaded"] = true;
					});
					cssInfo["promise"] = promise;
				}
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
			let clone = SkinPerk.clone(component, skinInfo["name"]);
			component.insertBefore(clone, component.firstChild);
		}
		else
		{
			// HTML
			component._root.innerHTML = skinInfo["html"];
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
	 * @param	{String}		cssName				CSS name.
	 */
	static _applyCSS(component, cssName)
	{

		let cssInfo = component.get("inventory", "skin.css").get(cssName);
		let ss = new CSSStyleSheet();

		return Promise.resolve().then(() => {
			return ss.replace(`${cssInfo["css"]}`);
		}).then(() => {
			if (component.shadowRoot)
			{
				component._root.adoptedStyleSheets = [...component._root.adoptedStyleSheets, ss];
			}
			else
			{
				document.adoptedStyleSheets = [...document.adoptedStyleSheets, ss];
			}
			console.debug(`SkinPerk._applyCSS(): Applied CSS. name=${component.tagName}, skinName=${cssInfo["name"]}, id=${component.id}, uniqueId=${component.uniqueId}`);
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
			ele.innerHTML = skinInfo["html"];

			clone = ele.firstElementChild;
		}

		return clone;

	}

	// -------------------------------------------------------------------------
	//  Privates
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

		if (!component.get("inventory", `skin.skins.${skinName}`))
		{

			let skinInfo = {};
			skinInfo["name"] = skinName;
			skinInfo["html"] = "";
			skinInfo["isLoaded"] = false;
			component.set("inventory", `skin.skins.${skinName}`, skinInfo);
		}

		return component.get("inventory", `skin.skins.${skinName}`);

	}

	// -------------------------------------------------------------------------

	/**
	 * Returns a new CSS info object.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		cssName				CSS name.
	 *
	 * @return  {Object}		CSS info.
	 */
	static __createCSSInfo(component, cssName)
	{

		if (!component.get("inventory", `skin.css.${cssName}`))
		{
			let cssInfo = {};
			cssInfo["name"] = cssName;
			cssInfo["css"] = "";
			cssInfo["isLoaded"] = false;
			component.get("inventory", "skin.css").set(cssName, cssInfo);
		}

		return component.get("inventory", "skin.css").get(cssName);

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

		if (component.hasAttribute("bm-skinref") || component.get("setting", "skin.options.skinRef"))
		{
			ret = true;
		}
		else if (!component.get("inventory", `skin.skins.${skinName}.isLoaded`))
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
	static __hasExternalCSS(component, cssName)
	{

		let ret = false;

		if ((component.hasAttribute && component.hasAttribute("bm-cssref")) || component.get("setting", "skin.options.cssRef"))
		{
			ret = true;
		}
		else if (!component.get("inventory", "skin.css").get(cssName)["isLoaded"])
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

		let skinRef = (component.hasAttribute("bm-skinref") ?  component.getAttribute("bm-skinref") || true : component.get("setting", "skin.options.skinRef"));
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
					component.get("setting", "system.appBaseUrl", ""),
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
	static __getCSSURL(component, cssName)
	{

		let path;
		let fileName;
		let query;

		let cssRef = (component.hasAttribute && component.hasAttribute("bm-cssref") ?  component.getAttribute("bm-cssref") || true : component.get("setting", `skin.css.${cssName}.cssRef`));
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
					component.get("setting", "system.appBaseUrl", ""),
					component.get("setting", "system.skinPath", component.get("setting", "system.componentPath", "")),
					component.get("setting", "setting.path", ""),
				]);
			fileName = cssName + ".css";
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
