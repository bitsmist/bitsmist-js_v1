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
		this.upgrade(BITSMIST.v1.Unit, "spell", "skin.summon", function(...args) { return SkinPerk._loadSkin(...args); });

	}

	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		this.upgrade(unit, "inventory", "skin.skins", {});
		this.upgrade(unit, "state", "skin.active.skinName", "");
		this.upgrade(unit, "event", "beforeTransform", SkinPerk.SkinPerk_onBeforeTransform);
		this.upgrade(unit, "event", "doTransform", SkinPerk.SkinPerk_onDoTransform);

		SkinPerk.__loadAttrSettings(unit);

		// Shadow DOM
		switch (unit.get("setting", "skin.options.shadowDOM", unit.get("setting" ,"system.skin.options.shadowDOM")))
		{
		case "open":
			unit.set("state", "skin.shadowRoot", unit.attachShadow({mode:"open"}));
			break;
		case "closed":
			unit.set("state", "skin.shadowRoot", unit.attachShadow({mode:"closed"}));
			break;
		}

		unit.unitRoot = unit.get("state", "skin.shadowRoot", unit);

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static SkinPerk_onBeforeTransform(sender, e, ex)
	{

		if (e.detail.skinName || SkinPerk.__hasDefaultSkin(this))
		{
			let skinName = e.detail.skinName || "default";

			return SkinPerk._loadSkin(this, skinName).then((skinInfo) => {
				this.unitRoot.textContent = "";
				this.unitRoot = skinInfo["template"].content.cloneNode(true);
			});
		}

	}

	// -------------------------------------------------------------------------

	static SkinPerk_onDoTransform(sender, e, ex)
	{

		if (e.detail.skinName || SkinPerk.__hasDefaultSkin(this))
		{
			let skinName = e.detail.skinName || "default";

			return SkinPerk._applySkin(this, skinName, this.unitRoot);
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
		let skinSettings = options || unit.get("setting", `skin.skins.${skinName}`, {});

		if (skinInfo["status"] === "loaded")
		{
			console.debug(`SkinPerk._loadSkin(): Skin already loaded. name=${unit.tagName}, skinName=${skinName}`);
			return promise.then(() => {
				return skinInfo;
			});
		}

		switch (skinSettings["type"]) {
		case "HTML":
			skinInfo["HTML"] = skinSettings["HTML"];
			skinInfo["template"] = document.createElement("template");
			skinInfo["template"].innerHTML = skinInfo["HTML"];
			skinInfo["status"] = "loaded";
			unit.set("inventory", `skin.skins.${skinName}`, skinInfo);
			break;
		case "node":
			let rootNode = unit.use("skill", "basic.scan", skinSettings["rootNode"] || "");
			Util.assert(rootNode, `SkinPerk._loadSkin(): Root node does not exist. name=${unit.tagName}, skinName=${skinName}, rootNode=${skinSettings["rootNode"]}`);
			skinInfo["HTML"] = rootNode.innerHTML;
			skinInfo["template"] = document.createElement("template");
			skinInfo["template"].innerHTML = skinInfo["HTML"];
			skinInfo["status"] = "loaded";
			unit.set("inventory", `skin.skins.${skinName}`, skinInfo);
			break;
		case "URL":
		default:
			let url = skinSettings["URL"] || (skinName === "default" && SkinPerk.__getSkinURL(unit));
			Util.assert(url, `SkinPerk._loadSkin(): Skin URL is not speicified. name=${unit.tagName}, skinName=${skinName}`);
			promise = AjaxUtil.loadHTML(url).then((skin) => {
				skinInfo["HTML"] = skin;
				skinInfo["template"] = document.createElement("template");
				skinInfo["template"].innerHTML = skinInfo["HTML"];
				skinInfo["status"] = "loaded";
				unit.set("inventory", `skin.skins.${skinName}`, skinInfo);
			});
			break;
		}

		return promise.then(() => {
			return skinInfo;
		});

	}

	// -------------------------------------------------------------------------

	/**
	 * Apply skin.
	 *
	 * @param	{Unit}			unit				Parent unit.
	 * @param	{String}		skinName			Skin name.
	 * @param	{Node}			clone				Template node.
	 */
	static _applySkin(unit, skinName, clone)
	{

		let skinInfo = unit.get("inventory", `skin.skins.${skinName}`);

		Util.assert(skinInfo,`SkinPerk._applySkin(): Skin not loaded. name=${unit.tagName}, skinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`, ReferenceError);

		// Append the clone to the unit
		clone = clone || skinInfo["template"].content.cloneNode(true);
		unit.unitRoot = unit.get("state", "skin.shadowRoot", unit);
		unit.unitRoot.innerHTML = "";
		unit.unitRoot.appendChild(clone);

		// Change active skin
		unit.set("state", "skin.active.skinName", skinName);

		console.debug(`SkinPerk._applySkin(): Applied skin. name=${unit.tagName}, skinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);

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
			let skinRef = unit.getAttribute("bm-skinref") || true;
			if (skinRef === "false")
			{
				skinRef = false;
			}

			unit.set("setting", "skin.options.skinRef", skinRef);
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
			"template": null,
			"status":	"",
		};

	}

	// -------------------------------------------------------------------------

	/**
	 * Check if the unit has the default skin file.
	 *
	 * @param	{Unit}			unit				Unit.
	 *
	 * @return  {Boolean}		True if the unit has the external skin file.
	 */
	static __hasDefaultSkin(unit)
	{

		let ret = false;

		if (unit.get("setting", "skin.options.skinRef", true))
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

		let skinRef = unit.get("setting", "skin.options.skinRef");
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
					unit.get("setting", "system.skin.options.path", unit.get("setting", "system.unit.options.path", "")),
					unit.get("setting", "skin.options.path", unit.get("setting", "unit.options.path", "")),
				]);
			fileName = SkinPerk.__getDefaultFilename(unit) + ".html";
			query = unit.get("setting", "unit.options.query");
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

		return unit.get("setting", "skin.options.fileName",
			unit.get("setting", "unit.options.fileName",
				unit.tagName.toLowerCase()));

	}

}
