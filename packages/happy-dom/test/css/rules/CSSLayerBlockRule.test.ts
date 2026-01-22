import { describe, it, expect, beforeEach } from 'vitest';
import * as PropertySymbol from '../../../src/PropertySymbol.js';
import BrowserWindow from '../../../src/window/BrowserWindow.js';
import Window from '../../../src/window/Window.js';
import CSSParser from '../../../src/css/utilities/CSSParser.js';
import CSSStyleSheet from '../../../src/css/CSSStyleSheet.js';
import CSSRuleTypeEnum from '../../../src/css/CSSRuleTypeEnum.js';
import CSSLayerBlockRule from '../../../src/css/rules/CSSLayerBlockRule.js';

describe('CSSLayerBlockRule', () => {
	let window: BrowserWindow;
	let styleSheet: CSSStyleSheet;
	let cssParser: CSSParser;

	beforeEach(() => {
		window = new Window();
		styleSheet = new window.CSSStyleSheet();
		cssParser = new CSSParser(styleSheet);
	});

	describe('get type()', () => {
		it('Returns layer block rule type', () => {
			const cssRule = new CSSLayerBlockRule(PropertySymbol.illegalConstructor, window, cssParser);
			expect(cssRule.type).toBe(CSSRuleTypeEnum.layerBlockRule);
		});
	});

	describe('get name()', () => {
		it('Returns the layer name', () => {
			const cssRule = new CSSLayerBlockRule(PropertySymbol.illegalConstructor, window, cssParser);
			expect(cssRule.name).toBe('');

			cssRule[PropertySymbol.name] = 'utilities';
			expect(cssRule.name).toBe('utilities');
		});
	});

	describe('get cssText()', () => {
		it('Returns CSS text for anonymous layer', () => {
			const cssRule = new CSSLayerBlockRule(PropertySymbol.illegalConstructor, window, cssParser);
			expect(cssRule.cssText).toBe('@layer {}');
		});

		it('Returns CSS text for named layer', () => {
			const cssRule = new CSSLayerBlockRule(PropertySymbol.illegalConstructor, window, cssParser);
			cssRule[PropertySymbol.name] = 'utilities';
			expect(cssRule.cssText).toBe('@layer utilities {}');
		});

		it('Returns CSS text with nested rules', () => {
			const cssRule = new CSSLayerBlockRule(PropertySymbol.illegalConstructor, window, cssParser);
			cssRule[PropertySymbol.name] = 'utilities';

			cssRule.insertRule('.test { color: red; }');
			cssRule.insertRule('body { color: blue; }');

			expect(cssRule.cssText).toBe(
				'@layer utilities {\n  body { color: blue; }\n  .test { color: red; }\n}'
			);
		});
	});

	describe('insertRule()', () => {
		it('Can insert rules into the layer', () => {
			const cssRule = new CSSLayerBlockRule(PropertySymbol.illegalConstructor, window, cssParser);
			cssRule[PropertySymbol.name] = 'utilities';

			const index = cssRule.insertRule('.test { color: red; }');
			expect(index).toBe(0);
			expect(cssRule.cssRules.length).toBe(1);
		});
	});

	describe('CSSStyleSheet.insertRule()', () => {
		it('Can insert @layer block rule via stylesheet', () => {
			styleSheet.insertRule('@layer utilities { .test { color: red; } }');

			expect(styleSheet.cssRules.length).toBe(1);
			expect(styleSheet.cssRules[0]).toBeInstanceOf(CSSLayerBlockRule);

			const layerRule = <CSSLayerBlockRule>styleSheet.cssRules[0];
			expect(layerRule.name).toBe('utilities');
			expect(layerRule.cssRules.length).toBe(1);
		});

		it('Can insert anonymous @layer block rule via stylesheet', () => {
			styleSheet.insertRule('@layer { .test { color: red; } }');

			expect(styleSheet.cssRules.length).toBe(1);
			expect(styleSheet.cssRules[0]).toBeInstanceOf(CSSLayerBlockRule);

			const layerRule = <CSSLayerBlockRule>styleSheet.cssRules[0];
			expect(layerRule.name).toBe('');
			expect(layerRule.cssRules.length).toBe(1);
		});
	});
});
