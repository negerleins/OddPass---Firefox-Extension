"use strict";

class Module {
    #window
    #document
    constructor(window, document) {
        this.#window = window;
        this.#document = document;
    }

    confirmer(fields) {
        if (fields.length !== 2) return null;

        const sortedFields = fields.sort((a, b) => {
            return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
        });

        const [firstField, secondField] = sortedFields;
        const verticalDistance = Math.abs(
            secondField.getBoundingClientRect().top -
            firstField.getBoundingClientRect().top
        );

        const averageHeight =
            (firstField.offsetHeight + secondField.offsetHeight) / 2;

        if (verticalDistance <= averageHeight * 2) {
            if (
                !secondField.value ||
                (firstField.placeholder &&
                    secondField.placeholder &&
                    firstField.placeholder.length === secondField.placeholder.length)
            ) {
                return secondField;
            }
        }

        return null;
    }

    filter(fieldType) {
        let confirmField = null;

        if (inputFields.filter((field) => field.type === fieldType).length > 1) {
            confirmField = this.confirmer(confirmField);
        }

        return confirmField;
    }

    /**
     * Search all fields with the filter of a query
     * 
     * @public
     * @param {string} query 
     * @returns 
     */
    fields(query) {
        return new Promise((resolve, reject) => {
            let filtered;
            let input;

            try {
                input = Array.from(this.#document.querySelectorAll(query));

                filtered = input.filter((field) => {
                    const style = this.#window.getComputedStyle(field);
                    return style.display !== "none" && style.visibility !== "hidden";
                });

                return filtered;
            } catch (err) {
                reject(err);
            } finally {
                resolve(filtered);
            }
        });
    }
}

export default Module;
