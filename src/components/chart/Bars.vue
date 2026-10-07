<script setup>
defineOptions({ name: "GanttChartBars" });

import { ref, computed, inject, watch, onMounted, onUnmounted } from "vue";

import { locate, locateID, getID, setID } from "@svar-ui/lib-dom";
import { subscribe } from "@svar-ui/lib-vue";
import Links from "./Links.vue";
import Rollups from "./Rollups.vue";
import BarSegments from "./BarSegments.vue";
import { Button } from "@svar-ui/vue-core";
import {
	isSegmentMoveAllowed,
	extendDragOptions,
	calcScaleCellDate,
	getDiffer,
} from "@svar-ui/gantt-store";
import { getUnitStart, getTaskAtRow } from "../../helpers/chart.js";

const props = defineProps({
	readonly: {},
	taskTemplate: {},
});

const _ = inject("wx-i18n").getGroup("gantt");
const api = inject("gantt-store");

const {
	_tasks: rTasks,
	_links: rLinks,
	area,
	_scales: scales,
	taskTypes,
	baselines,
	_selected: selected,
	rollups,
	_rollups: rRollups,
	focusTask,
	criticalPath,
	schedule,
	splitTasks,
	summary,
	slack,
	cellHeight,
	unscheduledTasks,
	inactiveTasks,
	deadlines,
	_conflicts: rConflicts,
	placeholderRow,
	durationUnit,
} = api.getReactiveState();

const _rTasks = subscribe(rTasks, true);
const _rLinks = subscribe(rLinks);
const _area = subscribe(area);
const _scales = subscribe(scales);
const _taskTypes = subscribe(taskTypes);
const _baselines = subscribe(baselines);
const _selected = subscribe(selected);
const _rollups = subscribe(rollups);
const _rRollups = subscribe(rRollups);
const _criticalPath = subscribe(criticalPath);
const _schedule = subscribe(schedule);
const _splitTasks = subscribe(splitTasks);
const _summary = subscribe(summary);
const _slack = subscribe(slack);
const _cellHeight = subscribe(cellHeight);
const _unscheduledTasks = subscribe(unscheduledTasks);
const _inactiveTasks = subscribe(inactiveTasks);
const _deadlines = subscribe(deadlines);
const _rConflicts = subscribe(rConflicts, true);
const _placeholderRow = subscribe(placeholderRow);
const _durationUnit = subscribe(durationUnit);

/** Hide constraint badge when it collides with the deadline marker. */
const CONSTRAINT_DEADLINE_COLLISION = 48;

const constraintViolated = computed(() => _rConflicts.value?.constraints);

function isConstraintCompact(task) {
	if (
		typeof task.$x_constraint !== "number" ||
		typeof task.$x_deadline !== "number"
	)
		return false;
	return (
		Math.abs(task.$x_constraint - task.$x_deadline) <
		CONSTRAINT_DEADLINE_COLLISION
	);
}

const tasks = computed(() =>
	_rTasks.value
		.slice(_area.value.start, _area.value.end)
		.map(a => ({ ...a }))
);

// grouping tasks by "resource" duplicates tasks
// to show a task for each assigned resource
const hasDuplicatedIds = computed(() =>
	tasks.value.some(task => task.$id && task.$id !== task.id)
);

const lengthUnitWidth = computed(() => _scales.value.lengthUnitWidth);
let ignoreNextClick = false;

// link creation
const linkFrom = ref(undefined);
let linkValidator = null;
// task moving
const taskMove = ref(null);
// task scheduling
const taskSchedule = ref(null);
let progressFrom = null;

const selectedLinkId = ref(null);
const selectedLink = computed(
	() =>
		selectedLinkId.value && {
			..._rLinks.value.find(link => link.id === selectedLinkId.value),
		}
);

const touched = ref(undefined);
let touchTimer;

const totalWidth = ref(0);
const container = ref(null);

function mousedown(e) {
	if (e.button !== 0) return;

	const node = locate(e);
	down(node, e);
}

function touchstart(e) {
	const node = locate(e);
	if (node) {
		touchTimer = setTimeout(() => {
			touched.value = true;
			down(node, e.touches[0]);
		}, 300);
	}
}

function getTaskAtY(
	clientY,
	rect = container.value.getBoundingClientRect()
) {
	return getTaskAtRow(_rTasks.value, clientY - rect.top, _cellHeight.value);
}

function canScheduleTask(task) {
	if (!task) return false;
	if (task.$placeholder) return _placeholderRow.value;
	return (
		_unscheduledTasks.value &&
		task.unscheduled &&
		(task.type === "task" || task.type === "milestone") &&
		!task.$group
	);
}

function isScheduleWorkingDay(task, left) {
	const date = calcScaleCellDate(left, api.getState());
	const calendar = api.getTaskCalendar(task);
	if (calendar) return calendar.isWorkingDay(date);

	return true;
}

function getUnitStartY(y) {
	return Math.trunc(y / _cellHeight.value) * _cellHeight.value;
}

