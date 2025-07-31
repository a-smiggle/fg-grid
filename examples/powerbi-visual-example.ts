/**
 * Example Power BI Visual implementation using FG-Grid
 * This is a complete example showing how to integrate FG-Grid into a Power BI visual
 */

import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbi.DataView;
import DataViewTable = powerbi.DataViewTable;
import DataViewTableColumn = powerbi.DataViewTableColumn;

// Import the FG-Grid Power BI build (adjust path as needed)
import "../libs/fg-grid.powerbi.min.js";
import "../style/fg-grid.css";

// TypeScript declarations for FG-Grid
declare global {
    var FancyGrid: {
        Grid: new (config: GridConfig) => GridInstance;
        Fancy: any;
    };
}

interface GridConfig {
    renderTo: HTMLElement | string;
    data: any[];
    columns: ColumnConfig[];
    theme?: string;
    rowHeight?: number;
    headerRowHeight?: number;
    width?: number;
    height?: number;
    cellsRightBorder?: boolean;
    columnLines?: boolean;
    activeCell?: boolean;
    selectingCells?: boolean;
}

interface ColumnConfig {
    index: string;
    title: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    width?: number;
    sortable?: boolean;
    resizable?: boolean;
    hidden?: boolean;
    format?: (params: any) => string;
    render?: (params: any) => string;
}

interface GridInstance {
    setData(data: any[]): void;
    destroy(): void;
    reRender(): void;
    getSelection(): any[];
    updateWidth(): void;
    updateVisibleHeight(): void;
}

export class Visual implements IVisual {
    private target: HTMLElement;
    private grid: GridInstance | null = null;
    private gridContainer: HTMLElement;
    private isGridInitialized: boolean = false;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor called');
        
        this.target = options.element;
        
        // Create container for the grid
        this.gridContainer = document.createElement('div');
        this.gridContainer.id = 'fg-grid-container';
        this.gridContainer.style.width = '100%';
        this.gridContainer.style.height = '100%';
        this.gridContainer.style.overflow = 'hidden';
        
        this.target.appendChild(this.gridContainer);
        
