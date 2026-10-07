<script setup>
defineOptions({ name: "GanttWidgetsTooltip" });

import { computed, inject } from "vue";
import { Tooltip } from "@svar-ui/vue-core";
import { dateToString, getID, locale, locateID } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/gantt-locales";
import { en as coreEn } from "@svar-ui/core-locales";
import {
	defaultConstraintTypes,
	resolveResourceHistogramBar,
	resolveSCurvePoint,
	toInclusiveTask,
} from "@svar-ui/gantt-store";

const props = defineProps({
	api: {},
	at: { default: "point" },
	overflow: { default: false },
	content: {},
	resolver: { type: Function },
});

const resolver = computed(() => props.resolver || defaultResolver);

const l = inject("wx-i18n", null) || locale({ ...en, ...coreEn });
const _ = l.getGroup("gantt");
const words = l.getRaw();
const dateFormat = dateToString(
	words.gantt?.dateFormat || words.formats?.dateFormat,
	words.calendar
);
const constraintLabels = Object.fromEntries(
	defaultConstraintTypes.map(t => [t.id, t.label])
);

// inclusiveEnd: an S-curve point is shown as the calendar day before it
function dayBefore(date) {
	const d = new Date(date);
	d.setDate(d.getDate() - 1);
	return d;
}

function isConstraintViolated(task) {
	return !!props.api.getState()._conflicts?.constraints?.has(task.id);
}

function constraintText(constraint) {
	if (!constraint?.type) return "";
	const label = _(constraintLabels[constraint.type] || constraint.type);
	return constraint.date ? `${label}: ${dateFormat(constraint.date)}` : label;
}

function defaultResolver(element, ev) {
	const api = props.api;
	if (!api) return null;

	// (1) Match against resource histogram bars
	const histogram = resolveResourceHistogramBar(api, ev.target);
	if (histogram) {
		if (props.content) return { api, data: { histogram } };
		return `${histogram.resource.name ?? ""}: ${histogram.hours}h / ${histogram.capacity}h`;
	}

	// (2) Match against constraint markers / grid constraint cells
	const constraintId = getID(element, "data-constraint-id");
	if (constraintId) {
		const task = api.getTask(constraintId);
		if (!task?.constraint) return null;
		if (props.content) {
			return {
				api,
				data: {
					constraint: task,
					violated: isConstraintViolated(task),
				},
			};
		}
		const constraint = api.getState().inclusiveEnd
			? toInclusiveTask(task, api.getTaskCalendar(task)).constraint
			: task.constraint;
		return constraintText(constraint) || null;
	}

	// (3) Match against tasks / segments
	const taskId = getID(element, "data-task-id");
	if (taskId) {
		const task = api.getTask(taskId);
		if (!task) return null;
		if (props.overflow) {
			const node = element.querySelector(".wx-content");
			if (node && node.scrollWidth <= node.clientWidth) return null;
		}
		const segmentIndex = locateID(ev.target, "data-segment");
		if (props.content) {
			return {
				api,
				data: {
					task,
					segmentIndex,
					violated: isConstraintViolated(task),
				},
			};
		}
		if (segmentIndex !== null) {
			return task.segments?.[segmentIndex]?.text ?? "";
		}
		return task.text ?? "";
	}

	// (4) Match against links
	const linkId = getID(element, "data-link-id");
	if (linkId) {
		const state = api.getState();
		const link = state.links.byId(linkId);
		if (!link) return null;
		if (props.content) {
			return { api, data: { link } };
		} else {
			return null;
		}
	}

	// (5) Match against rollups
	const rollupId = getID(element, "data-rollup-id");
	if (rollupId) {
		const task = api.getTask(rollupId);
		if (!task) return null;
		if (props.content) {
			return { api, data: { rollup: task } };
		} else {
			return task.text ?? "";
		}
	}

	// (6) Match against resources
	const resourceId = getID(element, "data-resource-id");
	if (resourceId) {
		const resource = api.getResource(resourceId);
		if (!resource) return null;
		if (props.content) {
			return {
				api,
				data: { resource },
			};
		} else {
			return resource.name ?? "";
		}
	}

	// (7) Match against s-curve points
	const sCurve = resolveSCurvePoint(api, ev.target);
	if (sCurve) {
		if (props.content) return { api, data: { sCurve } };
		const value = Math.round(sCurve.hovered.value);
		let date = sCurve.date;
		// a point inside a day (sub-day scale) is a moment, not an end
		if (
			api.getState().inclusiveEnd &&
			!date.getHours() &&
			!date.getMinutes()
		)
			date = dayBefore(date);
		return `${dateFormat(date)}: ${value}%`;
	}

	// (8) Match against deadlines
	const deadlineTaskId = getID(element, "data-deadline");
	if (deadlineTaskId) {
		const task = api.getTask(deadlineTaskId);
		if (!task) return null;
		if (props.content) return { api, data: { deadline: task } };
		const deadline = api.getState().inclusiveEnd
			? toInclusiveTask(task, api.getTaskCalendar(task)).deadline
			: task.deadline;
		return `${dateFormat(deadline)}`;
	}

	// (9) No match, continue
	return null;
}
</script>

<template>
	<Tooltip :at="at" :content="content" :resolver="resolver">
		<slot />
	</Tooltip>
</template>
