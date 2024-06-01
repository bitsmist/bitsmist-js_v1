import {jest} from '@jest/globals'

/* CSS */
document.adoptedStyleSheets = [];
global.CSSStyleSheet.prototype.replace = function() {
};

/* Console */
import console from 'console';
global.console  = {
	...console,
	debug: jest.fn(),
	/*
	log: jest.fn(),
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
	*/
};
