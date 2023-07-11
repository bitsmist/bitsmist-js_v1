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

		// Upgrade Unit
		this.upgrade(BITSMIST.v1.Unit, "skill", "skin.apply", function(...args) { return SkinPerk._applySkin(...args); });
		this.upgrade(BITSMIST.v1.Unit, "skill", "skin.clone", function(...args) { return SkinPerk._cloneSkin(...args); });
		this.upgrade(BITSMIST.v1.Unit, "spell", "skin.summon", function(...args) { return SkinPerk._loadSkin(...args); });

	}

	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		this.upgrade(unit, "inventory", "skin.skins", {});
		this.upgrade(unit, "state", "skin.activeSkinName", "");
		this.upgrade(unit, "event", "doTransform", SkinPerk.SkinPerk_onDoTransform);

		SkinPerk.__loadAttrSettings(unit);

		// Shadow DOM
		switch (unit.get("settings" ,"system.skin.options.shadowDOM", unit.get("settings", "skin.options.shadowDOM")))
		{
		case "open":
			unit._root = unit.attachShadow({mode:"open"});
			break;
		case "closed":
			unit._root = unit.attachShadow({mode:"closed"});
			break;
		default:
			unit._root = unit;
			break;
		}

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static SkinPerk_onDoTransform(sender, e, ex)
	{

		if (e.detail.skinName || SkinPerk.__hasExternalSkin(this))
		{
			let skinName = e.detail.skinName || "default";

			return Promise.resolve().then(() => {
				return SkinPerk._loadSkin(this, skinName);
			}).then(() => {
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
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		skinName			Skin name.
	 * @param	{Object}		options				Load options.
	 *
	 * @return 	{Promise}		Promise.
	 */
	static _loadSkin(unit, skinName, options)
	{

		let promise = Promise.resolve();
		let skinInfo = unit.get("inventory", `skin.skins.${skinName}`) || SkinPerk.__createSkinInfo(unit, skinName);
		let skinSettings = options || unit.get("settings", `skin.skins.${skinName}`, {});

		if (skinInfo["status"] === "loaded")
		{
			console.debug(`SkinPerk._loadSkin(): Skin already loaded. name=${unit.tagName}, skinName=${skinName}`);
			return promise;
		}

		switch (skinSettings["type"]) {
		case "HTML":
			skinInfo["HTML"] = skinSettings["HTML"];
			skinInfo["status"] = "loaded";
			unit.set("inventory", `skin.skins.${skinName}`, skinInfo);
			break;
		case "node":
			let rootNode = unit.use("skill", "basic.scan", skinSettings["rootNode"] || "");
			Util.assert(rootNode, `SkinPerk._loadSkin(): Root node does not exist. name=${unit.tagName}, skinName=${skinName}, rootNode=${skinSettings["rootNode"]}`);
			skinInfo["HTML"] = rootNode.innerHTML;
			skinInfo["status"] = "loaded";
			unit.set("inventory", `skin.skins.${skinName}`, skinInfo);
			break;
		case "URL":
		default:
			let url = skinSettings["URL"] || (skinName === "default" && SkinPerk.__getSkinURL(unit));
			Util.assert(url, `SkinPerk._loadSkin(): Skin URL is not speicified. name=${unit.tagName}, skinName=${skinName}`);
			promise = AjaxUtil.loadHTML(url).then((skin) => {
				skinInfo["HTML"] = skin;
				skinInfo["status"] = "loaded";
				unit.set("inventory", `skin.skins.${skinName}`, skinInfo);
			});
			break;
		}

		return promise;

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply skin.
	 *
	 * @param	{Unit}			unit				Parent unit.
	 * @param	{String}		skinName			Skin name.
	 */
	static _applySkin(unit, skinName)
	{

		let skinInfo = unit.get("inventory", `skin.skins.${skinName}`);

		Util.assert(skinInfo,`SkinPerk._applySkin(): Skin not loaded. name=${unit.tagName}, skinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`, ReferenceError);

		if (skinInfo["node"])
		{
			// Template node
			let clone = SkinPerk.clone(unit, unit.get("inventory", `skin.skins`));
			unit.insertBefore(clone, unit.firstChild);
		}
		else
		{
			// HTML
			unit._root.innerHTML = skinInfo["HTML"];
		}

		// Change active skin
		unit.set("state", "skin.activeSkinName", skinName);

		console.debug(`SkinPerk._applySkin(): Applied skin. name=${unit.tagName}, skinName=${skinInfo["name"]}, id=${unit.id}, uniqueId=${unit.uniqueId}`);

	}

	// -------------------------------------------------------------------------

	/**
	 * Clone the unit.
	 *
	 * @param	{Unit}			unit				Parent unit.
	 * @param	{String}		skinName			Skin name.
	 *
	 * @return  {Object}		Cloned unit.
	 */
	static _clone(unit, skinName)
	{

		skinName = skinName || unit.get("settings", "setting.skinName");
		let skinInfo = unit.get("inventory", `skin.skins.${skinName}`);

		Util.assert(skinInfo,`SkinPerk._clone(): Skin not loaded. name=${unit.tagName}, skinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`, ReferenceError);

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
	 * @param	{Unit}			unit				Unit.
	 */
	static __loadAttrSettings(unit)
	{

		if (unit.hasAttribute("bm-skinref"))
		{
			let skinRef = unit.getAttribute("bm-styleref") || true;
			if (skinRef === "false")
			{
				skinRef = false;
			}

			unit.set("settings", "skin.options.skinRef", skinRef);
		}

	}

	// -------------------------------------------------------------------------

	/**
	 * Returns a new skin info object.
	 *
	 * @param	{Unit}			unit				Parent unit.
	 * @param	{String}		skinName			Skin name.
	 *
	 * @return  {Object}		Skin info.
	 */
	static __createSkinInfo(unit, skinName)
	{

		return {
			"name":		skinName,
			"HTML":		"",
			"status":	"",
		};

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the unit has the external skin file.
	 *
	 * @param	{Unit}			unit				Unit.
	 *
	 * @return  {Boolean}		True if the unit has the external skin file.
	 */
	static __hasExternalSkin(unit)
	{

		let ret = false;

		if (unit.get("settings", "skin.options.skinRef", true))
		{
			ret = true;
		}

		return ret;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return URL to skin file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String	}		skinName			Skin name.
	 *
	 * @return  {String}		URL.
	 */
	static __getSkinURL(unit)
	{

		let path;
		let fileName;
		let query;

		let skinRef = unit.get("settings", "skin.options.skinRef");
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
					unit.get("settings", "system.skin.options.path", unit.get("settings", "system.unit.options.path", "")),
					unit.get("settings", "style.options.path", unit.get("settings", "unit.options.path", "")),
				]);
			fileName = SkinPerk.__getDefaultFilename(unit) + ".html";
			query = unit.get("settings", "unit.options.query");
		}

		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the default skin name.
	 *
	 * @param	{Unit}			unit				Unit.
	 *
	 * @return 	{String}		Skin name.
	 */
	static __getDefaultFilename(unit)
	{

		return unit.get("settings", "skin.options.fileName",
			unit.get("settings", "unit.options.fileName",
				unit.tagName.toLowerCase()));

	}

}
