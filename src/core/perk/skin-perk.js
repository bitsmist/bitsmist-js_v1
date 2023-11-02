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
	//  Private Variables
	// -------------------------------------------------------------------------

	static #__info = {
		"privateId":	Util.getUUID(),
		"section":		"skin",
		"order":		210,
	};

	// -------------------------------------------------------------------------
	//  Properties
	// -------------------------------------------------------------------------

	static get info()
	{

		return SkinPerk.#__info;

	}

	// -------------------------------------------------------------------------
	//  Methods
	// -------------------------------------------------------------------------

	static globalInit()
	{

		// Upgrade Unit
		BITSMIST.v1.Unit.upgrade("skill", "skin.apply", function(...args) { return SkinPerk.#_applySkin(...args); });
		BITSMIST.v1.Unit.upgrade("spell", "skin.summon", function(...args) { return SkinPerk.#_loadSkin(...args); });

	}

	// -------------------------------------------------------------------------

	static init(unit, options)
	{

		// Upgrade unit
		unit.upgrade("inventory", "skin.skins", {});
		unit.upgrade("inventory", "skin.active.skinName", "");
		unit.upgrade("event", "beforeTransform", SkinPerk.#SkinPerk_onBeforeTransform, {"order":SkinPerk.info["order"]});
		unit.upgrade("event", "doTransform", SkinPerk.#SkinPerk_onDoTransform, {"order":SkinPerk.info["order"]});

		SkinPerk.#__loadAttrSettings(unit);
		SkinPerk.#__adjustSettings(unit);

		// Shadow DOM
		let shadowRoot;
		switch (unit.get("setting", "skin.options.shadowDOM", unit.get("setting" ,"system.skin.options.shadowDOM")))
		{
		case "open":
			shadowRoot = unit.attachShadow({mode:"open"});
			unit.set("inventory", "skin.shadowRoot", shadowRoot);
			unit.set("inventory", "basic.unitRoot", shadowRoot);
			break;
		case "closed":
			shadowRoot = unit.attachShadow({mode:"open"});
			unit.set("inventory", "skin.shadowRoot", shadowRoot);
			unit.set("inventory", "basic.unitRoot", shadowRoot);
			break;
		}

	}

	// -------------------------------------------------------------------------
	//  Event Handlers
	// -------------------------------------------------------------------------

	static #SkinPerk_onBeforeTransform(sender, e, ex)
	{

		if (this.get("setting", "skin.options.hasSkin", true))
		{
			return SkinPerk.#_loadSkin(this, e.detail.skinName, e.detail.skinOptions).then((skinInfo) => {
				this.get("inventory", "basic.unitRoot").textContent = "";
				this.set("inventory", "basic.unitRoot", skinInfo["template"].content.cloneNode(true));
			});
		}

	}

	// -------------------------------------------------------------------------

	static #SkinPerk_onDoTransform(sender, e, ex)
	{

		if (this.get("setting", "skin.options.hasSkin", true))
		{
			return SkinPerk.#_applySkin(this, e.detail.skinName, this.get("inventory", "basic.unitRoot"));
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
	static #_loadSkin(unit, skinName, options)
	{

		let promise = Promise.resolve();
		let skinInfo = unit.get("inventory", `skin.skins.${skinName}`) || SkinPerk.#__createSkinInfo(unit, skinName);
		let skinSettings = options || unit.get("setting", `skin.skins.${skinName}`, {});

		if (skinInfo["status"] === "loaded")
		{
			console.debug(`SkinPerk.#_loadSkin(): Skin already loaded. name=${unit.tagName}, skinName=${skinName}`);
			return Promise.resolve(skinInfo);
		}

		switch (skinSettings["type"]) {
		case "HTML":
			skinInfo["HTML"] = skinSettings["HTML"];
			break;
		case "node":
			let rootNode = unit.use("skill", "basic.scan", skinSettings["rootNode"] || "");
			Util.assert(rootNode, `SkinPerk.#_loadSkin(): Root node does not exist. name=${unit.tagName}, skinName=${skinName}, rootNode=${skinSettings["rootNode"]}`);
			skinInfo["HTML"] = rootNode.innerHTML;
			break;
		case "URL":
		default:
			let url = skinSettings["URL"] || SkinPerk.#__getDefaultURL(unit, skinName, skinSettings);
			Util.assert(url, `SkinPerk.#_loadSkin(): Skin URL is not speicified. name=${unit.tagName}, skinName=${skinName}`);
			promise = AjaxUtil.loadHTML(url).then((skin) => {
				skinInfo["HTML"] = skin;
			});
			skinInfo["promise"] = promise;
			skinInfo["status"] = "loading";
			break;
		case "inline":
		//default:
			promise = new Promise((resolve, reject) => {
				// Need to set timeout to wait for innerHTML to be ready
				setTimeout(() => {
					skinInfo["HTML"] = (unit.firstElementChild && unit.firstElementChild.tagName === "TEMPLATE" ? unit.firstElementChild.innerHTML : unit.innerHTML);
					unit.innerHTML = "";
					resolve();
				}, 1);
			});
			skinInfo["promise"] = promise;
			skinInfo["status"] = "loading";
			break;
		}

		return promise.then(() => {
			skinInfo["template"] = document.createElement("template");
			skinInfo["template"].innerHTML = skinInfo["HTML"];
			skinInfo["status"] = "loaded";

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
	static #_applySkin(unit, skinName, clone)
	{

		let skinInfo = unit.get("inventory", `skin.skins.${skinName}`);

		Util.assert(skinInfo,`SkinPerk.#_applySkin(): Skin not loaded. name=${unit.tagName}, skinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`, ReferenceError);

		// Append the clone to the unit
		clone = clone || this.get("inventory", "basic.unitRoot");
		unit.set("inventory", "basic.unitRoot", unit.get("inventory", "skin.shadowRoot", unit));
		unit.get("inventory", "basic.unitRoot").innerHTML = "";
		unit.get("inventory", "basic.unitRoot").appendChild(clone);

		// Change active skin
		unit.set("inventory", "skin.active.skinName", skinName);

		console.debug(`SkinPerk.#_applySkin(): Applied skin. name=${unit.tagName}, skinName=${skinName}, id=${unit.id}, uniqueId=${unit.uniqueId}`);

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
	static #__loadAttrSettings(unit)
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
	 * Adjust unit settings.
	 *
	 * @param	{Unit}			unit				Unit.
	 */
	static #__adjustSettings(unit)
	{

		let url = unit.get("setting", "skin.options.skinRef");
		if (url === false)
		{
			unit.set("setting", `skin.options.hasSkin`, false);
		}
		else
		{
			let skinSettings = unit.get("setting", "skin.skins.default", {});
			skinSettings["type"] = skinSettings["type"] || "URL";
			skinSettings["URL"] = skinSettings["URL"] || ( typeof(url) === "string" ? url : "" );
			unit.set("setting", `skin.skins.default`, skinSettings);
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
	static #__createSkinInfo(unit, skinName)
	{

		let info = {
			"name":		skinName,
			"HTML":		"",
			"template": null,
			"status":	"",
		};

		unit.set("inventory", `skin.skins.${skinName}`, info);

		return info;

	}

	// -------------------------------------------------------------------------

	/**
	 * Return default URL to the skin file.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		skinName			Skin name.
	 * @param	{Object}		options				Options.
	 *
	 * @return  {String}		URL.
	 */
	static #__getDefaultURL(unit, skinName, options)
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
					unit.get("setting", "system.skin.options.path",
						unit.get("setting", "system.unit.options.path", "")),
					Util.safeGet(options, "path",
						unit.get("setting", "skin.options.path",
							unit.get("setting", "unit.options.path", ""))),
				]);
			fileName = SkinPerk.#__getDefaultFilename(unit, skinName, options) + ".html";
			query = unit.get("setting", "unit.options.query");
		}

		return Util.concatPath([path, fileName]) + (query ? `?${query}` : "");

	}

	// -------------------------------------------------------------------------

	/**
	 * Get the default skin name.
	 *
	 * @param	{Unit}			unit				Unit.
	 * @param	{String}		skinName			Skin name.
	 * @param	{Object}		options				Options.
	 *
	 * @return 	{String}		Skin name.
	 */
	static #__getDefaultFilename(unit, skinName, options)
	{

		return	Util.safeGet(options, "fileName",
					unit.get("setting", "skin.options.fileName",
						unit.get("setting", "unit.options.fileName",
							unit.tagName.toLowerCase())));

	}

}
