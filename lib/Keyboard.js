/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const helper = require('./helper');

class Keyboard {
  /**
   * @param {!Connection} client
   */
  constructor(client) {
    this._client = client;
    /** @type {!Set<string>} */
    this._keys = new Set();
  }

  /**
   * @param {string} key
   * @param {{text: (string|undefined)}} options
   * @return {!Promise}
   */
  async down(key, options) {
    let {text} = options || {};
    this._keys.add(key);
    await this._client.send('Input.dispatchKeyEvent', {
      type: text ? 'keyDown' : 'rawKeyDown',
      modifiers: this._modifiersMask(),
      windowsVirtualKeyCode: codeForKey(key),
      key: key,
      text: text,
      unmodifiedText: text
    });
  }

  /**
   * @param {{Shift: boolean, Alt: boolean, Meta: boolean, Control: boolean}}
   */
  modifiers() {
    return {
      Shift: this._keys.has('Shift'),
      Alt: this._keys.has('Alt'),
      Meta: this._keys.has('Meta'),
      Control: this._keys.has('Control')
    };
  }

  /**
   * @param {string} key
   * @return {!Promise}
   */
  async up(key) {
    this._keys.delete(key);
    await this._client.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      modifiers: this._modifiersMask(),
      key,
      windowsVirtualKeyCode: codeForKey(key),
    });
  }

  /**
   * @param {string} key
   * @param {{text: (string|undefined)}} options
   * @return {!Promise}
   */
  async press(key, options) {
    this.down(key, options);
    await this.up(key);
  }

  /**
   * @param {string} text
   * @return {!Promise}
   */
  async type(text) {
    let last;
    for (let char of text)
      last = this.press(char, {text: char});
    await last;
  }

  /**
   * @param {string} char
   * @return {!Promise}
   */
  async sendCharacter(char) {
    await this._client.send('Input.dispatchKeyEvent', {
      type: 'char',
      modifiers: this._modifiersMask(),
      text: char,
      key: char,
      unmodifiedText: char
    });
  }

  /**
   * @return {number}
   */
  _modifiersMask() {
    let modifiers = 0;
    if (this._keys.has('Alt'))
      modifiers += 1;
    if (this._keys.has('Control'))
      modifiers += 2;
    if (this._keys.has('Meta'))
      modifiers += 4;
    if (this._keys.has('Shift'))
      modifiers += 8;
    return modifiers;
  }
}

let keys = {
  'Cancel': 3,
  'Help': 6,
  'Backspace': 8,
  'Tab': 9,
  'Clear': 12,
  'Enter': 13,
  'Shift': 16,
  'Control': 17,
  'Alt': 18,
  'Pause': 19,
  'CapsLock': 20,
  'Escape': 27,
  'Convert': 28,
  'NonConvert': 29,
  'Accept': 30,
  'ModeChange': 31,
  'PageUp': 33,
  'PageDown': 34,
  'End': 35,
  'Home': 36,
  'ArrowLeft': 37,
  'ArrowUp': 38,
  'ArrowRight': 39,
  'ArrowDown': 40,
  'Select': 41,
  'Print': 42,
  'Execute': 43,
  'PrintScreen': 44,
  'Insert': 45,
  'Delete': 46,
  ')': 48,
  '!': 49,
  '@': 50,
  '#': 51,
  '$': 52,
  '%': 53,
  '^': 54,
  '&': 55,
  '*': 56,
  '(': 57,
  'Meta': 91,
  'ContextMenu': 93,
  'F1': 112,
  'F2': 113,
  'F3': 114,
  'F4': 115,
  'F5': 116,
  'F6': 117,
  'F7': 118,
  'F8': 119,
  'F9': 120,
  'F10': 121,
  'F11': 122,
  'F12': 123,
  'F13': 124,
  'F14': 125,
  'F15': 126,
  'F16': 127,
  'F17': 128,
  'F18': 129,
  'F19': 130,
  'F20': 131,
  'F21': 132,
  'F22': 133,
  'F23': 134,
  'F24': 135,
  'NumLock': 144,
  'ScrollLock': 145,
  'VolumeMute': 181,
  'VolumeDown': 182,
  'VolumeUp': 183,
  ';': 186,
  ':': 186,
  '=': 187,
  '+': 187,
  ',': 188,
  '<': 188,
  '-': 189,
  '_': 189,
  '.': 190,
  '>': 190,
  '/': 191,
  '?': 191,
  '`': 192,
  '~': 192,
  '[': 219,
  '{': 219,
  '\\': 220,
  '|': 220,
  ']': 221,
  '}': 221,
  '\'': 222,
  '"': 222,
  'AltGraph': 225,
  'Attn': 246,
  'CrSel': 247,
  'ExSel': 248,
  'EraseEof': 249,
  'Play': 250,
  'ZoomOut': 251
};

/**
 * @param {string} key
 * @return {number}
 */
function codeForKey(key) {
  if (keys[key])
    return keys[key];
  if (key.length === 1)
    return key.toUpperCase().charCodeAt(0);
  return 0;
}

module.exports = Keyboard;
helper.tracePublicAPI(Keyboard);