function down(node, point) {
	const { clientX, clientY } = point;
	if (point.target.closest(".wx-delete-button")) return;
	if (!props.readonly) {
		if (!node && (_unscheduledTasks.value || _placeholderRow.value)) {
			const rowTask = getTaskAtY(clientY);
			const rect = container.value.getBoundingClientRect();
			const left = getUnitStart(
				clientX - rect.left,
				lengthUnitWidth.value
			);
			if (
				canScheduleTask(rowTask) &&
				isScheduleWorkingDay(rowTask, left)
			) {
				const isMilestone = rowTask && rowTask.type === "milestone";
				taskSchedule.value = {
					x: left,
					cx: left,
					left: isMilestone ? left - rowTask.$h / 2 : left,
					y: rowTask
						? rowTask.$y
						: getUnitStartY(clientY - rect.top) + 3,
					h: rowTask ? rowTask.$h : _cellHeight.value - 7,
					w: isMilestone ? rowTask.$h : lengthUnitWidth.value,
					task: rowTask,
					isMilestone,
				};
				startDrag();
				return;
			}
		}
		if (!node) return;

		const id = getID(node);
		const task = api.getTask(id);
		const css = point.target.classList;
		if (css.contains("wx-progress-marker")) {
			const { progress } = api.getTask(id);
			progressFrom = {
				id,
				x: clientX,
				progress,
				dx: 0,
				node,
				marker: point.target,
			};
			point.target.classList.add("wx-progress-in-drag");
		} else {
			const mode = getMoveMode(node, point, task) || "move";

			taskMove.value = {
				id,
				mode,
				x: clientX,
				dx: 0,
				l: task.$x,
				w: task.$w,
			};

			if (_splitTasks.value && task.segments?.length) {
				const segNode = locate(point, "data-segment");
				if (segNode) {
					taskMove.value.segmentIndex =
						segNode.dataset["segment"] * 1;
					extendDragOptions(task, taskMove.value);
				}
			}
		}
		startDrag();
	}
}

function getMoveMode(node, e, task) {
	if (e.target.classList.contains("wx-line")) return "";
	if (!task) task = api.getTask(getID(node));
	if (task.type === "milestone") return "";
	if (task.type === "summary" && !(_schedule.value?.auto && task.manual))
		return "";

	const segmentNode = locate(e, "data-segment");
	if (segmentNode) node = segmentNode;

	const { left, width } = node.getBoundingClientRect();
	const p = (e.clientX - left) / width;
	let delta = 0.2 / (width > 200 ? width / 200 : 1);
	if (p < delta) return "start";
	if (p > 1 - delta) return "end";
	return "";
}

function touchmove(e) {
	if (touched.value) {
		e.preventDefault();
		move(e, e.touches[0]);
	} else if (touchTimer) {
		clearTimeout(touchTimer);
		touchTimer = null;
	}
}

function mousemove(e) {
	move(e, e);
}

function move(e, point) {
	const { clientX, clientY } = point;

	if (!props.readonly) {
		if (progressFrom) {
			const { node, x, id } = progressFrom;
			const dx = (progressFrom.dx = clientX - x);

			const diff = Math.round((dx / node.offsetWidth) * 100);
			let progress = progressFrom.progress + diff;
			progressFrom.value = progress = Math.min(
				Math.max(0, progress),
				100
			);

			api.exec("update-task", {
				id,
				task: { progress },
				inProgress: true,
			});
		} else if (taskMove.value) {
			onSelectLink(null);
			const { mode, l, w, x, id, start, segment, index } =
				taskMove.value;
			const task = api.getTask(id);
			const dx = clientX - x;
			const minWidth = Math.round(lengthUnitWidth.value) || 1;
			if (
				(!start && Math.abs(dx) < 20) ||
				(mode === "start" && w - dx < minWidth) ||
				(mode === "end" && w + dx < minWidth) ||
				(mode === "move" &&
					((dx < 0 && l + dx < 0) ||
						(dx > 0 &&
							l + w + dx > totalWidth.value))) ||
				(taskMove.value.segment &&
					!isSegmentMoveAllowed(task, taskMove.value))
			)
				return;

			taskMove.value.dx = dx;

			let left, width;
			if (mode === "start") {
				left = l + dx;
				width = w - dx;
			} else if (mode === "end") {
				left = l;
				width = w + dx;
			} else if (mode === "move") {
				left = l + dx;
				width = w;
			}

			api.exec("drag-task", {
				id,
				width: width,
				left: left,
				inProgress: true,
				...(segment && { segmentIndex: index }),
			});

			//dnd may be blocked, check positions
			if (
				!taskMove.value.start &&
				((mode === "move" && task.$x === l) ||
					(mode !== "move" && task.$w === w))
			) {
				ignoreNextClick = true;
				return up();
			}
			taskMove.value.start = true;
		} else if (taskSchedule.value) {
			const { isMilestone, x, w, cx } = taskSchedule.value;
			const rect = container.value.getBoundingClientRect();
			const current = getUnitStart(
				clientX - rect.left,
				lengthUnitWidth.value
			);

			// same cell, do nothing
			if (current === cx) return;

			if (isMilestone) {
				taskSchedule.value = {
					...taskSchedule.value,
					cx: current,
					left: current - w / 2,
				};

				return;
			}

			taskSchedule.value = {
				...taskSchedule.value,
				cx: current,
				left: Math.min(current, x),
				w: Math.abs(current - x) + lengthUnitWidth.value,
			};
		} else {
			const taskNode = locate(e);
			if (taskNode) {
				const task = api.getTask(getID(taskNode));
				const segNode = locate(e, "data-segment");
				const barNode = segNode || taskNode;
				const mode = getMoveMode(barNode, point, task);
				barNode.style.cursor =
					mode && !props.readonly ? "col-resize" : "pointer";
			} else if (_unscheduledTasks.value || _placeholderRow.value) {
				const rowTask = getTaskAtY(clientY);
				const left = getUnitStart(
					clientX - container.value.getBoundingClientRect().left,
					lengthUnitWidth.value
				);
				container.value.style.cursor =
					canScheduleTask(rowTask) &&
					isScheduleWorkingDay(rowTask, left)
						? "crosshair"
						: "";
			}
		}
	}
}

