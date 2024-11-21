import { writable, get } from 'svelte/store';
import { indexToChar } from '../utils/indexToChar';

function createSpreadsheetStore() {
    const { subscribe, set, update } = writable({
        formulas: {},
        references: {},
        version: 0
    });

    return {
        subscribe,
        updateCell(row, col, value) {
            update(store => {
                const cellId = `${indexToChar(col)}${row + 1}`;
                const oldFormula = store.formulas[cellId];

                if (oldFormula && String(oldFormula).startsWith('=')) {
                    this.removeReferences(cellId, oldFormula);
                }

                if (String(value).startsWith('=')) {
                    store.formulas[cellId] = value.toUpperCase();
                    this.updateReferences(cellId, value);
                } else {
                    store.formulas[cellId] = value;
                }

                store.version++;
                return store;
            });
        },

        getCellValue(cellId) {
            const store = get(this);
            const formula = store.formulas[cellId];

            if (formula && String(formula).startsWith('=')) {
                return this.evaluateFormula(formula);
            }
            return formula || '';
        },

        getRawValue(cellId) {
            const store = get(this);
            return store.formulas[cellId] || '';
        },

        evaluateFormula(formula) {
            if (!String(formula).startsWith('=')) return formula;

            try {
                const expression = String(formula).substring(1).toUpperCase();

                if (!isNaN(Number(expression))) {
                    return String(expression);
                }

                const evaluatedExpression = expression.replace(/[A-Za-z]+[0-9]+/g, (match) => {
                    const value = this.getCellValue(match.toUpperCase());
                    if (value === '') return '0';
                    return isNaN(Number(value)) ? '0' : value;
                });

                if (!/^[0-9+\-*/() .]*$/.test(evaluatedExpression)) {
                    return '#ERROR!';
                }

                const result = eval(evaluatedExpression);
                return isNaN(result) ? '#ERROR!' : String(result);
            } catch (error) {
                return '#ERROR!';
            }
        },

        updateReferences(cellId, formula) {
            update(store => {
                const referencedCells = String(formula).toUpperCase().match(/[A-Za-z]+[0-9]+/g) || [];

                referencedCells.forEach(refCellId => {
                    const upperRefCellId = refCellId.toUpperCase();
                    if (!store.references[upperRefCellId]) {
                        store.references[upperRefCellId] = new Set();
                    }
                    store.references[upperRefCellId].add(cellId.toUpperCase());
                });

                return store;
            });
        },

        removeReferences(cellId, formula) {
            update(store => {
                const referencedCells = String(formula).toUpperCase().match(/[A-Za-z]+[0-9]+/g) || [];

                referencedCells.forEach(refCellId => {
                    const upperRefCellId = refCellId.toUpperCase();
                    if (store.references[upperRefCellId]) {
                        store.references[upperRefCellId].delete(cellId.toUpperCase());
                        if (store.references[upperRefCellId].size === 0) {
                            delete store.references[upperRefCellId];
                        }
                    }
                });

                return store;
            });
        },

        reset() {
            set({
                formulas: {},
                references: {},
                version: 0
            });
        }
    };
}

export const spreadsheetStore = createSpreadsheetStore();