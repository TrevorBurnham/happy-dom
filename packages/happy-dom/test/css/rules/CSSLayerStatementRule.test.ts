import { describe, it, expect, beforeEach } from 'vitest';
import * as PropertySymbol from '../../../src/PropertySymbol.js';
import BrowserWindow from '../../../src/window/BrowserWindow.js';
import Window from '../../../src/window/Window.js';
import CSSParser from '../../../src/css/utilities/CSSParser.js';
import CSSStyleSheet from '../../../src/css/CSSStyleSheet.js';
import CSSRuleTypeEnum from '../../../src/css/CSSRuleTypeEnum.js';
import CSSLayerStatementRule from '../../../src/css/rules/CSSLayerStatementRule.js';

describe('CSSLayerStatementRule', () => {
	let window: BrowserWindow;
	let styleSheet: CSSStyleSheet;
	let cssParser: CSSParser;

	beforeEach(() => {
		window = new Window();
		styleSheet = new window.CSSStyleSheet();
		cssParser = new CSSParser(styleSheet);
	});

	describe('get type()', () => {
		it('Returns layer statement rule type', () => {
			const cssRule = new CSSLayerStatementRule(
				PropertySymbol.illegalConstructor,
				window,
				cssParser
			);
			expect(cssRule.type).toBe(CSSRuleTypeEnum.layerStatementRule);
		});
	});

	describe('get nameList()', () => {
		it('Returns the layer name list', () => {
			const cssRule = new CSSLayerStatementRule(
				PropertySymbol.illegalConstructor,
				window,
				cssParser
			);
			expect(cssRule.nameList).toEqual([]);

			cssRule[PropertySymbol.nameList] = ['theme', 'utilities'];
			expect(cssRule.nameList).toEqual(['theme', 'utilities']);
		});
	});

	describe('get cssText()', () => {
		it('Returns CSS text for single layer', () => {
			const cssRule = new CSSLayerStatementRule(
				PropertySymbol.illegalConstructor,
				window,
				cssParser
			);
			cssRule[PropertySymbol.nameList] = ['theme'];
			expect(cssRule.cssText).toBe('@layer theme;');
		});

		it('Returns CSS text for multiple layers', () => {
			const cssRule = new CSSLayerStatementRule(
				PropertySymbol.illegalConstructor,
				window,
				cssParser
			);
			cssRule[PropertySymbol.nameList] = ['theme', 'utilities', 'components'];
			expect(cssRule.cssText).toBe('@layer theme, utilities, components;');
		});
	});

	describe('CSSStyleSheet.insertRule()', () => {
		it('Can insert @layer statement rule via stylesheet', () => {
			styleSheet.insertRule('@layer theme, utilities;');

			expect(styleSheet.cssRules.length).toBe(1);
			expect(styleSheet.cssRules[0]).toBeInstanceOf(CSSLayerStatementRule);

			const layerRule = <CSSLayerStatementRule>styleSheet.cssRules[0];
			expect(layerRule.nameList).toEqual(['theme', 'utilities']);
		});

		it('Can insert single layer statement via stylesheet', () => {
			styleSheet.insertRule('@layer base;');

			expect(styleSheet.cssRules.length).toBe(1);
			expect(styleSheet.cssRules[0]).toBeInstanceOf(CSSLayerStatementRule);

			const layerRule = <CSSLayerStatementRule>styleSheet.cssRules[0];
			expect(layerRule.nameList).toEqual(['base']);
		});
	});
});