function mouseup() {
	up();
}

function touchend() {
	touched.value = null;
	if (touchTimer) {
		clearTimeout(touchTimer);
		touchTimer = null;
	}

	up();
}

function up() {
	if (progressFrom) {
		const { dx, id, marker, value } = progressFrom;
		progressFrom = null;
		if (typeof value !== "undefined" && dx)
			api.exec("update-task", {
				id,
				task: { progress: value },
				inProgress: false,
			});
		marker.classList.remove("wx-progress-in-drag");

		ignoreNextClick = true;
		endDrag();
	} else if (taskMove.value) {
		const { id, mode, dx, l, w, start, segment, index } =
			taskMove.value;
		taskMove.value = null;
		if (start) {
			const diff = Math.round(dx / lengthUnitWidth.value);

			if (!diff) {
				// restore node and link position
				api.exec("drag-task", {
					id,
					width: w,
					left: l,
					inProgress: false,
					...(segment && { segmentIndex: index }),
				});
			} else {
				let update = {};
				let task = api.getTask(id);
				if (segment) task = task.segments[index];

				if (mode === "move") {
					update.start = task.start;
					update.end = task.end;
				} else update[mode] = task[mode];

				api.exec("update-task", {
					id,
					diff,
					task: update,
					...(segment && { segmentIndex: index }),
				});
			}
			ignoreNextClick = true;
		}

		endDrag();
	} else if (taskSchedule.value) {
		const { left, w, task, isMilestone } = taskSchedule.value;
		const state = api.getState();
		const start = calcScaleCellDate(
			isMilestone ? left + w / 2 : left,
			state
		);
		const end = calcScaleCellDate(left + w, state);
		const differ = getDiffer(_durationUnit.value, api.getCalendar());
		const dates = isMilestone
			? { start, duration: 0 }
			: { start, duration: Math.max(1, differ(end, start)) };
		if (task.$placeholder) {
			api.exec("add-task", {
				task: {
					...dates,
					text: _("New task"),
					type: "task",
					eventSource: "placeholder",
				},
			});
		} else api.exec("update-task", { id: task.id, task: dates });

		taskSchedule.value = null;
		ignoreNextClick = true;
		endDrag();
	}
}

function startDrag() {
	document.body.style.userSelect = "none";
	if (container.value) container.value.style.cursor = "";
}
function endDrag() {
	document.body.style.userSelect = "";
	if (container.value) container.value.style.cursor = "";
}

function onDblClick(e) {
	if (!props.readonly) {
		const id = locateID(e.target);
		if (id && !e.target.classList.contains("wx-link")) {
			const segmentIndex = locateID(e.target, "data-segment");
			api.exec("show-editor", {
				id,
				...(segmentIndex !== null && { segmentIndex }),
			});
		}
	}
}
function onClick(e) {
	if (ignoreNextClick) {
		ignoreNextClick = false;
		return;
	}

	const id = locateID(e.target);
	if (id) {
		const css = e.target.classList;
		if (css.contains("wx-link")) {
			const toStart = css.contains("wx-left");
			if (!linkFrom.value) {
				linkValidator = _schedule.value.auto
					? api.getLinkValidator()
					: null;
				linkFrom.value = { id, start: toStart };
				return;
			}

			if (isLinkTarget(id, toStart)) {
				api.exec("add-link", {
					link: {
						source: linkFrom.value.id,
						target: id,
						type: getLinkType(linkFrom.value.start, toStart),
					},
				});
			}
		} else if (css.contains("wx-delete-button-icon")) {
			api.exec("delete-link", { id: selectedLinkId.value });
			selectedLinkId.value = null;
		} else {
			const segmentIndex = locateID(e.target, "data-segment");
			api.exec("select-task", {
				id,
				toggle: e.ctrlKey || e.metaKey,
				range: e.shiftKey,
				...(segmentIndex !== null && { segmentIndex }),
			});
		}
	}
	removeLinkMarker();
}

