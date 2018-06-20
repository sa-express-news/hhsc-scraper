import * as test from 'tape';
import parseArguments, { splitArg, numConvert, controller } from './index';

test('splitArg(\'hello=world\') should be split on \'=\' and return { key: \'hello\', val: \'world\' }', t => {
	let result = splitArg('hello=world');
	let expected = {
		key: 'hello',
		val: 'world',
	};
	t.deepEqual(result, expected);
	t.end();
});

test('calling splitArg w/ \'=\' character in input string should return { key: \'malformed\', val: null }', t => {
	let result = splitArg('helloworld');
	let expected = {
		key: 'malformed',
		val: null,
	};
	t.deepEqual(result, expected);
	t.end();
});

test('calling numConvert will convert string to number', t => {
	let result = numConvert('0999,887,100', 'start');
	let expected = 999887100;
	t.equal(result, expected);
	t.end();
});

test('calling numConvert with non integer will return \'err\'', t => {
	let result = numConvert('slayer88', 'finish');
	let expected = 'err';
	t.equal(result, expected);
	t.end();
});

test('calling controller w/ key not in keyMap should set isSuccessful to false', t => {
	let result = controller({ isSuccessful: true, payload: { start: 0 } }, 'badkey=48').isSuccessful;
	let expected = true;
	t.notEqual(result, expected);
	t.end();
});

test('calling controller w/ malformed start number should set isSuccessful to false', t => {
	let result = controller({ isSuccessful: true, payload: { start: 0 } }, 'start=f48').isSuccessful;
	let expected = true;
	t.notEqual(result, expected);
	t.end();
});

test('run the whole parseArguments module', t => {
	let args = ['start=037836,873836', 'finish=1997'];
	let result = parseArguments(args);
	let expected = {
		isSuccessful: true,
		payload: { 
     		start: 37836873836,
     		finish: 1997,
		},
	};
	t.deepEqual(result, expected);
	t.end();
});
