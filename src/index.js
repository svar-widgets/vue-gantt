import pkg from "../package.json";

import Gantt from "./components/Gantt.vue";
import Toolbar from "./components/Toolbar.vue";
import ContextMenu from "./components/ContextMenu.vue";
import Editor from "./components/Editor.vue";
import HeaderMenu from "./components/grid/HeaderMenu.vue";
import ResourceLoad from "./components/resource/ResourceLoad.vue";

import Tooltip from "./widgets/Tooltip.vue";

import Willow from "./themes/Willow.vue";
import WillowDark from "./themes/WillowDark.vue";

export {
	defaultEditorItems,
	defaultToolbarButtons,
	defaultMenuOptions,
	defaultColumns,
	getDefaultColumns,
	getResourceColumns,
	defaultTaskTypes,
	getEditorItems,
	getEditorButtons,
	getToolbarButtons,
	getMenuOptions,
	registerScaleUnit,
} from "@svar-ui/gantt-store";

export { registerEditorItem } from "@svar-ui/vue-editor";

const version = pkg.version;

export {
	Gantt,
	ContextMenu,
	HeaderMenu,
	Toolbar,
	Tooltip,
	Editor,
	ResourceLoad,
	Willow,
	WillowDark,
	version,
};