function taskStyle(task) {
	return `left:${task.$x}px;top:${task.$y}px;width:${task.$w}px;height:${task.$h}px;line-height:${task.$h}px;`;
}

function baselineStyle(task) {
	return `left:${task.$x_base}px;top:${task.$y_base}px;width:${task.$w_base}px;height:${task.$h_base}px;`;
}

function slackStyle(task) {
	return `left:${task.$x_slack}px;top:${task.$y}px;width:${task.$w_slack}px;height:${task.$h}px;`;
}

function scheduleStyle(task) {
	return `left:${task.left}px;top:${task.y}px;width:${task.w}px;height:${task.h}px;`;
}

function deadlineStyle(task) {
	return `left:${task.$x_deadline}px;top:${task.$y}px;height:${task.$h}px;`;
}

function constraintStyle(task) {
	return `left:${task.$x_constraint}px;top:${task.$y - 2}px;height:${
		task.$h + 4
	}px;`;
}

// Arrow points into the open side. Floors open right, ceilings open left.
// Must-start / must-finish are pins and have no arrow. mso still keeps the badge on the left.
function isMustConstraint(type) {
	return type === "mso" || type === "mfo";
}

function constraintOpensRight(type) {
	return type === "snet" || type === "fnet" || type === "mso";
}

function contextmenu(ev) {
	if (touched.value || touchTimer) {
		ev.preventDefault();
		return false;
	}
}

const types = ["e2s", "s2s", "e2e", "s2e"];
function getLinkType(fromStart, toStart) {
	return types[(fromStart ? 1 : 0) + (toStart ? 0 : 2)];
}

const linkedFrom = computed(() => {
	if (!linkFrom.value) return null;
	const out = new Map();
	_rLinks.value.forEach(l => {
		if (l.source !== linkFrom.value.id) return;
		if (!out.has(l.target)) out.set(l.target, new Set());
		out.get(l.target).add(l.type);
	});
	return out;
});

function alreadyLinked(target, toStart) {
	if (target === linkFrom.value.id) return true;
	const type = getLinkType(linkFrom.value.start, toStart);
	return !!linkedFrom.value.get(target)?.has(type);
}

function removeLinkMarker() {
	if (linkFrom.value) {
		linkFrom.value = null;
		linkValidator = null;
	}
}

function onSelectLink(id) {
	selectedLinkId.value = id;
}

const taskTypeIds = computed(() => _taskTypes.value.map(t => t.id));
function taskTypeCss(type) {
	let css = taskTypeIds.value.includes(type) ? type : "task";
	if (!["task", "milestone", "summary"].includes(type)) {
		css = `task ${css}`;
	}
	return css;
}

function forward(ev) {
	api.exec(ev.action, ev.data);
}

// focus selected
const hasFocus = computed(
	() =>
		_selected.value.length &&
		container.value &&
		container.value.contains(document.activeElement)
);
const focused = computed(
	() => hasFocus.value && _selected.value[_selected.value.length - 1].id
);

const _focusTask = subscribe(focusTask);
watch(_focusTask, value => {
	if (value && (!value.section || value.section === "chart")) {
		const { id } = value;
		const node = container.value?.querySelector(
			`.wx-bar[data-id='${setID(id)}']`
		);
		if (node) node.focus();
	}
});

const isTaskCritical = task => {
	return _criticalPath.value && task.critical;
};

function isLinkTarget(id, atStart) {
	if (!linkFrom.value) return true;
	if (alreadyLinked(id, atStart)) return false;
	if (!linkValidator) return true;
	const type = getLinkType(linkFrom.value.start, atStart);
	return !linkValidator({ source: linkFrom.value.id, target: id, type });
}

// Track offsetWidth via ResizeObserver
let resizeObserver;
onMounted(() => {
	window.addEventListener("mouseup", mouseup);

	if (container.value) {
		totalWidth.value = container.value.offsetWidth;
		resizeObserver = new ResizeObserver(entries => {
			for (const entry of entries) {
				totalWidth.value = entry.target.offsetWidth;
			}
		});
		resizeObserver.observe(container.value);
	}
});

onUnmounted(() => {
	window.removeEventListener("mouseup", mouseup);
	resizeObserver?.disconnect();
});
</script>

