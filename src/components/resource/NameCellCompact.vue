<script setup>
import { Avatar } from "@svar-ui/vue-core";

const props = defineProps({
	row: {},
	column: {},
});
</script>

<template>
	<div class="wx-content wx-compact" :data-tooltip="props.row.name">
		<div class="wx-name">
			<component
				v-if="props.column._cell"
				:is="props.column._cell"
				:row="props.row"
				:column="props.column"
			/>
			<div v-else-if="props.row.role" class="wx-avatar">
				<Avatar :value="props.row" :size="20" />
			</div>
			<template v-else>{{ props.row.name }}</template>
		</div>
	</div>
</template>

<style scoped>
.wx-content {
	width: 100%;
	white-space: nowrap;
	display: flex;
	align-items: center;
}

.wx-name {
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.wx-avatar {
	display: flex;
	align-items: center;
}
</style>
