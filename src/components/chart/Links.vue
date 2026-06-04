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
	if (!css?.contains("wx-line-hitbox") && !css?.contains("wx-delete-button")) {
		props.onSelectLink(null);
	}
}
</script>

<template>
	<svg class="wx-links">
		<g
			v-for="link in $links"
			:key="link.id"
			:class="[
				'wx-line',
				{
					'wx-critical': $criticalPath && link.critical,
					'wx-line-selectable': !readonly,
				},
			]"
			:onclick="() => !readonly && onSelectLink(link.id)"
			:data-link-id="setID(link.id)"
		>
			<polyline class="wx-line-draw" :points="link.$p" />
			<polyline class="wx-line-hitbox" :points="link.$p" />
		</g>
		<g
			v-if="!readonly && selectedLink"
			v-click-outside="onClickOutside"
			class="wx-line wx-line-selected wx-line-selectable wx-delete-link"
			:data-link-id="setID(selectedLink.id)"
		>
			<polyline class="wx-line-draw" :points="selectedLink.$p" />
			<polyline class="wx-line-hitbox" :points="selectedLink.$p" />
		</g>
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
	pointer-events: none;
}

.wx-line > .wx-line-draw {
	pointer-events: none;
	stroke: var(--wx-gantt-link-color);
	stroke-width: 2;
	fill: transparent;
}

.wx-line > .wx-line-hitbox {
	pointer-events: stroke;
	stroke: transparent;
	stroke-width: 20;
	fill: transparent;
}

.wx-line-selectable:hover > .wx-line-draw {
	stroke: var(--wx-gantt-link-color-hovered);
}

.wx-line-selectable.wx-critical:hover > .wx-line-draw {
	stroke: var(--wx-gantt-link-critical-color-hovered);
}

.wx-line-selectable {
	cursor: pointer;
}

.wx-line.wx-line-selected > .wx-line-draw {
	stroke: var(--wx-color-danger);
}

.wx-critical > .wx-line-draw {
	stroke: var(--wx-gantt-link-critical-color);
}
</style>