<template>
	<div
		ref="container"
		class="wx-bars"
		:style="`line-height: ${tasks.length ? tasks[0].$h : 0}px`"
		@contextmenu="contextmenu"
		@mousedown="mousedown"
		@mousemove="mousemove"
		@touchstart="touchstart"
		@touchmove="touchmove"
		@touchend="touchend"
		@click="onClick"
		@dblclick="onDblClick"
		@dragstart.prevent
	>
		<template v-if="_slack">
			<template v-for="task in tasks" :key="task.id">
				<div
					v-if="task.$visibleSlack"
					:class="'wx-slack wx-slack-' + task.type"
					:style="slackStyle(task)"
				></div>
			</template>
		</template>
		<Links
			:onSelectLink="onSelectLink"
			:selectedLink="selectedLink"
			:readonly="props.readonly"
		/>
		<div
			v-if="taskSchedule"
			:class="[
				'wx-bar',
				'wx-' + (taskSchedule.task?.type || 'task'),
				'wx-schedule-task',
			]"
			:style="scheduleStyle(taskSchedule)"
		></div>
		<template v-for="task in tasks" :key="task.id">
			<div
				v-if="!task.$skip"
				:class="[
					'wx-bar',
					'wx-' + taskTypeCss(task.type),
					{
						'wx-touch':
							touched && taskMove && task.id === taskMove.id,
						'wx-selected':
							linkFrom && linkFrom.id === task.id,
						'wx-critical': isTaskCritical(task),
						'wx-reorder-task': task.$reorder,
						'wx-split': _splitTasks && task.segments,
						'wx-manual': _schedule?.auto && task.manual,
						'wx-inactive': _inactiveTasks && task.inactive,
						'wx-no-working-time': task.$noWorkingTime,
					},
				]"
				:style="taskStyle(task)"
				:data-id="setID(task.id)"
				:data-task-id="setID(task.id)"
				:tabindex="focused === task.id ? '0' : '-1'"
			>
				<template v-if="!props.readonly && !hasDuplicatedIds">
					<template
						v-if="
							task.id === selectedLink?.target &&
							selectedLink?.type[2] === 's'
						"
					>
						<Button
							type="danger"
							css="wx-left wx-delete-button wx-delete-link"
						>
							<i
								class="wxi-close wx-delete-button-icon"
							></i>
						</Button>
					</template>
					<template v-else>
						<div
							:class="[
								'wx-link',
								'wx-left',
								{
									'wx-visible': linkFrom,
									'wx-target': isLinkTarget(task.id, true),
									'wx-selected':
										linkFrom &&
										linkFrom.id === task.id &&
										linkFrom.start,
									'wx-critical': isTaskCritical(task),
								},
							]"
						>
							<div class="wx-inner"></div>
						</div>
					</template>
				</template>

				<template v-if="task.type !== 'milestone'">
					<div
						v-if="
							task.progress &&
							!(_splitTasks && task.segments)
						"
						class="wx-progress-wrapper"
					>
						<div
							class="wx-progress-percent"
							:style="'width:' + task.progress + '%'"
						></div>
					</div>
					<div
						v-if="
							!props.readonly &&
							!(_splitTasks && task.segments) &&
							!(
								task.type === 'summary' &&
								_summary?.autoProgress
							)
						"
						class="wx-progress-marker"
						:style="
							'left:calc(' +
							task.progress +
							'% - 10px);'
						"
					>
						{{ task.progress }}
					</div>
					<template v-if="props.taskTemplate">
						<component
							:is="props.taskTemplate"
							:data="task"
							:api="api"
							:onaction="forward"
						/>
					</template>
					<template
						v-else-if="_splitTasks && task.segments"
					>
						<BarSegments
							:task="task"
							:type="taskTypeCss(task.type)"
						/>
					</template>
					<template v-else>
						<div class="wx-content">
							{{ task.text || "" }}
						</div>
					</template>
				</template>
				<template v-else>
					<div class="wx-content"></div>
					<template v-if="props.taskTemplate">
						<component
							:is="props.taskTemplate"
							:data="task"
							:api="api"
							:onaction="forward"
						/>
					</template>
					<template v-else>
						<div class="wx-text-out">
							{{ task.text }}
						</div>
					</template>
				</template>

				<template v-if="!props.readonly && !hasDuplicatedIds">
					<template
						v-if="
							task.id === selectedLink?.target &&
							selectedLink?.type[2] === 'e'
						"
					>
						<Button
							type="danger"
							css="wx-right wx-delete-button wx-delete-link"
						>
							<i
								class="wxi-close wx-delete-button-icon"
							></i>
						</Button>
					</template>
					<template v-else>
						<div
							:class="[
								'wx-link',
								'wx-right',
								{
									'wx-visible': linkFrom,
									'wx-target': isLinkTarget(task.id, false),
									'wx-selected':
										linkFrom &&
										linkFrom.id === task.id &&
										!linkFrom.start,
									'wx-critical': isTaskCritical(task),
								},
							]"
						>
							<div class="wx-inner"></div>
						</div>
					</template>
				</template>
			</div>
			<template v-if="_rollups && _rRollups?.[task.id]">
				<Rollups
					v-for="rollup in _rRollups[task.id]"
					:key="rollup.id"
					:rollup="rollup"
					:parent="task"
				/>
			</template>
			<template v-if="_baselines && !task.$skip_baseline">
				<div
					:class="[
						'wx-baseline',
						{ 'wx-milestone': task.type === 'milestone' },
					]"
					:style="baselineStyle(task)"
				></div>
			</template>
			<div
				v-if="
					_deadlines &&
					task.deadline &&
					typeof task.$x_deadline === 'number'
				"
				:class="['wx-deadline', { 'wx-overdue': task.$overdue }]"
				:style="deadlineStyle(task)"
			>
				<i class="wxi-flag" :data-deadline="task.id"></i>
			</div>
			<div
				v-if="task.constraint && typeof task.$x_constraint === 'number'"
				:class="[
					'wx-constraint',
					'wx-constraint-' + task.constraint.type,
					{
						'wx-start': constraintOpensRight(task.constraint.type),
						'wx-end': !constraintOpensRight(task.constraint.type),
						'wx-violated': constraintViolated?.has(
							task.$id || task.id
						),
						'wx-compact': isConstraintCompact(task),
					},
				]"
				:style="constraintStyle(task)"
				:data-constraint-id="setID(task.id)"
			>
				<span class="wx-constraint-badge">{{
					task.constraint.type.toUpperCase()
				}}</span>
				<span class="wx-constraint-line"></span>
				<span
					v-if="!isMustConstraint(task.constraint.type)"
					class="wx-constraint-arrow"
					aria-hidden="true"
				></span>
			</div>
		</template>
	</div>
