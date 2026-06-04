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
