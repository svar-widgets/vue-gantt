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
