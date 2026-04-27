import BasicInit from "./cases/BasicInit.vue";
import GanttProvider from "./cases/GanttProvider.vue";
import GanttBatchProvider from "./cases/GanttBatchProvider.vue";
import GanttBackend from "./cases/GanttBackend.vue";
import GanttScales from "./cases/GanttScales.vue";
import GanttGrid from "./cases/GanttGrid.vue";
import GanttNoGrid from "./cases/GanttNoGrid.vue";
import GanttFixedColumns from "./cases/GanttFixedColumns.vue";
import GanttFlexColumns from "./cases/GanttFlexColumns.vue";
import GanttReadOnly from "./cases/GanttReadOnly.vue";
import GanttPreventActions from "./cases/GanttPreventActions.vue";
import GanttForm from "./cases/GanttForm.vue";
import GanttSizes from "./cases/GanttSizes.vue";
import GanttMultiple from "./cases/GanttMultiple.vue";
import GanttPerformance from "./cases/GanttPerformance.vue";

import Markers from "./cases/ProMarkers.vue";
import UnscheduledTasks from "./cases/ProUnscheduledTasks.vue";
import Baselines from "./cases/ProBaselines.vue";
import Rollups from "./cases/ProRollups.vue";
import CriticalPath from "./cases/ProCriticalPath.vue";
import AutoSchedule from "./cases/ProAutoSchedule.vue";
import Calendar from "./cases/ProCalendar.vue";
import CalendarChanges from "./cases/ProCalendarChanges.vue";
import UndoRedo from "./cases/ProUndo.vue";
import UndoToolbar from "./cases/ProUndoToolbar.vue";
import SplitTasks from "./cases/ProSplitTasks.vue";
import ScheduleAll from "./cases/ProScheduleAll.vue";
import SummariesProgress from "./cases/ProSummariesProgress.vue";
import SummariesConvert from "./cases/ProSummariesConvert.vue";
import MSProject from "./cases/ProMSProject.vue";
import Export from "./cases/ProExport.vue";
import Slack from "./cases/ProSlack.vue";

import GanttTooltips from "./cases/GanttTooltips.vue";
import GanttToolbar from "./cases/GanttToolbar.vue";
import GanttToolbarCustom from "./cases/GanttToolbarCustom.vue";
import GanttToolbarButtons from "./cases/GanttToolbarButtons.vue";
import GanttText from "./cases/GanttText.vue";
import GanttLocale from "./cases/GanttLocale.vue";
import GanttStartEnd from "./cases/GanttStartEnd.vue";
import GanttScaleDate from "./cases/GanttScaleDate.vue";
import GanttFullscreen from "./cases/GanttFullscreen.vue";
import GanttZoom from "./cases/GanttZoom.vue";
import GanttCustomZoom from "./cases/GanttCustomZoom.vue";
import GanttLengthUnit from "./cases/GanttLengthUnit.vue";
import GanttTaskTypes from "./cases/GanttTaskTypes.vue";
import ChartCellBorders from "./cases/ChartBorders.vue";
import ContextMenu from "./cases/ContextMenu.vue";
import ContextMenuHandler from "./cases/ContextMenuHandler.vue";
import ContextMenuOptions from "./cases/ContextMenuOptions.vue";
import GanttHolidays from "./cases/GanttHolidays.vue";
import GanttSort from "./cases/GanttSort.vue";
import GanttCustomSort from "./cases/GanttCustomSort.vue";
import GanttFilter from "./cases/GanttFilter.vue";
import GanttFilterInline from "./cases/GanttFilterInline.vue";
import GanttFilterBuilder from "./cases/GanttFilterBuilder.vue";
import GanttFilterQuery from "./cases/GanttFilterQuery.vue";
import GanttEditor from "./cases/GanttEditor.vue";
import GanttEditorConfig from "./cases/GanttEditorConfig.vue";
import GanttEditorCustomControls from "./cases/GanttEditorCustomControls.vue";
import GanttEditorComments from "./cases/GanttEditorComments.vue";
import GanttEditorTasks from "./cases/GanttEditorTasks.vue";
import GanttScaleUnit from "./cases/GanttScaleUnit.vue";
import GanttDurationUnitHour from "./cases/GanttDurationUnitHour.vue";
import GanttDurationUnitChanges from "./cases/GanttDurationUnitChanges.vue";
import GanttMinScaleUnit from "./cases/GanttMinScaleUnit.vue";
import HeaderMenu from "./cases/GridHeaderMenu.vue";
import GridInlineEditors from "./cases/GridInlineEditors.vue";
import GanttEditorReadonly from "./cases/GanttEditorReadonly.vue";
import GanttEditorValidation from "./cases/GanttEditorValidation.vue";

