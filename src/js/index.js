class Backbone {
    async #Import(path) {
        const module = await import(
            chrome.runtime.getURL(path)
        );

        return module.default;
    }

    async Require(path) {
        const __import = this.#Import(path); 

        return new Promise ( (resolve, reject) => {
            __import.then( (res) => {
                return res;
            }).finally( (res) => resolve(res) ).catch( (err) => reject(err) )
        } )
    }
}

// Backbone
var backbone = new Backbone();

const finder = backbone.Require('src/js/modules/finder/index.js');

console.log(finder, 1)

const session = new finder(window, document);
session.fields(`
        input[type="password"],
        input[type="email"],
        input[name*="email"],
        input[name*="user"],
        input[name*="login"],
        input[id*="email"],
        input[id*="user"],
        input[id*="login"]
    `).catch((err) => console.log(err)).then((array) => {
    console.log(array);
});

finder.then((module) => {
    console.log(module, 2)
});

async function Search() {
    const module = await import(chrome.runtime.getURL('src/js/modules/finder/index.js'));
    const ModuleClass = module.default;
    const session = new ModuleClass(window, document);

    session.fields(`
            input[type="password"],
            input[type="email"],
            input[name*="email"],
            input[name*="user"],
            input[name*="login"],
            input[id*="email"],
            input[id*="user"],
            input[id*="login"]
    `).catch((err) => console.log(err)).then((array) => {
        console.log(array);
    });
}

let timeout;
let observer;

console.log("Start-up went through.");

function Observer() {
    //Search();

    observer = new MutationObserver((mutations) => {
        if (mutations.some(m => {
            return Array.from(m.addedNodes).some(node =>
                node.nodeType === 1 &&
                node.querySelector('input')
            ); B
        })) {
            console.log("Update.");

            clearTimeout(timeout);
            timeout = setTimeout(() => {
                Search();
            }, 300);
        }
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Observer());
} else {
    Observer()
}

let lastUrl = window.location.href;
new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        Observer()
    }
}).observe(document, { subtree: true, childList: true })

/*
// content.js

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

class LoginFieldDetector {
    constructor() {
        this.observer = null;
        this.#initializeDetector();
    }

    #clearExistingOverlays() {
        const existingOverlays = document.querySelectorAll('div[data-login-detector-overlay]');
        existingOverlays.forEach(overlay => overlay.remove());
    }

    #initializeDetector() {
        console.log('Content script loaded');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.#setupDetection());
        } else {
            this.#setupDetection();
        }

        let lastUrl = window.location.href;
        new MutationObserver(() => {
            const currentUrl = window.location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                this.#setupDetection();
            }
        }).observe(document, { subtree: true, childList: true });
    }

    #setupDetection() {
        this.#findAndPrintFields();
        this.#setupMutationObserver();
    }

    #findConfirmPasswordField(passwordFields) {
        if (passwordFields.length !== 2) return null; 

        const sortedFields = passwordFields.sort((a, b) => {
            return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
        });

        const [firstField, secondField] = sortedFields;
        const verticalDistance = Math.abs(secondField.getBoundingClientRect().top - firstField.getBoundingClientRect().top);
        const averageHeight = (firstField.offsetHeight + secondField.offsetHeight) / 2;

        if (verticalDistance <= averageHeight * 2) {
            if (!secondField.value || (firstField.placeholder && secondField.placeholder && firstField.placeholder.length === secondField.placeholder.length)) {
                return secondField;
            }
        }

        return null;
    }

    #findAndPrintFields() {
        this.#clearExistingOverlays();
    
        console.log('Searching for fields...');
        const inputFields = Array.from(document.querySelectorAll(`
            input[type="password"],
            input[type="email"],
            input[name*="email"],
            input[name*="user"],
            input[name*="login"],
            input[id*="email"],
            input[id*="user"],
            input[id*="login"]
        `));
        
        const passwordFields = inputFields.filter(field => field.type === 'password');
        let confirmPasswordField = null;
        
        if (passwordFields.length > 1) {
            confirmPasswordField = this.#findConfirmPasswordField(passwordFields);
            if (confirmPasswordField) {
                console.log('Potential confirm password field found:', confirmPasswordField);
            }
        }
        
        const filteredInputFields = inputFields.filter(field => {
            const style = window.getComputedStyle(field);
            return style.display !== 'none' && 
                   style.visibility !== 'hidden' && 
                   field !== confirmPasswordField;
        });
        
        console.log(`Found ${filteredInputFields.length} input fields (excluding confirm password)`);
        this.#logPageInfo();
    
        if (filteredInputFields.length === 0) {
            console.log('No login-related fields found.');
            return;
        }
    
        this.#logFieldDetails(filteredInputFields);
       
        if (confirmPasswordField) {
            console.log('Handling confirm password field separately');
        }
    }

    #logPageInfo() {
        console.log(`URL: ${window.location.href}`);
        console.log(`Domain: ${window.location.hostname}`);
    }

    #logFieldDetails(fields) {
        fields.forEach(field => {
            const newField = new FieldBox(field);
            newField.new();
        });
    }

    #setupMutationObserver() {
        let timeout;
        this.observer = new MutationObserver((mutations) => {
            if (mutations.some(m => {
                return Array.from(m.addedNodes).some(node =>
                    node.nodeType === 1 &&
                    node.querySelector('input')
                );
            })) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.#findAndPrintFields();
                }, 300);
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

new LoginFieldDetector();
*/