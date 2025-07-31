/**
 * Simple Grouping Bar Configuration for Power BI Visual
 * Add this to your existing Power BI visual implementation
 */

// Enhanced grid configuration with grouping bar support
const gridConfigWithGrouping = {
    container: this.gridContainer,
    columns: [], // Your columns array
    data: [],    // Your data array
    
    // Basic settings
    height: '100%',
    width: '100%',
    theme: 'default',
    
    // GROUPING BAR CONFIGURATION
    grouping: {
        enabled: true,           // Enable grouping functionality
        multiple: true,          // Allow multiple grouping levels
        showGroupingBar: true,   // Show the drag-and-drop grouping bar
        collapsible: true,       // Allow expand/collapse of groups
        expandAll: false         // Start with groups collapsed
    },
    
    // GROUPING BAR APPEARANCE
    rowGroupBar: {
        enabled: true,
        height: 35,
        emptyText: 'Drag columns here to group rows'
    },
    
    // ENABLE DRAG AND DROP
    columnDrag: {
        enabled: true,
        allowGrouping: true      // Allow dragging columns to grouping bar
    },
    
    // Other settings...
    selection: { enabled: true, multiple: true },
    sorting: { enabled: true, multiple: true },
    filtering: { enabled: true }
};

// COLUMN CONFIGURATION FOR GROUPING
// Make sure your columns have the 'groupable' property
const columnsWithGrouping = [
    {
        id: 'category',
        title: 'Category',
        field: 'category',
        type: 'string',
        groupable: true,         // Enable this column for grouping
        sortable: true,
        width: 150
    },
    {
        id: 'region',
        title: 'Region', 
        field: 'region',
        type: 'string',
        groupable: true,         // Enable this column for grouping
        sortable: true,
        width: 120
    },
    {
        id: 'sales',
        title: 'Sales',
        field: 'sales',
        type: 'number',
        groupable: false,        // Don't allow grouping numeric columns
        aggregation: 'sum',      // How to aggregate when grouped
        sortable: true,
        width: 100
    }
];

// EVENT HANDLERS FOR GROUPING
private setupGroupingEventHandlers(): void {
    if (!this.grid) return;

    // Handle when user drags column to grouping bar
    this.grid.on('columnDragToGroup', (event) => {
        console.log('Column added to grouping:', event.column.field);
        // Column is automatically grouped by FG-Grid
    });

    // Handle when user removes column from grouping bar
    this.grid.on('columnRemoveFromGroup', (event) => {
        console.log('Column removed from grouping:', event.column.field);
        // Grouping is automatically updated by FG-Grid
    });

    // Handle group expand/collapse
    this.grid.on('groupExpand', (event) => {
        console.log('Group expanded:', event.group);
    });

    this.grid.on('groupCollapse', (event) => {
        console.log('Group collapsed:', event.group);
    });
}

// APPLY GROUPING PROGRAMMATICALLY
private applyInitialGrouping(): void {
    // You can set initial grouping when the visual loads
    if (this.grid) {
        // Group by category, then by region
        this.grid.setGrouping(['category', 'region']);
    }
}

// COMPLETE IMPLEMENTATION EXAMPLE
export class PowerMatrixVisualWithGrouping implements IVisual {
    private grid: any;
    private gridContainer: HTMLElement;

    private initializeGrid(): void {
        // Create grid with grouping bar support
        this.grid = new FgGrid.Grid({
            container: this.gridContainer,
            columns: [],
            data: [],
            
            // Enable grouping bar
            grouping: {
                enabled: true,
                multiple: true,
                showGroupingBar: true,
                collapsible: true
            },
            rowGroupBar: {
                enabled: true,
                height: 35,
                emptyText: 'Drag columns here to group'
            },
            columnDrag: {
                enabled: true,
                allowGrouping: true
            }
        });

        // Set up event handlers
        this.setupGroupingEventHandlers();
    }

    public update(options: VisualUpdateOptions): void {
        // Transform your Power BI data
        const { columns, data } = this.transformData(options.dataViews[0]);
        
        // Make sure columns are configured for grouping
        const groupableColumns = columns.map(col => ({
            ...col,
            groupable: col.type === 'string', // Only allow grouping on string columns
            aggregation: col.type === 'number' ? 'sum' : undefined
        }));

        // Update grid
        if (this.grid) {
            this.grid.setColumns(groupableColumns);
            this.grid.setData(data);
            this.grid.render();
        }
    }

    private setupGroupingEventHandlers(): void {
        this.grid.on('columnDragToGroup', (event) => {
            console.log('Grouped by:', event.column.field);
        });

        this.grid.on('columnRemoveFromGroup', (event) => {
            console.log('Ungrouped:', event.column.field);
        });
    }
}

// CSS STYLING (add to your visual.less file)
/*
.fg-row-group-bar {
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    font-family: 'Segoe UI', sans-serif;
}

.fg-row-group-bar-empty-text {
    color: #6c757d;
    font-size: 12px;
}

.fg-row-group-bar-item {
    background: #0078d4;
    color: white;
    border-radius: 3px;
    font-size: 11px;
}
*/
