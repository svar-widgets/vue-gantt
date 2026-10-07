<div align="center">

# SVAR Vue Gantt Chart

</div>

<div align="center">

[Homepage](https://svar.dev/vue/gantt/) • [Getting Started](https://docs.svar.dev/vue/gantt/getting_started/) • [Demos](https://docs.svar.dev/vue/gantt/samples/#/base/willow)

</div>

<div align="center">

[![npm](https://img.shields.io/npm/v/@svar-ui/vue-gantt.svg)](https://www.npmjs.com/package/@svar-ui/vue-gantt)
[![License](https://img.shields.io/github/license/svar-widgets/vue-gantt)](https://github.com/svar-widgets/vue-gantt/blob/main/license.txt)
[![npm downloads](https://img.shields.io/npm/dm/@svar-ui/vue-gantt.svg)](https://www.npmjs.com/package/@svar-ui/vue-gantt)

</div>

[SVAR Vue Gantt](https://svar.dev/vue/gantt/) is a customizable, interactive Gantt chart component for Vue 3 designed for visualizing project timelines. The component provides an intuitive interface for managing tasks and dependencies directly on the timeline via drag-and-drop or a customizable task edit form. Comes with full TypeScript support, developer-friendly API, and flexible CSS styling.

The library provides a lightweight, MIT-licensed core for building Gantt charts with essential project scheduling functionality. For more advanced use cases, the PRO edition adds scheduling logic such as auto-scheduling, working time calendars, critical path analysis, baselines, and other features required for complex project planning.

<div align="center">
<img src="https://svar.dev/images/github/basic-gantt-react.gif" alt="SVAR Vue Gantt Chart UI">
</div>

### :sparkles: Key Features

SVAR Vue Gantt component offers a strong foundation for project planning and task management applications:

**Interactive & customizable timeline**
-   Interactive drag-and-drop task editing
-   Task dependencies visualization
-   Hierarchical structure
-   Configurable timeline with flexible time scales
-   Drag tasks from a backlog
-   Zooming with scroll

**Configurable grid**
-   Sorting 
-   Reordering tasks in the grid
-   Custom columns set
-   Custom HTML in grid cells
-   In-cell editing of task details

**Task interaction**
-   Customizable task edit form
-   Built-in toolbar and context menu
-   Tooltips for taskbars and links
-   Hotkeys support for common actions
-   Filtering (including natural language search)

**Data & performance**
-   Virtual rendering for large datasets
-   Dynamic loading of sub-tasks
-   REST data binding with RestDataProvider
-   Real-time updates from the server

**UI & tooling**
-   Light and dark themes
-   Full TypeScript support
-   [AI tools](https://docs.svar.dev/vue/gantt/ai-tools/) for AI-assisted development: MCP server, skills, context files

### :rocket: PRO Edition

SVAR Vue Gantt is available in open-source and [PRO Edition](https://svar.dev/vue/gantt/#pro). The PRO Edition offers additional features and automation logic:

-   Scheduling logic → auto-scheduling (FS, SS, FF, SF, and lag), critical path, constraints (6 types), deadlines, manual and inactive tasks, slack, summary tasks automation
-   Resource management → resource assignment (including drag-and-drop), resource-driven scheduling, load chart and histogram
-   Planning tools → baselines, progress line, S-curve, vertical markers
-   Calendar control → working days calendar (non-linear time scale), individual calendars for tasks and resources
-   Advanced structure → task grouping, rollups, split tasks, unscheduled tasks, sub-grid panel, WBS codes support
-   UX features → undo/redo
-   Data export → PDF, PNG, Excel, MS Project import/export (including resources and assignments)

Visit the [pricing page](https://svar.dev/vue/gantt/pricing/) for full feature comparison, licensing details, and **free trial**.

Or [see the live demos](https://docs.svar.dev/vue/gantt/samples/#/base/willow) to try SVAR Vue Gantt's features in action.

### :hammer_and_wrench: How to Use

To install SVAR Vue Gantt:

```
npm install @svar-ui/vue-gantt
```

To use the Gantt chart, simply import the package and include the component in your Vue file:

```vue
<script setup>
import { Gantt } from "@svar-ui/vue-gantt";
import "@svar-ui/vue-gantt/all.css";

const tasks = [
    {
        id: 1,
        start: new Date(2024, 3, 2),
        end: new Date(2024, 3, 17),
        text: "Project planning",
        progress: 30,
        parent: 0,
        type: "summary",
        open: true,
        details: "Outline the project's scope and resources.",
    },
];
const links = [];
const scales = [
    { unit: "month", step: 1, format: "%F %Y" },
    { unit: "day", step: 1, format: "%j" },
];
</script>

<template>
    <Gantt :tasks="tasks" :links="links" :scales="scales" />
</template>
```

For further instructions, follow the detailed [how-to-start guide](https://docs.svar.dev/vue/gantt/getting_started/).

### :star: Show Your Support

If SVAR Vue Gantt helps your project, give us a star! It helps us reach more developers and keeps us motivated to add new features.

### :speech_balloon: Need Help?

[Post an Issue](https://github.com/svar-widgets/vue-gantt/issues/) or use our [community forum](https://forum.svar.dev).
