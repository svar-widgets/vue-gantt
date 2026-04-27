<script setup>
defineOptions({ name: "GanttChartLinks" });

import { inject } from "vue";
import { clickOutside, setID } from "@svar-ui/lib-dom";
import { subscribe, asDirective } from "@svar-ui/lib-vue";

const vClickOutside = asDirective(clickOutside);

const props = defineProps({
	onSelectLink: { type: Function },
	selectedLink: {},
	readonly: {},
});

const api = inject("gantt-store");

const { _links: links, criticalPath } = api.getReactiveState();
const $links = subscribe(links);
const $criticalPath = subscribe(criticalPath);

function onClickOutside(event) {
	const css = event?.target?.classList;
	if (!css?.contains("wx-line") && !css?.contains("wx-delete-button")) {
		props.onSelectLink(null);
	}
}
</script>

<template>
	<svg class="wx-links">
		<polyline
			v-for="link in $links"
			:key="link.id"
			:class="[
				'wx-line',
				{
					'wx-critical': $criticalPath && link.critical,
					'wx-line-selectable': !readonly,
				},
			]"
			:points="link.$p"
			:onclick="() => !readonly && onSelectLink(link.id)"
			:data-link-id="setID(link.id)"
		/>
		<polyline
			v-if="!readonly && selectedLink"
			class="wx-line wx-line-selected wx-line-selectable wx-delete-link"
			:points="selectedLink.$p"
			v-click-outside="onClickOutside"
		/>
	</svg>
</template>

<style scoped>
.wx-links {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.wx-line {
	user-select: auto;
	pointer-events: stroke;
	position: relative;
	stroke: var(--wx-gantt-link-color);
	stroke-width: 2;
	z-index: 0;
	fill: transparent;
}
.wx-line-selectable:hover {
	stroke: var(--wx-gantt-link-color-hovered);
}
.wx-line-selectable.wx-critical:hover {
	stroke: var(--wx-gantt-link-critical-color-hovered);
}
.wx-line-selectable {
	cursor: pointer;
}
.wx-line.wx-line-selected {
	stroke: var(--wx-color-danger);
}
.wx-critical {
	stroke: var(--wx-gantt-link-critical-color);
}
</style>