        // Initialize empty state
        this.showEmptyState();
    }

    public update(options: VisualUpdateOptions): void {
        try {
            console.log('Visual update called', options);
            
            // Check if we have data
            if (!options.dataViews || !options.dataViews[0] || !options.dataViews[0].table) {
                this.showEmptyState();
                return;
            }

            const dataView = options.dataViews[0];
            const table = dataView.table;

            // Validate data
            if (!table.rows || table.rows.length === 0) {
                this.showEmptyState();
                return;
            }

            // Transform data for FG-Grid
            const data = this.transformData(dataView);
            const columns = this.getColumns(dataView);

            console.log('Transformed data:', data);
            console.log('Columns config:', columns);

            // Initialize or update grid
            if (!this.isGridInitialized) {
                this.initializeGrid(data, columns);
            } else if (this.grid) {
                this.grid.setData(data);
            }

            // Handle viewport changes
            this.handleViewportChange(options.viewport);

        } catch (error) {
            console.error('Error updating visual:', error);
            this.showErrorState(error.message);
        }
    }

    private initializeGrid(data: any[], columns: ColumnConfig[]): void {
        try {
            // Check if FancyGrid is available
            if (typeof FancyGrid === 'undefined') {
                throw new Error('FancyGrid library is not loaded');
            }

            // Clear any existing content
            this.gridContainer.innerHTML = '';

            // Initialize the grid
            this.grid = new FancyGrid.Grid({
                renderTo: this.gridContainer,
                data: data,
                columns: columns,
                theme: 'default',
                rowHeight: 28,
                headerRowHeight: 32,
                cellsRightBorder: true,
                columnLines: true,
                activeCell: true,
                selectingCells: true
            });

            this.isGridInitialized = true;
            console.log('Grid initialized successfully');

        } catch (error) {
            console.error('Error initializing grid:', error);
            this.showErrorState(error.message);
        }
    }

    private transformData(dataView: DataView): any[] {
        const table = dataView.table;
        const data: any[] = [];

        // Transform Power BI table data to array of objects
        for (let i = 0; i < table.rows.length; i++) {
            const row: any = {};
            
            for (let j = 0; j < table.columns.length; j++) {
                const column = table.columns[j];
                const columnName = this.getColumnDisplayName(column);
                let value = table.rows[i][j];

                // Handle different data types
                if (value !== null && value !== undefined) {
                    // Format dates
                    if (column.type && column.type.dateTime && value instanceof Date) {
                        value = value.toLocaleDateString();
                    }
                    // Format numbers
                    else if (column.type && column.type.numeric && typeof value === 'number') {
                        value = parseFloat(value.toFixed(2));
                    }
                }

                row[columnName] = value;
            }
            
            data.push(row);
        }

        return data;
    }

    private getColumns(dataView: DataView): ColumnConfig[] {
        const table = dataView.table;
        const columns: ColumnConfig[] = [];
        const viewport = this.target.getBoundingClientRect();
        const availableWidth = viewport.width || 800;
        const defaultColumnWidth = Math.max(100, availableWidth / table.columns.length);

        table.columns.forEach((column, index) => {
            const columnName = this.getColumnDisplayName(column);
            const columnType = this.getColumnType(column);
            
            columns.push({
                index: columnName,
                title: columnName,
                type: columnType,
                width: Math.min(defaultColumnWidth, 200),
                sortable: true,
                resizable: true,
                // Add custom formatting for specific types
                format: columnType === 'number' ? this.formatNumber : undefined
            });
        });

        return columns;
    }

    private getColumnDisplayName(column: DataViewTableColumn): string {
        return column.displayName || `Column ${column.index}`;
    }

    private getColumnType(column: DataViewTableColumn): 'string' | 'number' | 'date' | 'boolean' {
        if (!column.type) return 'string';

        if (column.type.numeric) {
            return 'number';
        } else if (column.type.dateTime) {
            return 'date';
        } else if (column.type.bool) {
            return 'boolean';
        } else {
            return 'string';
        }
    }

    private formatNumber = (params: any): string => {
        const value = params.value;
        if (typeof value === 'number' && !isNaN(value)) {
            return value.toLocaleString();
        }
        return value;
    }

    private handleViewportChange(viewport: powerbi.IViewport): void {
        if (!viewport) return;

        // Update container size
        this.gridContainer.style.width = viewport.width + 'px';
        this.gridContainer.style.height = viewport.height + 'px';

        // Update grid size if initialized
        if (this.grid && this.isGridInitialized) {
            try {
                this.grid.updateWidth();
                this.grid.updateVisibleHeight();
            } catch (error) {
                console.warn('Error updating grid size:', error);
            }
        }
    }

    private showEmptyState(): void {
        this.gridContainer.innerHTML = `
            <div style="
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100%; 
                color: #666; 
                font-family: 'Segoe UI', sans-serif;
                flex-direction: column;
            ">
                <div style="font-size: 18px; margin-bottom: 10px;">No Data Available</div>
                <div style="font-size: 14px;">Please add data fields to the visual</div>
            </div>
        `;
        this.isGridInitialized = false;
    }

    private showErrorState(errorMessage: string): void {
        this.gridContainer.innerHTML = `
            <div style="
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100%; 
                color: #d13438; 
                font-family: 'Segoe UI', sans-serif;
                flex-direction: column;
                padding: 20px;
                text-align: center;
            ">
                <div style="font-size: 18px; margin-bottom: 10px;">Error Loading Grid</div>
                <div style="font-size: 14px; background: #f3f2f1; padding: 10px; border-radius: 4px;">
                    ${errorMessage}
                </div>
            </div>
        `;
        this.isGridInitialized = false;
    }

    public destroy(): void {
        console.log('Visual destroy called');
        
        try {
            if (this.grid) {
                this.grid.destroy();
                this.grid = null;
            }
            this.isGridInitialized = false;
        } catch (error) {
            console.error('Error destroying grid:', error);
        }
    }

    public enumerateObjectInstances(options: powerbi.EnumerateVisualObjectInstancesOptions): powerbi.VisualObjectInstance[] | powerbi.VisualObjectInstanceEnumerationObject {
        // Add custom properties panel options here if needed
        return [];
    }
}
