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
import Perk from "./perk";
import Util from "../util/util";

// =============================================================================
//	Skin Perk Class
// =============================================================================

export default class SkinPerk extends Perk
{

	// -------------------------------------------------------------------------
	//  Skills
	// -------------------------------------------------------------------------

	/**
	 * Get the skin html according to settings.
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

		let promise;
		let skinInfo = component.inventory.get(`skin.skins.${skinName}`) || SkinPerk.__createSkinInfo(component, skinName);

		switch (component.settings.get(`skin.skins.${skinName}.type`)) {
		case "html":
			skinInfo["html"] = component.settings.get(`skin.skins.${skinName}.html`);
			promise = Promise.resolve();
			break;
		case "node":
			let rootNode = component.settings.get(`skin.skins.${skinName}.rootNode`);
			skinInfo["html"] = component.querySelector(rootNode).innerHTML;
			promise = Promise.resolve();
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
	 * Apply skin.
	 *
	 * @param	{Component}		component			Parent component.
	 * @param	{String}		skinName			Skin name.
	 */
	static _applySkin(component, skinName)
	{

		if (component.stats.get("skin.activeSkinName") === skinName)
		{
			console.debug(`SkinPerk._applySkin(): Skin already applied. name=${component.tagName}, skinName=${skinName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return Promise.resolve();
		}

		let skinInfo = component.inventory.get(`skin.skins.${skinName}`);

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
			component.innerHTML = skinInfo["html"];
		}

		// Change active skin
		component.stats.set("skin.activeSkinName", skinName);

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

		skinName = skinName || component.settings.get("setting.skinName");
		let skinInfo = component.inventory.get(`skin.skins.${skinName}`);

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
	//  Event Handlers
	// -------------------------------------------------------------------------

	static SkinPerk_onDoTransform(sender, e, ex)
	{

		if (this.settings.get("skin.options.hasSkin", true))
		{
			let skinName = SkinPerk.__getDefaultFilename(this);

			return Promise.resolve().then(() => {
				return SkinPerk._loadSkin(this, skinName)
			}).then(() => {
				return SkinPerk._applySkin(this, skinName);
			});
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
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

		// Add skills to Component
		BITSMIST.v1.Component.skills.set("skin.summon", function(...args) { return SkinPerk._loadSkin(...args); });
		BITSMIST.v1.Component.skills.set("skin.apply", function(...args) { return SkinPerk._applySkin(...args); });
		BITSMIST.v1.Component.skills.set("skin.clone", function(...args) { return SkinPerk._cloneSkin(...args); });

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		// Add inventory items to Component
		component.inventory.set("skin.skins", {});

		// Add stats to Component
		component.stats.set("skin.activeSkinName", "");

		// Add event handlers to component
		this._addPerkHandler(component, "doTransform", SkinPerk.SkinPerk_onDoTransform);

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

		if (!component.inventory.get(`skin.skins.${skinName}`))
		{

			let skinInfo = {};
			skinInfo["name"] = skinName;
			skinInfo["html"] = "";
			skinInfo["isLoaded"] = false;
			component.inventory.set(`skin.skins.${skinName}`, skinInfo);
		}

		return component.inventory.get(`skin.skins.${skinName}`);

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the component has the external skin file.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return  {Boolean}		True if the component has the external messages file.
	 */
	static __hasExternalSkin(component, skinName)
	{

		let ret = false;

		if (component.hasAttribute("bm-skinref") || component.settings.get("skin.options.skinRef"))
		{
			ret = true;
		}
		else if (!component.inventory.get(`skin.skins.${skinName}.isLoaded`))
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
	 * @param	{Object}		options				Load options.
	 *
	 * @return  {String}		URL.
	 */
	static __getSkinURL(component, skinName)
	{

		let path;
		let fileName;
		let query;

		let skinRef = (component.hasAttribute("bm-skinref") ?  component.getAttribute("bm-skinref") || true : component.settings.get("skin.options.skinRef"));
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
					component.settings.get("system.appBaseUrl", ""),
					component.settings.get("system.skinPath", component.settings.get("system.componentPath", "")),
					component.settings.get("setting.path", ""),
				]);

			fileName = skinName + ".html";
		}

		return Util.concatPath([path, fileName]) + ( query ? `?${query}` : "" );

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

		return component.settings.get("skin.options.fileName",
			component.settings.get("setting.fileName",
				component.tagName.toLowerCase()));

	}

}
