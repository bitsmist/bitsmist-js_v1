import {jest} from '@jest/globals'

import {XMLHttpRequest} from 'xmlhttprequest';
global.XMLHttpRequest = XMLHttpRequest;

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
