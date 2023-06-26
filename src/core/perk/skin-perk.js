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
			"order":		210,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Upgrade Component
		this.upgrade(BITSMIST.v1.Component, "skill", "skin.apply", function(...args) { return SkinPerk._applySkin(...args); });
		this.upgrade(BITSMIST.v1.Component, "skill", "skin.clone", function(...args) { return SkinPerk._cloneSkin(...args); });
		this.upgrade(BITSMIST.v1.Component, "spell", "skin.summon", function(...args) { return SkinPerk._loadSkin(...args); });

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Upgrade component
		this.upgrade(component, "vault", "skin.promise", Promise.resolve());
		this.upgrade(component, "inventory", "skin.skins", {});
		this.upgrade(component, "stats", "skin.activeSkinName", "");
		this.upgrade(component, "event", "doApplySettings", SkinPerk.SkinPerk_onDoApplySettings);
		this.upgrade(component, "event", "doTransform", SkinPerk.SkinPerk_onDoTransform);

		SkinPerk.__loadAttrSettings(component);

		// Shadow DOM
		switch (component.get("settings", "skin.options.shadowDOM"))
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

		let skinName = SkinPerk.__getDefaultFilename(this);

		// Load component's default skin
		if (SkinPerk.__hasExternalSkin(this, skinName))
		{
			this.set("vault", "skin.promise", SkinPerk._loadSkin(this, skinName));
		}

	}

	// -------------------------------------------------------------------------

	static SkinPerk_onDoTransform(sender, e, ex)
	{

		let skinName = SkinPerk.__getDefaultFilename(this);

		// Apply component's default skin
		if (SkinPerk.__hasExternalSkin(this, skinName))
		{
			return this.get("vault", "skin.promise").then(() => {
				return SkinPerk._applySkin(this, skinName);
			});
		}

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

		switch (component.get("settings", `skin.skins.${skinName}.type`)) {
		case "HTML":
			skinInfo["HTML"] = component.get("settings", `skin.skins.${skinName}.HTML`);
			skinInfo["state"] = "loaded";
			component.set("inventory", `skin.skins.${skinName}`, skinInfo);
			break;
		case "node":
			let rootNode = component.get("settings", `skin.skins.${skinName}.rootNode`);
			skinInfo["HTML"] = component.use("skill", "basic.scan", rootNode).innerHTML;
			skinInfo["state"] = "loaded";
			component.set("inventory", `skin.skins.${skinName}`, skinInfo);
			break;
		case "URL":
		default:
			let url = component.get("settings", `skin.skins.${skinName}.URL`) || SkinPerk.__getSkinURL(component, skinName);
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
	 * Apply skin.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		skinName			Skin name.
	 */
	static _applySkin(component, skinName)
	{

		if (component.get("stats", "skin.activeSkinName") === skinName)
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
		component.set("stats", "skin.activeSkinName", skinName);

		console.debug(`SkinPerk._applySkin(): Applied skin. name=${component.tagName}, skinName=${skinInfo["name"]}, id=${component.id}, uniqueId=${component.uniqueId}`);

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

		skinName = skinName || component.get("settings", "setting.skinName");
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
			component.set("settings", "skin.options.skinRef", component.getAttribute("bm-skinref") || true);
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
			"name":		skinName,
			"HTML":		"",
			"state":	"",
		};

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

		if (component.get("settings", "skin.options.skinRef", true))
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

		let skinRef = component.get("settings", "skin.options.skinRef");
		if (skinRef && skinRef !== true)
		{
			// If URL is specified in ref, use it
			let url = URLUtil.parseURL(skinRef);
			path = url.path;
			fileName = url.filename;
			query = url.query;
		}
		else
		{
			// Use default path and filename
			path = Util.concatPath([
					component.get("settings", "system.appBaseURL", ""),
					component.get("settings", "system.skinPath", component.get("settings", "system.componentPath", "")),
					component.get("settings", "unit.options.path", ""),
				]);
			fileName = skinName + ".html";
			query = component.get("settings", "unit.options.query");
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

		return component.get("settings", "skin.options.fileName",
			component.get("settings", "unit.options.fileName",
				component.tagName.toLowerCase()));

	}

}
