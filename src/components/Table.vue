<template>
	<div class="universal-table">
		<div class="filters" v-if="filters && filters.length">
			<div v-for="filter in filters" :key="filter.key" class="filter">
				<label>
					<span class="filter-label">{{ filter.label || filter.key }}</span>

					<template v-if="filter.type === 'text'">
						<input
							type="text"
							v-model="filterValues[filter.key]"
							:placeholder="filter.placeholder"
						/>
					</template>

					<template v-else-if="filter.type === 'select'">
						<select v-model="filterValues[filter.key]">
							<option value="">Всі</option>
							<option
								v-for="opt in filter.options"
								:key="opt.value"
								:value="opt.value"
							>
								{{ opt.label }}
							</option>
						</select>
					</template>
				</label>
			</div>
		</div>

		<table ref="tableRef">
			<thead>
				<tr>
					<th
						v-for="col in columns"
						:key="col.key"
						@click="col.sortable && sortBy(col.key)"
						class="sortable"
					>
						{{ col.label }}
						<span v-if="sortKey === col.key">{{
							sortDir === 'asc' ? '↑' : '↓'
						}}</span>
					</th>
				</tr>
			</thead>

			<draggable
				v-if="draggable && sortedData.length"
				tag="tbody"
				:list="sortedData"
				item-key="id"
				@change="onTableChange"
			>
				<template #item="{ element }">
					<tr @click="$emit('row-click', element)" :data-id="element.id">
						<td v-for="col in columns" :key="col.key">
							{{ col.render ? col.render(element) : element[col.key] }}
						</td>
					</tr>
				</template>
			</draggable>

			<tbody v-else>
				<tr v-if="sortedData.length === 0">
					<td :colspan="columns.length" class="empty">Немає даних</td>
				</tr>
				<tr
					v-else
					v-for="row in sortedData"
					:key="row.id"
					@click="$emit('row-click', row)"
				>
					<td v-for="col in columns" :key="col.key">
						{{ col.render ? col.render(row) : row[col.key] }}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script setup lang="ts">
import { useColumnResize } from '@/composables/useColumnResize'
import { computed, onMounted, ref } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps<{
	columns: {
		key: string
		label: string
		sortable?: boolean
		render?: Function
	}[]
	data: any[]
	filters?: {
		label: string
		key: string
		type: string
		placeholder?: string
		options?: { value: string; label: string }[]
	}[]
	draggable?: boolean
}>()

const emit = defineEmits(['row-click', 'reorder'])
const tableRef = ref<HTMLTableElement | null>(null)
const { init } = useColumnResize()

onMounted(() => {
	if (tableRef.value) init(tableRef.value)
})

const filterValues = ref<{ [key: string]: string }>({})
props.filters?.forEach(f => (filterValues.value[f.key] = ''))

const sortKey = ref<string>(props.columns[0]?.key || '')
const sortDir = ref<'asc' | 'desc'>('asc')

function sortBy(key: string) {
	if (sortKey.value === key)
		sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
	else (sortKey.value = key), (sortDir.value = 'asc')
}

const filteredData = computed(() =>
	props.data.filter(row =>
		Object.keys(filterValues.value).every(key => {
			const val = filterValues.value[key]?.toLowerCase() || ''
			return !val || String(row[key]).toLowerCase().includes(val)
		})
	)
)

const sortedData = computed(() =>
	[...filteredData.value].sort((a, b) => {
		const va = a[sortKey.value],
			vb = b[sortKey.value]
		return va < vb
			? sortDir.value === 'asc'
				? -1
				: 1
			: va > vb
			? sortDir.value === 'asc'
				? 1
				: -1
			: 0
	})
)

function onTableChange(evt: any) {
	if (!props.draggable) return
	if (evt.moved || evt.added || evt.removed) {
		const ids = Array.from(
			(evt.to as HTMLElement).querySelectorAll('tr[data-id]')
		).map(el => el.getAttribute('data-id')!)
		emit('reorder', ids)
	}
}
</script>
