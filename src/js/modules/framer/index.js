"use strict";

/*
class FieldBox {
    #field;
    #box;

    constructor(field) {
        this.#field = field;
        this.#box = null;
        this.#addEventListeners();
    }

    #getPosition(element) {
        const rect = element.getBoundingClientRect(), doc = document.documentElement;

        return {
            top: window.scrollY + rect.top,
            left: window.scrollX + rect.left
        }
    }

    #addEventListeners() {
        const resizeObserver = new ResizeObserver(() => {
            this.#scheduleUpdate();
        });
        resizeObserver.observe(this.#field);

        window.addEventListener('scroll', () => this.#scheduleUpdate());
        window.addEventListener('resize', () => this.#scheduleUpdate());

        const mutationObserver = new MutationObserver(() => {
            this.#scheduleUpdate();
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });
    }

    #scheduleUpdate() {
        if (!this.updateScheduled) {
            this.updateScheduled = true;
            requestAnimationFrame(() => {
                this.#updatePosition();
                this.updateScheduled = false;
            });
        }
    }


    #updatePosition() {
        if (!this.#box) return;

        const field = this.#field;
        const rect = field.getBoundingClientRect();
        const position = this.#getPosition(field);

        const boxSize = Math.min(rect.height, rect.width);

        this.#box.style.left = `${position.left + (rect.width - boxSize)}px`;
        this.#box.style.top = `${position.top}px`;
        this.#box.style.width = `${boxSize}px`;
        this.#box.style.height = `${boxSize}px`;
    }

    new() {
        const field = this.#field;

        const rect = field.getBoundingClientRect();
        const position = this.#getPosition(field);

        const boxSize = Math.min(rect.height, rect.width);
        const box = document.createElement('div');
        box.hidden = true;

        box.style.cssText = `
            position: fixed;
            left: ${position.left + (rect.width - boxSize)}px;
            top: ${position.top}px;
            width: ${boxSize}px;
            height: ${boxSize}px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 10px;
        `;

        const imageButton = document.createElement('img');
        imageButton.src = chrome.runtime.getURL('icons/48x48_logo__b_off.png');
        imageButton.alt = 'Button';
        imageButton.style.cssText = `
            cursor: pointer;
            width: 100%; // Make the image fill the width of the box
            height: 100%; // Make the image fill the height of the box
            object-fit: contain; // Maintain aspect ratio while filling the box
            max-width: 100%; // Ensure the image doesn't exceed the box width
            max-height: 100%; // Ensure the image doesn't exceed the box height
        `;

        imageButton.addEventListener('mouseover', () => {
            imageButton.src = chrome.runtime.getURL('icons/48x48_logo__b_on.png');
        });

        imageButton.addEventListener('mouseout', () => {
            imageButton.src = chrome.runtime.getURL('icons/48x48_logo__b_off.png');
        });

        imageButton.addEventListener('click', () => {

        });

        // Append elements to the box
        box.appendChild(imageButton);

        box.setAttribute('data-login-detector-overlay', 'true');
        document.body.appendChild(box);

        this.#box = box;
    }

    show() {
        if (this.#box) {
            this.#box.hidden = false;
        }
    }

    hide() {
        if (this.#box) {
            this.#box.hidden = true;
        }
    }
}
*/

class table {
    /**
     * 
     * @param {Array} array 
     * @param {*} value 
     * @returns 
     */
    static remove(array, value) {
        const index = array.indexOf(value);
        if (index === -1) return;

        const lastIndex = array.length - 1;

        if (index !== lastIndex) {
            array[index] = array[lastIndex];
        }

        array.pop();
    }

    /**
     * 
     * @param {Array} array 
     * @param {number} pos 
     * @param {*} value 
     */
    static insert(array, pos, value) {
        if (typeof pos == "number") {
            const exists = array[pos];

            if (!exists) {
                if (!value) return console.log(`Missing @param {*} value`);

                return array[pos] = value;
            } else console.log(`<pos:${pos}> already exists in array`);
        } else {
            return array.push(pos);
        }

        console.log("static table.insert has been used incorrectly.");
    }

    /**
     * 
     * @param {Array} array 
     * @param {*} index 
     * @param {*} value 
     */
    static set(array, index, value) {
        if (value) {
            return array[index] = value;
        } else (index) => {
            return array.push(index);
        };

        console.log("static table.set has been used incorrectly.");
    }
}

/**
 * @typedef {Object} CacheItem
 * @property {string} id
 * @property {Object[]} data
 */

/**
 * @typedef {Object.<string, number>} StringNumberMap
 */

class cache {
    #data;
    #identities;

    constructor() {
        this.#data = []
        this.#identities = []
    }

    /**.
     * @returns {CacheItem[]}
     */
    list() {
        return this.#data;
    }

    /**
     * 
     * @param {string} id 
     * @returns {StringNumberMap}
     */
    get(id) {
        return this.#identities[id];
    }

    /**
     * 
     * @param {*} data 
     * @param {string} id 
     */
    add(data, id) {
        if (this.#identities[id]) {
            this.#identities[id] += 1;
        } else {
            this.#identities[id] = 1;
        }

        this.#data.push({
            id: id,
            data: data
        });
    }
}

/**
 * @typedef {Object} SignalItem
 * @property {function} listener
 * @property {string} rule
 */

/**
 * @typedef {Object} SignalConnection
 * @property {function} disconnect
 */

class Signal {
    #_listeners;
    #_cache;

    constructor() {
        this.#_listeners = [];
        this.#_cache = new cache;
    }
    
    /**
     * 
     * @param {function} listener
     * @param {string} rule 
     * @returns {{disconnect: Function}}
     */
    listen(listener, rule = "global") {

        table.insert(this.#_listeners, {
            callback: listener,
            rule: rule
        });

        if (this.#_cache.get(rule)) {
            this.#_cache.list().forEach((value) => {
                if (value.id == rule) listener(...(value.data));
            });
        }

        return {
            disconnect: () => {
                table.remove(this.#_listeners, listener);
            }
        };
    }

    /**
     * 
     * @param {array} args 
     * @param {string} rule 
     */
    send(args, rule = "global") {
        this.#_listeners.forEach((value) => {
            if (rule) {
                if (rule == value.rule) {
                    value.callback(...args);
                }
            }
        });

        if (this.#_listeners.length == 0) this.#_cache.add(args, rule);
    }
}

const signal = new Signal();
signal.send(["cache", 100000], "global");

signal.listen((msg, count) => {
    console.log(`global: ${msg} and count ${count}`);
});

signal.send(["5", 5]);

class Module {
    constructor() {

    }


}

export default Module;