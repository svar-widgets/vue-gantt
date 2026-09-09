import BasicInit from "./cases/BasicInit.vue";
import GanttProvider from "./cases/GanttProvider.vue";
import GanttBatchProvider from "./cases/GanttBatchProvider.vue";
import GanttBackend from "./cases/GanttBackend.vue";
import GanttExcelImport from "./cases/GanttExcelImport.vue";
import GanttScales from "./cases/GanttScales.vue";
import GanttGrid from "./cases/GanttGrid.vue";
import GanttNoGrid from "./cases/GanttNoGrid.vue";
import GanttFlexColumns from "./cases/GanttFlexColumns.vue";
import GanttReadOnly from "./cases/GanttReadOnly.vue";
import GanttPreventActions from "./cases/GanttPreventActions.vue";
import GanttForm from "./cases/GanttForm.vue";
import GanttSizes from "./cases/GanttSizes.vue";
import GanttMultiple from "./cases/GanttMultiple.vue";
import GanttPerformance from "./cases/GanttPerformance.vue";
import GanttDisplayMode from "./cases/GanttDisplayMode.vue";

import Markers from "./cases/ProMarkers.vue";
import UnscheduledTasks from "./cases/ProUnscheduledTasks.vue";
import Baselines from "./cases/ProBaselines.vue";
import Rollups from "./cases/ProRollups.vue";
import CriticalPath from "./cases/ProCriticalPath.vue";
import AutoSchedule from "./cases/ProAutoSchedule.vue";
import Calendar from "./cases/ProCalendar.vue";
import MultipleCalendars from "./cases/ProMultipleCalendars.vue";
import ResourceCalendars from "./cases/ProResourceCalendars.vue";
import UndoRedo from "./cases/ProUndo.vue";
import UndoToolbar from "./cases/ProUndoToolbar.vue";
import SplitTasks from "./cases/ProSplitTasks.vue";
import ScheduleAll from "./cases/ProScheduleAll.vue";
import SummariesProgress from "./cases/ProSummariesProgress.vue";
import SummariesConvert from "./cases/ProSummariesConvert.vue";
import MSProject from "./cases/ProMSProject.vue";
import Export from "./cases/ProExport.vue";
import Slack from "./cases/ProSlack.vue";
import Resources from "./cases/ProResources.vue";
import Grouping from "./cases/ProGrouping.vue";
import ResourcesProvider from "./cases/ProResourcesProvider.vue";
import ResourceLoad from "./cases/ProResourceLoad.vue";
import WBS from "./cases/ProWBS.vue";

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
//import DropDownMenu from "./cases/DropDownMenu.vue";
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
	["/performance/:skin", "Performance", GanttPerformance, "GanttPerformance"],
	[
		"/schedule-all/:skin",
		"Scheduling: features",
		ScheduleAll,
		"ProScheduleAll",
		{ pro: true },
	],

	{ group: "Timeline" },
	["/sizes/:skin", "Scale / cell sizes", GanttSizes, "GanttSizes"],
	[
		"/cell-borders/:skin",
		"Chart cell borders",
		ChartCellBorders,
		"ChartBorders",
	],
	["/start-end/:skin", "Start/end dates", GanttStartEnd, "GanttStartEnd"],
	["/scroll-date/:skin", "Scroll to date", GanttScaleDate, "GanttScaleDate"],
	["/scales/:skin", "Custom scales", GanttScales, "GanttScales"],
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
	["/zoom/:skin", "Zoom", GanttZoom, "GanttZoom"],
	["/custom-zoom/:skin", "Custom Zoom", GanttCustomZoom, "GanttCustomZoom"],
	["/markers/:skin", "Markers", Markers, "ProMarkers", { pro: true }],
	["/holidays/:skin", "Holidays", GanttHolidays, "GanttHolidays"],

	{ group: "Grid" },
	[
		"/grid-fill-space-columns/:skin",
		"Flexible grid columns",
		GanttFlexColumns,
		"GanttFlexColumns",
	],
	[
		"/grid-custom-columns/:skin",
		"Custom column content",
		GanttGrid,
		"GanttGrid",
	],
	[
		"/display-mode/:skin",
		"Grid width and display",
		GanttDisplayMode,
		"GanttDisplayMode",
	],
	["/no-grid/:skin", "No grid", GanttNoGrid, "GanttNoGrid"],
	[
		"/header-menu/:skin",
		"Header menu to hide columns",
		HeaderMenu,
		"GridHeaderMenu",
	],

	{ group: "Tasks" },
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
	["/rollups/:skin", "Rollups", Rollups, "ProRollups", { pro: true }],
	["/templates/:skin", "Custom text", GanttText, "GanttText"],
	["/tooltips/:skin", "Tooltips", GanttTooltips, "GanttTooltips"],
	["/wbs/:skin", "WBS codes", WBS, "ProWBS", { pro: true }],

	{ group: "Data operations" },
	[
		"/prevent-actions/:skin",
		"Prevent default UI actions",
		GanttPreventActions,
		"GanttPreventActions",
	],
	[
		"/grid-inline-editors/:skin",
		"Edit tasks in grid",
		GridInlineEditors,
		"GridInlineEditors",
	],
	["/readonly/:skin", "Readonly", GanttReadOnly, "GanttReadOnly"],
	[
		"/filtering/:skin",
		"Filter tasks in grid",
		GanttFilterInline,
		"GanttFilterInline",
	],
	[
		"/filtering-api/:skin",
		"External filter controls",
		GanttFilter,
		"GanttFilter",
	],
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
	["/sorting/:skin", "External sort controls", GanttSort, "GanttSort"],
	["/sorting-api/:skin", "Sort by API", GanttCustomSort, "GanttCustomSort"],
	["/grouping/:skin", "Grouping", Grouping, "ProGrouping", { pro: true }],
	["/undo-redo/:skin", "Undo/redo", UndoRedo, "ProUndo", { pro: true }],
	[
		"/undo-toolbar/:skin",
		"Undo/redo with Toolbar",
		UndoToolbar,
		"ProUndoToolbar",
		{ pro: true },
	],

	{ group: "Scheduling" },
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
	["/baseline/:skin", "Baselines", Baselines, "ProBaselines", { pro: true }],
	[
		"/calendar/:skin",
		"Global calendar",
		Calendar,
		"ProCalendar",
		{ pro: true },
	],
	[
		"/multiple-calendars/:skin",
		"Task calendars",
		MultipleCalendars,
		"ProMultipleCalendars",
		{ pro: true },
	],

	{ group: "Resources" },
	[
		"/resources/:skin",
		"Resources",
		Resources,
		"ProResources",
		{ pro: true },
	],
	[
		"/resource-load/:skin",
		"Resource load",
		ResourceLoad,
		"ProResourceLoad",
		{ pro: true },
	],

	[
		"/resource-calendars/:skin",
		"Resource calendars",
		ResourceCalendars,
		"ProResourceCalendars",
		{ pro: true },
	],
	[
		"/resources-backend/:skin",
		"Resources backend",
		ResourcesProvider,
		"ProResourcesProvider",
		{ pro: true },
	],

	{ group: "Load & Save" },
	["/backend/:skin", "Load from backend", GanttBackend, "GanttBackend"],
	[
		"/backend-provider/:skin",
		"Save to backend",
		GanttProvider,
		"GanttProvider",
	],
	[
		"/backend-provider-batch/:skin",
		"Save to backend: batch request",
		GanttBatchProvider,
		"GanttBatchProvider",
	],
	[
		"/excel-import/:skin",
		"Import from Excel / CSV",
		GanttExcelImport,
		"GanttExcelImport",
	],
	[
		"/export/:skin",
		"Export data (server-side)",
		Export,
		"ProExport",
		{ pro: true },
	],
	[
		"/msp/:skin",
		"Import / export to MS Project (client-side)",
		MSProject,
		"ProMSProject",
		{ pro: true },
	],

	{ group: "UI / Layout" },
	["/toolbar/:skin", "Toolbar: basic", GanttToolbar, "GanttToolbar"],
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
	["/context-menu/:skin", "Context menu: basic", ContextMenu, "ContextMenu"],
	[
		"/menu-handler/:skin",
		"Context menu: limiting options",
		ContextMenuHandler,
		"ContextMenuHandler",
	],
	//["/outer-menu/:skin", "Dropdown menu", DropDownMenu, "DropDownMenu"],
	[
		"/menu-options/:skin",
		"Context menu: custom options",
		ContextMenuOptions,
		"ContextMenuOptions",
	],
	["/editor/:skin", "Editor: basic", GanttEditor, "GanttEditor"],
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
	["/custom-edit-form/:skin", "Custom edit dialog", GanttForm, "GanttForm"],

	{ group: "Appearance" },
	[
		"/gantt-multiple/:skin",
		"Many Gantts per page",
		GanttMultiple,
		"GanttMultiple",
	],
	["/fullscreen/:skin", "Fullscreen", GanttFullscreen, "GanttFullscreen"],
	["/locale/:skin", "Locales", GanttLocale, "GanttLocale"],
];
