<div align="center">

# SVAR Vue Gantt Chart

</div>

<div align="center">

[Homepage](https://svar.dev/vue/gantt/) • [Getting Started](https://docs.svar.dev/vue/gantt/getting-started/quickstart/) • [Demos](https://docs.svar.dev/vue/gantt/samples/#/base/willow)

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

### Key Features

-   Interactive drag-and-drop task editing
-   Task dependencies and hierarchical structure
-   Configurable timeline with flexible time scales
-   Customizable grid, task bars, and UI via CSS
-   Sorting and filtering (including natural language search)
-   Built-in tooltips, context menu, and toolbar
-   Zooming with scroll
-   Hotkeys support for common actions
-   High performance with virtual rendering for large datasets
-   Light and dark themes
-   Full TypeScript support

### :rocket: PRO Edition

SVAR Vue Gantt is available in open-source and [PRO Editions](https://svar.dev/vue/gantt/#pro). The PRO Edition offers additional features and automation logic:

-   Scheduling logic → auto-scheduling, critical path, slack, summary tasks automation
-   Resource management → resource assignment, workload visualization
-   Planning tools → baselines, markers
-   Calendar control → working-time calendar, individual calendars for tasks and resources
-   Advanced structure → rollups, split tasks, unscheduled tasks, WBS codes support
-   Workflow features → undo/redo
-   Data Export → PDF, PNG, Excel, MS Project import/export

Visit the [pricing page](https://svar.dev/vue/gantt/pricing/) for full feature comparison, licensing details, and **free trial**.

Or [see the live demo](https://svar.dev/demos/vue/gantt/).

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

For further instructions, follow the detailed [how-to-start guide](https://docs.svar.dev/vue/gantt/getting-started/quickstart/).

### :star: Show Your Support

If SVAR Vue Gantt helps your project, give us a star! It helps us reach more developers and keeps us motivated to add new features.

### :speech_balloon: Need Help?

[Post an Issue](https://github.com/svar-widgets/vue-gantt/issues/) or use our [community forum](https://forum.svar.dev).
