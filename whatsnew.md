## 2.8.0

### New features

-   Inclusive end dates: end dates are shown as the last day of a task
-   Secondary grid panel to the right of the chart | PRO feature
-   Auto scheduling
    -   Faster auto scheduling and bulk updates | PRO feature
    -   Scheduling with all 4 link types | PRO feature
    -   Constraints | PRO feature
    -   Scheduling conflicts reporting UI | PRO feature
    -   Deadlines | PRO feature
    -   Inactive tasks | PRO feature
    -   Manually scheduled tasks | PRO feature
-   Timeline
    -   Progress line | PRO feature
    -   S-curve | PRO feature
-   Data operations
    -   Adding tasks via a placeholder row | PRO feature
    -   Moving tasks between groups by drag and drop | PRO feature
    -   Ability to add new tasks by drag-n-drop from outside components
    -   The `locateTask` helper to find the task under the pointer in drag-n-drop handlers
-   Resources
    -   Histogram mode of the Resource load chart | PRO feature
    -   Assigning resources by dragging them from the Resource load chart | PRO feature
    -   Scheduling tasks by resource calendars | PRO feature
    -   Export of resources and assignments | PRO feature
-   Support of multi-user editing (real-time updates)

### Updates

-   Simplified model of unscheduled tasks: removing the start date unschedules the task | PRO feature
-   Scheduling unscheduled tasks by drag-n-drop in the chart area | PRO feature
-   Preventing invalid links in the UI | PRO feature

### Fixes

-   Gantt fails to load projects with long task chains
-   Incorrect header height of collapsed grid
-   Filtering does not work for grouped tasks
-   Task updates incorrectly set `unscheduled` for summary tasks
-   Drag-n-drop between groups based on duration incorrectly changes `duration`
-   On load performance with state derivation and dates
-   Undo/redo with auto scheduling doesn't snap to dates correctly
-   Deleting branches with subtasks throws errors
-   A single edit is recorded as several undo steps
-   Summary task dates are stale after lazy load into a branch
-   Undo does not remove fields added by an edit
-   MS Project export ignores the `durationUnit` setting and treats hour durations as days
-   Link lag is lost during export to and import from MS Project
-   A task without its own dates takes them from its baseline on import from MS Project
-   Import from MS Project treats a single baseline with any number as the primary one
-   Task fields are exported to MS Project out of the MSPDI schema order
-   Trim inner fields and duplicated data from the export payload
-   Copying a task ignores link lag
-   Clearing link lag does not reschedule tasks
-   Split task segments are sometimes incorrect
-   Undo after auto-scheduling moves tasks that weren't part of the change
-   Provider debounce drops earlier partial task updates
-   Silent summary updates do not go to the server
-   Task update sends old dates after auto-scheduling
-   Assignments removed on a change to summary do not go to the server
-   Summary tasks are saved in the middle of task dragging
-   Stale state after executing "import-tasks" or prop changes
-   Zoom levels include custom scale units
-   Repeated `registerScaleUnit` duplicates the unit

## 2.7.4

### Fixes

-   Grid and chart rows get out of sync after indent / outdent operations

## 2.7.3

### Fixes

-   Setting link lag breaks task dates
-   Editor allows negative values for split tasks segments
-   Undoing "delete-task" action does not restore assignments for this task
-   The "copy-task" action does not copy task assignments
-   The `readonly` settings does not block grid inline editors
-   Initial auto scheduling pass is added to history and can be undone
-   Clipboard keeps ids of deleted tasks
-   Tasks after undo/redo with enabled autoscheduling don't snap to dates correctly
-   History is not reset when links, resources or assignments are replaced
-   History handlers are active after disabling undo/redo at run time
-   Undo/redo replay triggers auto scheduling
-   Context menu references the previous task
-   Copy and paste of parent branches duplicates child tasks
-   Grid cell padding are misaligned
-   Fonts cannot be fully switched off from theme settings

## 2.7.2

### Fixes

-   Toolbar and context menu fail to render when no locale is provided

## 2.7.1

### Fixes

-   Better performance with links rendering
-   Zoom cannot start from Resource load view
-   Auto scheduling and summary `autoProgress` trigger infinite loop
-   Focus on Grid header and body cells is lost / unstable
-   Undo of the "move-task" action doesn't work after task was moved to a different branch
-   Cell width gets a fractional value when scale start/end are set
-   Newly added task is not rendered correctly after update
-   `highlightTime` can be used only with day / hour minimal scale unit
-   Incorrect marker position when zooming out to year scale

## 2.7.0

### New features

- Resource management | PRO feature
  - Visualizing and assigning resources | PRO feature
  - Resource load chart | PRO feature
  - Resource assignment handling in the Go backend | PRO feature
  - Grouping tasks by resources | PRO feature
  - Individual calendars for resources | PRO feature
- Individual calendars for tasks | PRO feature
- Grouping tasks by any field | PRO feature
- WBS codes | PRO feature
- Enhanced Editor UI with tabs for details
- Tooltips for links

### Updates

- Calendar JSON definition for serialization | PRO feature
- Dynamic rendering of the timescale
- Enhanced Tooltip with detailed settings
- Sticky text in scale cells to ensure that it is always visible
- Improved auto scheduling with summary tasks | PRO feature

### Fixes

- Export of tasks with calendar shows incorrect dates
- Zooming and scrolling in long scales is too slow and crashes
- Tree markers are lost after clearing filters
- Excessive `render-data` calls on horizontal scrolling
- Hover area for links is too small

### Breaking changes

-   Calendar is defined not via explicit instance creation, but by plain config
-   Tooltip content receives `{ api, data }` instead of `{ task, segmentIndex }`

## 2.6.1

### Fixes

- Incorrect license info
- Error in MIT package

## 2.6.0

### Initial features

Provides all the same functionality as Svelte Gantt 2.6.2
