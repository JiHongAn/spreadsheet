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
        },

        async initializeDummyData(totalRows = 1000000) {
            const CHUNK_SIZE = 10000;
            let processedRows = 0;
            const startTime = performance.now();

            console.log('더미데이터 생성 시작...');

            // 초기값 A1 설정
            update(store => {
                store.formulas['A1'] = '1';
                store.version++;
                return store;
            });

            while (processedRows < totalRows) {
                const chunkSize = Math.min(CHUNK_SIZE, totalRows - processedRows);

                await new Promise(resolve => {
                    update(store => {
                        const chunkStartTime = performance.now();

                        for (let i = 0; i < chunkSize; i++) {
                            const currentRow = processedRows + i + 1;
                            if (currentRow > 1) {
                                store.formulas[`A${currentRow}`] = `=A${currentRow - 1}+1`;
                            }
                            store.formulas[`B${currentRow}`] = `=A${currentRow}+1`;
                        }
                        store.version++;

                        const chunkEndTime = performance.now();

                        return store;
                    });

                    setTimeout(resolve, 0);
                });

                processedRows += chunkSize;
                console.log(`${processedRows.toLocaleString()}개 생성 완료...`);
            }

            const endTime = performance.now();
            const totalTime = endTime - startTime;

            console.log('더미데이터 생성 완료!');
            console.log(`총 소요 시간: ${(totalTime / 1000).toFixed(2)}초`);
        }
    };
}

export const spreadsheetStore = createSpreadsheetStore();