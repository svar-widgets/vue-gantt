<script setup>
defineOptions({ name: "GanttWidgetsTooltip" });

import { computed } from "vue";
import { Tooltip } from "@svar-ui/vue-core";
import { getID, locateID } from "@svar-ui/lib-dom";

const props = defineProps({
	api: {},
	at: { default: "point" },
	overflow: { default: false },
	content: {},
	resolver: { type: Function },
});

const resolver = computed(() => props.resolver || defaultResolver);

function defaultResolver(element, ev) {
	if (!props.api) return null;

	// (1) Match against tasks / segments
	const taskId = getID(element, "data-task-id");
	if (taskId) {
		const task = props.api.getTask(taskId);
		if (!task) return null;
		if (props.overflow) {
			const node = element.querySelector(".wx-content");
			if (node && node.scrollWidth <= node.clientWidth) return null;
		}
		const segmentIndex = locateID(ev.target, "data-segment");
		if (props.content) {
			return { api: props.api, data: { task, segmentIndex } };
		} else {
			if (segmentIndex !== null) {
				return task.segments?.[segmentIndex]?.text ?? "";
			} else {
				return task.text ?? "";
			}
		}
	}

	// (2) Match against links
	const linkId = getID(element, "data-link-id");
	if (linkId) {
		const state = props.api.getState();
		const link = state.links.byId(linkId);
		if (!link) return null;
		if (props.content) {
			return { api: props.api, data: { link } };
		} else {
			return null;
		}
	}

	// (3) Match against rollups
	const rollupId = getID(element, "data-rollup-id");
	if (rollupId) {
		const task = props.api.getTask(rollupId);
		if (!task) return null;
		if (props.content) {
			return { api: props.api, data: { rollup: task } };
		} else {
			return task.text ?? "";
		}
	}

	// (4) Match against resources
	const resourceId = getID(element, "data-resource-id");
	if (resourceId) {
		const resource = props.api.getResource(resourceId);
		if (!resource) return null;
		if (props.content) {
			return {
				api: props.api,
				data: { resource },
			};
		} else {
			return resource.name ?? "";
		}
	}

	// (5) No match, continue
	return null;
}
</script>

<template>
	<Tooltip :at="at" :content="content" :resolver="resolver">
		<slot />
	</Tooltip>
</template>
