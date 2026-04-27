<script setup>
import { computed } from "vue";
import UserStub from "./UserStub.vue";
import { users } from "../data";

const props = defineProps({
	row: {},
});

const user = computed(() => users.find(u => u.id == props.row.assigned));
</script>

<template>
	<UserStub :user="user" />
</template>