export const links = [
	["/base/:skin", "Basic Gantt", BasicInit, "BasicInit"],
	["/sizes/:skin", "Scale / cell sizes", GanttSizes, "GanttSizes"],
	[
		"/cell-borders/:skin",
		"Chart cell borders",
		ChartCellBorders,
		"ChartBorders",
	],
	["/scales/:skin", "Custom scales", GanttScales, "GanttScales"],
	["/start-end/:skin", "Start/end dates", GanttStartEnd, "GanttStartEnd"],
	["/scroll-date/:skin", "Scroll to date", GanttScaleDate, "GanttScaleDate"],
	[
		"/custom-scale/:skin",
		"Custom scale unit",
		GanttScaleUnit,
		"GanttScaleUnit",
	],
	[
		"/custom-min-scale/:skin",
		"Custom minimal scale unit",
		GanttMinScaleUnit,
		"GanttMinScaleUnit",
	],
	["/markers/:skin", "Markers", Markers, "ProMarkers", { pro: true }],
	["/baseline/:skin", "Baselines", Baselines, "ProBaselines", { pro: true }],
	["/rollups/:skin", "Rollups", Rollups, "ProRollups", { pro: true }],

	["/holidays/:skin", "Holidays", GanttHolidays, "GanttHolidays"],

	["/calendar/:skin", "Calendar", Calendar, "ProCalendar", { pro: true }],
	[
		"/calendar-changes/:skin",
		"Calendar: rules changes",
		CalendarChanges,
		"ProCalendarChanges",
		{ pro: true },
	],

	["/templates/:skin", "Custom text", GanttText, "GanttText"],
	["/tooltips/:skin", "Tooltips", GanttTooltips, "GanttTooltips"],

	["/task-types/:skin", "Task types", GanttTaskTypes, "GanttTaskTypes"],

	[
		"/split-tasks/:skin",
		"Split tasks",
		SplitTasks,
		"ProSplitTasks",
		{ pro: true },
	],
	[
		"/summary-progress/:skin",
		"Summary tasks: auto progress",
		SummariesProgress,
		"ProSummariesProgress",
		{ pro: true },
	],
	[
		"/summary-convert/:skin",
		"Summary tasks: auto type",
		SummariesConvert,
		"ProSummariesConvert",
		{ pro: true },
	],
	["/zoom/:skin", "Zoom", GanttZoom, "GanttZoom"],
	["/custom-zoom/:skin", "Custom Zoom", GanttCustomZoom, "GanttCustomZoom"],
	[
		"/length-unit/:skin",
		"Length unit (rounding)",
		GanttLengthUnit,
		"GanttLengthUnit",
	],
	[
		"/duration-unit/:skin",
		"Duration unit: hour",
		GanttDurationUnitHour,
		"GanttDurationUnitHour",
	],
	[
		"/duration-changes/:skin",
		"Duration unit: changes",
		GanttDurationUnitChanges,
		"GanttDurationUnitChanges",
	],
	[
		"/autoschedule/:skin",
		"Auto scheduling",
		AutoSchedule,
		"ProAutoSchedule",
		{ pro: true },
	],
	[
		"/critical-path/:skin",
		"Critical path",
		CriticalPath,
		"ProCriticalPath",
		{ pro: true },
	],
	["/slack/:skin", "Slack", Slack, "ProSlack", { pro: true }],
	[
		"/unscheduled-tasks/:skin",
		"Unscheduled tasks",
		UnscheduledTasks,
		"ProUnscheduledTasks",
		{ pro: true },
	],
	[
		"/schedule-all/:skin",
		"Scheduling: features",
		ScheduleAll,
		"ProScheduleAll",
		{ pro: true },
	],
	["/no-grid/:skin", "No grid", GanttNoGrid, "GanttNoGrid"],
	[
		"/grid-fill-space-columns/:skin",
		"Flexible grid columns",
		GanttFlexColumns,
		"GanttFlexColumns",
	],
	[
		"/grid-fixed-columns/:skin",
		"Fixed grid columns",
		GanttFixedColumns,
		"GanttFixedColumns",
	],
	[
		"/grid-custom-columns/:skin",
		"Custom grid columns",
		GanttGrid,
		"GanttGrid",
	],
	[
		"/grid-inline-editors/:skin",
		"Grid inline editors",
		GridInlineEditors,
		"GridInlineEditors",
	],

	["/toolbar/:skin", "Toolbar", GanttToolbar, "GanttToolbar"],
	[
		"/toolbar-buttons/:skin",
		"Toolbar: limited buttons",
		GanttToolbarButtons,
		"GanttToolbarButtons",
	],
	[
		"/toolbar-custom/:skin",
		"Toolbar: custom buttons",
		GanttToolbarCustom,
		"GanttToolbarCustom",
	],
	["/context-menu/:skin", "Context menu", ContextMenu, "ContextMenu"],
	[
		"/menu-handler/:skin",
		"Context menu: limiting options",
		ContextMenuHandler,
		"ContextMenuHandler",
	],
	[
		"/menu-options/:skin",
		"Context menu: custom options",
		ContextMenuOptions,
		"ContextMenuOptions",
	],
	[
		"/header-menu/:skin",
		"Header menu: hiding columns",
		HeaderMenu,
		"GridHeaderMenu",
	],
	["/locale/:skin", "Locales", GanttLocale, "GanttLocale"],
	["/fullscreen/:skin", "Fullscreen", GanttFullscreen, "GanttFullscreen"],
	["/readonly/:skin", "Readonly mode", GanttReadOnly, "GanttReadOnly"],
	[
		"/gantt-multiple/:skin",
		"Many Gantts per page",
		GanttMultiple,
		"GanttMultiple",
	],
	["/performance/:skin", "Performance", GanttPerformance, "GanttPerformance"],
	[
		"/prevent-actions/:skin",
		"Preventing UI actions",
		GanttPreventActions,
		"GanttPreventActions",
	],
	["/sorting/:skin", "Custom sorting", GanttSort, "GanttSort"],
	["/sorting-api/:skin", "Sort by API", GanttCustomSort, "GanttCustomSort"],
	["/undo-redo/:skin", "Undo/redo", UndoRedo, "ProUndo", { pro: true }],
	[
		"/undo-toolbar/:skin",
		"Undo/redo with Toolbar",
		UndoToolbar,
		"ProUndoToolbar",
		{ pro: true },
	],
	[
		"/filtering/:skin",
		"Inline Filtering",
		GanttFilterInline,
		"GanttFilterInline",
	],
	["/filtering-api/:skin", "External filters", GanttFilter, "GanttFilter"],
	[
		"/filtering-builder/:skin",
		"Integration with Filter Builder",
		GanttFilterBuilder,
		"GanttFilterBuilder",
	],
	[
		"/filtering-query/:skin",
		"Integration with Filter Query",
		GanttFilterQuery,
		"GanttFilterQuery",
	],

	["/backend/:skin", "Backend data", GanttBackend, "GanttBackend"],
	[
		"/backend-provider/:skin",
		"Saving to backend",
		GanttProvider,
		"GanttProvider",
	],
	[
		"/backend-provider-batch/:skin",
		"Saving to backend: batch request",
		GanttBatchProvider,
		"GanttBatchProvider",
	],
	[
		"/export/:skin",
		"Export data (server-side)",
		Export,
		"Export",
		{ pro: true },
	],
	[
		"/msp/:skin",
		"Import / export to MS Project (client-side)",
		MSProject,
		"MSProject",
		{ pro: true },
	],
	["/editor/:skin", "Editor", GanttEditor, "GanttEditor"],
	[
		"/editor-config/:skin",
		"Editor: custom settings",
		GanttEditorConfig,
		"GanttEditorConfig",
	],
	[
		"/editor-custom-controls/:skin",
		"Editor: custom controls",
		GanttEditorCustomControls,
		"GanttEditorCustomControls",
	],
	[
		"/editor-comments/:skin",
		"Editor: custom comments",
		GanttEditorComments,
		"GanttEditorComments",
	],
	[
		"/editor-tasks/:skin",
		"Editor: custom tasks",
		GanttEditorTasks,
		"GanttEditorTasks",
	],
	[
		"/editor-readonly/:skin",
		"Editor: readonly",
		GanttEditorReadonly,
		"GanttEditorReadonly",
	],
	[
		"/editor-validation/:skin",
		"Editor: validation",
		GanttEditorValidation,
		"GanttEditorValidation",
	],
	["/custom-edit-form/:skin", "Custom edit form", GanttForm, "GanttForm"],
];
