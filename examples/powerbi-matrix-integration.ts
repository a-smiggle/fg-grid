/**
 * Power BI Matrix Visual Integration Example
 * Complete implementation for PowerBi-visuals-Power-Matrix
 */

import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import DataView = powerbi.DataView;
import DataViewTable = powerbi.DataViewTable;
import DataViewTableRow = powerbi.DataViewTableRow;

// FG-Grid types are available globally after including the library
declare var FgGrid: any;

export class PowerMatrixVisual implements IVisual {
    private target: HTMLElement;
    private host: IVisualHost;
    private grid: any;
    private gridContainer: HTMLElement;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.host = options.host;
        
        // Create container for the grid
        this.gridContainer = document.createElement('div');
        this.gridContainer.className = 'fg-grid-container';
        this.gridContainer.style.width = '100%';
        this.gridContainer.style.height = '100%';
        this.target.appendChild(this.gridContainer);
        
        // Initialize FG-Grid
        this.initializeGrid();
    }

    private initializeGrid(): void {
        try {
            // Basic grid configuration
            const config = {
                container: this.gridContainer,
                columns: [],
                data: [],
                theme: 'default',
                height: '100%',
                width: '100%',
                // Power BI specific settings
                selection: {
                    enabled: true,
                    multiple: true
                },
                sorting: {
                    enabled: true,
                    multiple: true
                },
                filtering: {
                    enabled: true
                },
                grouping: {
                    enabled: true
                }
            };

            // Create the grid instance
            this.grid = new FgGrid.Grid(config);
            
            // Set up event handlers for Power BI integration
            this.setupEventHandlers();
            
        } catch (error) {
            console.error('Failed to initialize FG-Grid:', error);
            this.showErrorMessage('Grid initialization failed');
        }
    }

    private setupEventHandlers(): void {
        if (!this.grid) return;

        // Handle row selection for Power BI cross-filtering
        this.grid.on('rowSelect', (event: any) => {
            this.handleRowSelection(event.selectedRows);
        });

        // Handle sorting changes
        this.grid.on('sort', (event: any) => {
            console.log('Sort changed:', event.sort);
        });

        // Handle filtering changes
        this.grid.on('filter', (event: any) => {
            console.log('Filter changed:', event.filters);
        });
    }

    private handleRowSelection(selectedRows: any[]): void {
        try {
            // Convert selected rows to Power BI selection format
            const selectionIds = selectedRows.map(row => {
                // Create selection ID based on your data structure
                return this.host.createSelectionIdBuilder()
                    .withTable(row.dataViewTableRow, row.dataViewTable)
                    .createSelectionId();
            });

            // Apply selection in Power BI
            this.host.selectionManager.select(selectionIds);
        } catch (error) {
            console.error('Selection handling failed:', error);
        }
    }

    public update(options: VisualUpdateOptions): void {
        try {
            const dataView = options.dataViews[0];
            
            if (!dataView || !dataView.table) {
                this.showErrorMessage('No data available');
                return;
            }

            // Convert Power BI data to FG-Grid format
            const { columns, data } = this.transformData(dataView);
            
            // Update grid configuration
            if (this.grid) {
                this.grid.setColumns(columns);
                this.grid.setData(data);
                this.grid.render();
            }

            // Handle viewport changes
            if (options.viewport) {
                this.resizeGrid(options.viewport.width, options.viewport.height);
            }

        } catch (error) {
            console.error('Update failed:', error);
            this.showErrorMessage('Data update failed');
        }
    }

    private transformData(dataView: DataView): { columns: any[], data: any[] } {
        const table = dataView.table;
        
        // Transform columns
        const columns = table.columns.map((column, index) => ({
            id: `col_${index}`,
            title: column.displayName,
            field: `field_${index}`,
            type: this.getColumnType(column.type),
            width: 120,
            sortable: true,
            filterable: true,
            resizable: true
        }));

        // Transform data rows
        const data = table.rows.map((row: DataViewTableRow, rowIndex: number) => {
            const rowData: any = {
                id: rowIndex,
                _powerbi: {
                    dataViewTableRow: row,
                    dataViewTable: table
                }
            };

            // Map each cell value to the corresponding field
            row.forEach((cellValue, colIndex) => {
                rowData[`field_${colIndex}`] = this.formatCellValue(cellValue, columns[colIndex].type);
            });

            return rowData;
        });

        return { columns, data };
    }

    private getColumnType(powerBiType: any): string {
        // Map Power BI data types to FG-Grid column types
        switch (powerBiType?.valueOf?.()?.toString()) {
            case 'Number':
            case 'Integer':
                return 'number';
            case 'DateTime':
                return 'date';
            case 'Boolean':
                return 'boolean';
            default:
                return 'string';
        }
    }

    private formatCellValue(value: any, columnType: string): any {
        if (value === null || value === undefined) {
            return '';
        }

        switch (columnType) {
            case 'number':
                return typeof value === 'number' ? value : parseFloat(value) || 0;
            case 'date':
                return value instanceof Date ? value : new Date(value);
            case 'boolean':
                return Boolean(value);
            default:
                return String(value);
        }
    }

    private resizeGrid(width: number, height: number): void {
        if (this.gridContainer) {
            this.gridContainer.style.width = `${width}px`;
            this.gridContainer.style.height = `${height}px`;
        }

        if (this.grid && this.grid.resize) {
            this.grid.resize();
        }
    }

    private showErrorMessage(message: string): void {
        this.gridContainer.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: #666;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            ">
                ${message}
            </div>
        `;
    }

    public destroy(): void {
        if (this.grid && this.grid.destroy) {
            this.grid.destroy();
        }
        this.grid = null;
    }
}
