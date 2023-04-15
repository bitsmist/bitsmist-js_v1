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
	 * @param	{Object}		loadOptions			Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _loadSkin(component, skinName, loadOptions)
	{

		// Skin Name
		skinName = skinName || SkinPerk.__getSkinName(component);

		let promise;
		let skinInfo = component.inventory.get(`skin.skins.${skinName}`) || SkinPerk.__createSkinInfo(component, skinName);

		switch (component.settings.get(`skins.${skinName}.type`)) {
		case "html":
			skinInfo["html"] = component.settings.get(`skins.${skinName}.html`);
			promise = Promise.resolve();
			break;
		case "node":
			let rootNode = component.settings.get(`skins.${skinName}.rootNode`);
			skinInfo["html"] = component.querySelector(rootNode).innerHTML;
			promise = Promise.resolve();
			break;
		case "url":
		default:
			// Path
			let path = Util.safeGet(loadOptions, "path",
				Util.concatPath([
					component.settings.get("system.appBaseUrl", ""),
					component.settings.get("system.skinPath", component.settings.get("system.componentPath", "")),
					component.settings.get("settings.path", ""),
				])
			);

			promise = SkinPerk.loadFile(skinInfo["name"], path, loadOptions).then((skin) => {
				skinInfo["html"] = skin;
			});
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

		if (component._activeSkinName === skinName)
		{
			console.debug(`SkinPerk._applySkin(): Skin already applied. name=${component.name}, skinName=${skinName}, id=${component.id}, uniqueId=${component.uniqueId}`);
			return Promise.resolve();
		}

		let skinInfo = component.inventory.get(`skin.skins.${skinName}`);

		Util.assert(skinInfo,`SkinPerk._applySkin(): Skin not loaded. name=${component.name}, skinName=${skinName}, id=${component.id}, uniqueId=${component.uniqueId}`, ReferenceError);

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
		component._activeSkinName = skinName;

		console.debug(`SkinPerk._applySkin(): Applied skin. name=${component.name}, skinName=${skinInfo["name"]}, id=${component.id}, uniqueId=${component.uniqueId}`);

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

		skinName = skinName || component.settings.get("settings.skinName");
		let skinInfo = component.inventory.get(`skin.skins.${skinName}`);

		Util.assert(skinInfo,`SkinPerk._clone(): Skin not loaded. name=${component.name}, skinName=${skinName}, id=${component.id}, uniqueId=${component.uniqueId}`, ReferenceError);

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

		if (this.settings.get("skins.settings.hasSkin", true))
		{
			let skinName = SkinPerk.__getSkinName(this);

			return Promise.resolve().then(() => {
				if (SkinPerk.__hasExternalSkin(this, skinName))
				{
					return SkinPerk.__loadExternalSkin(this, skinName)
				}
			}).then(() => {
				return SkinPerk._applySkin(this, skinName);
			});
		}

	}

	// -------------------------------------------------------------------------
	//  Setter/Getter
	// -------------------------------------------------------------------------

	static get name()
	{

		return "SkinPerk";

	}

	// -------------------------------------------------------------------------

	static get info()
	{

		return {
			"sections":		"skins",
			"order":		200,
		};

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static getInfo()
	{

		return {
			"sections":		"skins",
			"order":		200,
		};

	}

	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Add skills to Component
		BITSMIST.v1.Component.skills.set("skin.loadSkin", function(...args) { return SkinPerk._loadSkin(...args); });
		BITSMIST.v1.Component.skills.set("skin.applySkin", function(...args) { return SkinPerk._applySkin(...args); });
		BITSMIST.v1.Component.skills.set("skin.cloneSkin", function(...args) { return SkinPerk._cloneSkin(...args); });

	}

	// -------------------------------------------------------------------------

	static init(component, options)
	{

		/*
		// Add skills to Component
		component.skills.set("skin.loadSkin", function(...args) { return SkinPerk._loadSkin(...args); });
		component.skills.set("skin.applySkin", function(...args) { return SkinPerk._applySkin(...args); });
		component.skills.set("skin.cloneSkin", function(...args) { return SkinPerk._cloneSkin(...args); });
		*/

		// Add inventory items to Component
		component.inventory.set("skin.skins", {});
		component.inventory.set("skin.activeSkinName", "");

		// Add event handlers to component
		this._addPerkHandler(component, "doTransform", SkinPerk.SkinPerk_onDoTransform);

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the skin html.
	 *
	 * @param	{String}		fileName			File name.
	 * @param	{String}		path				Path to the file.
	 * @param	{Object}		loadOptions			Load Options.
	 *
	 * @return  {Promise}		Promise.
	 */
	static loadFile(fileName, path, loadOptions)
	{

		//console.debug(`SkinPerk.loadFile(): Loading the skin file. fileName=${fileName}, path=${path}`);

		let query = Util.safeGet(loadOptions, "query");
		let url = `${Util.concatPath([path, fileName])}.html` + (query ? `?${query}` : "");
		return AjaxUtil.ajaxRequest({url:url, method:"GET"}).then((xhr) => {
			console.debug(`SkinPerk.loadFile(): Loaded the skin. fileName=${fileName}, path=${path}`);

			return xhr.responseText;
		});

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
	 * Get the skin name.
	 *
	 * @param	{Component}		component			Component.
	 *
	 * @return 	{String}		Skin name.
	 */
	static __getSkinName(component)
	{

		let skinName = component.settings.get("skins.settings.fileName",
			component.settings.get("settings.fileName",
				component.tagName.toLowerCase()));

		return skinName;

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

		if (component.hasAttribute("bm-skinref") || component.settings.get("skins.settings.skinRef"))
		{
			ret = true;
		}
		else if (!component.inventory.get(`skin.skins.${skinName}`) || !component.inventory.get(`skin.skins.${skinName}.isLoaded`))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Load the external skin file.
	 *
	 * @param	{Component}		component			Component.
	 * @param	{String}		Name				Setting name.
	 *
	 * @return  {Promise}		Promise.
	 */
	static __loadExternalSkin(component, fileName)
	{

		let loadOptions;
		let skinRef = ( component.hasAttribute("bm-skinref") ?
			component.getAttribute("bm-skinref") || true :
			component.settings.get("skins.settings.skinRef")
		);

		if (skinRef && skinRef !== true)
		{
			let url = Util.parseURL(skinRef);
			fileName = url.filenameWithoutExtension;
			loadOptions = {
				"path":			url.path,
				"query":		url.query,
			};
		}

		return SkinPerk._loadSkin(component, fileName, loadOptions);

	}

}