</template>

<style scoped>
.wx-baseline {
	position: absolute;
	background-color: #a883e4;
	border-radius: var(--wx-gantt-baseline-border-radius);
	z-index: 1;
}

.wx-deadline {
	position: absolute;
	display: flex;
	font-size: 20px;
	translate: -5px 0;
	z-index: 2;
	color: var(--wx-gantt-deadline-color, #9fa1ae);
}
.wx-deadline.wx-overdue {
	color: var(--wx-gantt-deadline-overdue-color, #fe6158);
}
.wx-deadline > i {
	height: 20px;
	cursor: pointer;
}

.wx-constraint {
	position: absolute;
	width: 0;
	z-index: 2;
	/* Pin sits on the bar edge; let resize and move reach the task. */
	pointer-events: none;
	--wx-constraint-pin-color: var(--wx-gantt-icon-color);
}
.wx-constraint-line,
.wx-constraint-arrow {
	pointer-events: none;
}
.wx-constraint.wx-violated {
	--wx-constraint-pin-color: var(--wx-gantt-constraint-violation-color);
}
.wx-constraint-line {
	position: absolute;
	left: 0;
	top: 1px;
	bottom: 1px;
	width: 2px;
	translate: -50% 0;
	border-radius: 2px;
	background: var(--wx-constraint-pin-color);
}
.wx-constraint-arrow {
	position: absolute;
	top: 50%;
	width: 6px;
	height: 12px;
	margin-top: -6px;
	background: var(--wx-constraint-pin-color);
	--wx-constraint-arrow-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 12'%3E%3Cpath fill='%23000' d='M0 0.8Q0 0 1 0.3L5.2 5.1Q6 6 5.2 6.9L1 11.7Q0 12 0 11.2Z'/%3E%3C/svg%3E");
	-webkit-mask: var(--wx-constraint-arrow-mask) center / 100% 100% no-repeat;
	mask: var(--wx-constraint-arrow-mask) center / 100% 100% no-repeat;
}
/* 1px (half of 2px line) + 2px gap */
.wx-constraint.wx-start .wx-constraint-arrow {
	left: calc(50% + 3px);
}
.wx-constraint.wx-end .wx-constraint-arrow {
	right: calc(50% + 3px);
	transform: scaleX(-1);
}
.wx-constraint-badge {
	position: absolute;
	top: 1px;
	height: 14px;
	box-sizing: border-box;
	display: inline-flex;
	align-items: center;
	font-size: 8px;
	font-weight: 600;
	letter-spacing: 0.02em;
	line-height: 1;
	padding: 2px;
	border-radius: 2px;
	background: var(--wx-background-alt);
	white-space: nowrap;
	pointer-events: auto;
}
.wx-constraint.wx-start .wx-constraint-badge {
	right: calc(50% + 3px);
}
.wx-constraint.wx-end .wx-constraint-badge {
	left: calc(50% + 3px);
}
.wx-constraint.wx-violated .wx-constraint-badge {
	background: var(--wx-gantt-constraint-violated-badge-bg);
}
.wx-constraint.wx-compact .wx-constraint-badge {
	display: none;
}
/* Line is the only visible target once the badge is hidden. */
.wx-constraint.wx-compact .wx-constraint-line {
	pointer-events: auto;
}
.wx-constraint.wx-compact:hover .wx-constraint-badge {
	display: inline-flex;
}

.wx-baseline.wx-milestone {
	transform: rotate(45deg) scale(0.75);
	border-radius: var(--wx-gantt-milestone-border-radius);
}
.wx-bars {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.wx-bar,
.wx-bar :deep(.wx-segment) {
	pointer-events: all;
	box-sizing: border-box;
	position: absolute;
	border-radius: var(--wx-gantt-bar-border-radius);
	font: var(--wx-gantt-bar-font);
	white-space: nowrap;
	line-height: inherit;
	text-align: center;
	cursor: pointer;

	-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

.wx-bar.wx-touch {
	opacity: 0.5;
}

.wx-bar.wx-reorder-task {
	z-index: 3;
}

.wx-bar.wx-schedule-task {
	pointer-events: none;
	z-index: 2;
	opacity: 0.5;
}
.wx-bar :deep(.wx-content) {
	overflow: hidden;
	text-overflow: ellipsis;
}
.wx-task:not(.wx-split),
.wx-task :deep(.wx-segment) {
	color: var(--wx-gantt-task-font-color);
	background-color: var(--wx-gantt-task-color);
	border: var(--wx-gantt-task-border);
}

.wx-task.wx-selected:not(.wx-split) {
	border: 1px solid var(--wx-gantt-task-border-color);
	box-shadow: var(--wx-gantt-bar-shadow);
}

.wx-task:not(.wx-split):hover,
.wx-task :deep(.wx-segment:hover) {
	box-shadow: var(--wx-gantt-bar-shadow);
}

.wx-summary {
	color: var(--wx-gantt-summary-font-color);
	background-color: var(--wx-gantt-summary-color);
	border: var(--wx-gantt-summary-border);
}

.wx-summary.wx-selected {
	border: 1px solid var(--wx-gantt-summary-border-color);
	box-shadow: var(--wx-gantt-bar-shadow);
}

.wx-summary:hover {
	box-shadow: var(--wx-gantt-bar-shadow);
}

.wx-milestone .wx-content {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 2;
}

.wx-bar:not(.wx-milestone) :deep(.wx-content) {
	position: relative;
	z-index: 2;
}

.wx-bars :deep(.wx-text-out) {
	position: absolute;
	line-height: normal;
	display: block;
	color: var(--wx-color-font);
	pointer-events: none;
}

.wx-milestone {
	border-color: var(--wx-gantt-milestone-color);
}

.wx-milestone :deep(.wx-text-out) {
	padding: 0 2px;
	left: 100%;
}

.wx-milestone .wx-content,
.wx-milestone.wx-schedule-task {
	height: 100%;
	background-color: var(--wx-gantt-milestone-color);
	transform: rotate(45deg) scale(0.75);
	border-radius: var(--wx-gantt-milestone-border-radius);
}

.wx-bar :deep(.wx-progress-wrapper) {
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: transparent;
	border-radius: var(--wx-gantt-bar-border-radius);
	overflow: hidden;
}

.wx-bar :deep(.wx-progress-percent) {
	height: 100%;
}

.wx-progress-marker {
	opacity: 0;
	position: absolute;
	top: 80%;
	width: var(--wx-icon-size);
	height: var(--wx-gantt-progress-marker-height);
	background: var(--wx-gantt-progress-border-color);
	clip-path: polygon(50% 0, 100% 30%, 100% 100%, 0 100%, 0 30%);
	color: var(--wx-color-font);
	z-index: 5;
	font-size: calc(var(--wx-font-size-sm) - 2px);
	border-radius: 4px;
	cursor: ew-resize;
	text-align: center;
	line-height: 3;
}
.wx-progress-marker::before {
	content: "";
	display: block;
	position: absolute;
	width: calc(var(--wx-icon-size) - 2px);
	height: calc(var(--wx-gantt-progress-marker-height) - 2px);
	clip-path: polygon(50% 0, 100% 30%, 100% 100%, 0 100%, 0 30%);
	top: 1px;
	left: 1px;
	background: var(--wx-gantt-link-marker-background);
	z-index: -1;
	border-radius: 4px;
}
.wx-bar:hover .wx-progress-marker,
.wx-progress-marker.wx-progress-in-drag {
	opacity: 1;
}

.wx-task .wx-progress-percent {
	background-color: var(--wx-gantt-task-fill-color);
}

.wx-summary .wx-progress-percent {
	background-color: var(--wx-gantt-summary-fill-color);
}

.wx-link {
	position: absolute;
	z-index: 4;
	top: 50%;
	transform: translateY(-50%);
	width: 16px;
	height: 16px;
	border-radius: 50%;
	border: 1px solid var(--wx-gantt-link-marker-color);
	background-color: var(--wx-gantt-link-marker-background);
	opacity: 0;
	cursor: default;
}

.wx-link .wx-inner {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 8px;
	height: 8px;
	border-radius: 50%;
	border: 4px solid var(--wx-gantt-link-marker-color);
	pointer-events: none;
}

.wx-bar :deep(button.wx-button.wx-delete-button) {
	position: absolute;
	z-index: 4;
	top: 50%;
	transform: translateY(-50%);
	width: 16px;
	height: 16px;
	padding: 0;
}
.wx-delete-button-icon {
	display: block;
	line-height: 14px;
	font-size: 10px;
}
.wx-bar :deep(.wx-delete-button.wx-left),
.wx-link.wx-left {
	left: -16px;
}
.wx-bar :deep(.wx-delete-button.wx-right),
.wx-link.wx-right {
	right: -16px;
}
.wx-link.wx-target:hover,
.wx-link.wx-selected,
.wx-bar:hover .wx-link.wx-target,
.wx-link.wx-visible.wx-target {
	opacity: 1;
	cursor: pointer;
}

.wx-bar:not(.wx-split) .wx-link.wx-selected {
	border-color: inherit;
}
.wx-bar:not(.wx-split) .wx-link.wx-selected .wx-inner {
	border-color: inherit;
}

.wx-milestone .wx-link.wx-left {
	left: -16px;
}
.wx-milestone .wx-link.wx-right {
	right: -16px;
}

.wx-cut {
	opacity: 50%;
}
.wx-bar.wx-manual:not(.wx-milestone):not(.wx-split):not(:focus),
.wx-bar.wx-manual.wx-split :deep(.wx-segment) {
	outline: 1px solid var(--wx-gantt-manual-border-color);
	outline-offset: 1px;
}
.wx-milestone.wx-manual .wx-content {
	outline: 1px solid var(--wx-gantt-manual-border-color);
	outline-offset: 1.6px;
}
.wx-bar:not(.wx-milestone):focus {
	outline: 1px solid var(--wx-color-primary);
	outline-offset: 1px;
}
.wx-milestone:focus {
	outline: none;
}
.wx-milestone:focus .wx-content {
	outline: 1px solid var(--wx-color-primary);
	outline-offset: 1.6px;
}
/* critical path markers */
.wx-task.wx-critical {
	background-color: var(--wx-gantt-task-critical-color);
}
.wx-task.wx-critical.wx-selected {
	border: 1px solid var(--wx-gantt-task-critical-color);
}
.wx-task.wx-critical .wx-progress-percent {
	background-color: var(--wx-gantt-task-critical-fill-color);
}
.wx-milestone.wx-critical .wx-content {
	background-color: var(--wx-gantt-critical-color);
}
.wx-milestone.wx-critical {
	border-color: var(--wx-gantt-critical-color);
}
.wx-summary.wx-critical {
	background-color: var(--wx-gantt-summary-critical-color);
}
.wx-summary.wx-critical .wx-progress-percent {
	background-color: var(--wx-gantt-summary-critical-fill-color);
}
.wx-summary.wx-critical.wx-selected {
	border: 1px solid var(--wx-gantt-summary-critical-color);
}

/*split tasks*/
.wx-split.wx-selected {
	border-color: var(--wx-gantt-task-border-color);
}
.wx-bars .wx-split.wx-bar {
	background: transparent;
	border-color: transparent;
}
.wx-split .wx-link.wx-selected,
.wx-split .wx-link.wx-selected .wx-inner {
	border-color: var(--wx-gantt-task-border-color);
}

.wx-critical :deep(.wx-segment) {
	background-color: var(--wx-gantt-task-critical-color);
}
.wx-critical.wx-selected :deep(.wx-segment) {
	border: 1px solid var(--wx-gantt-task-critical-color);
}
.wx-critical :deep(.wx-segment .wx-progress-percent) {
	background-color: var(--wx-gantt-task-critical-fill-color);
}
.wx-critical.wx-split .wx-link.wx-selected,
.wx-critical.wx-split .wx-link.wx-selected .wx-inner {
	border-color: var(--wx-gantt-task-critical-color);
}

.wx-task.wx-inactive:not(.wx-split),
.wx-summary.wx-inactive,
.wx-task :deep(.wx-segment.wx-inactive) {
	background-color: var(--wx-gantt-inactive-color);
}
.wx-milestone.wx-inactive .wx-content,
.wx-milestone.wx-inactive.wx-schedule-task {
	background-color: var(--wx-gantt-inactive-color);
}
.wx-milestone.wx-inactive {
	border-color: var(--wx-gantt-inactive-color);
}
.wx-task.wx-inactive .wx-progress-percent,
.wx-summary.wx-inactive .wx-progress-percent,
.wx-inactive :deep(.wx-segment .wx-progress-percent) {
	background-color: var(--wx-gantt-inactive-fill-color);
}

/* on the bar itself, so segments, the milestone shape and the fill go with it */
.wx-no-working-time {
	opacity: var(--wx-gantt-no-working-time-opacity, 0.45);
}

.wx-slack {
	box-sizing: border-box;
	position: absolute;
	border-radius: var(--wx-gantt-bar-border-radius);
	border-bottom-left-radius: 0;
	border-top-left-radius: 0;
}
.wx-slack-task {
	border: 1px solid var(--wx-gantt-task-slack-border-color);
	background: repeating-linear-gradient(
		-60deg,
		var(--wx-gantt-task-slack-border-color),
		var(--wx-gantt-task-slack-border-color) 1px,
		var(--wx-gantt-task-slack-color) 1px,
		var(--wx-gantt-task-slack-color) 8px
	);
}
</style>
