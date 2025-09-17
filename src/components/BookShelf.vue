<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import type { NovelData } from "../types";
import { GENRE, STATE } from "../constants";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useStorage } from "@vueuse/core";
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault();
const search = ref("");
const page = ref(0);
const total = ref(1);
const isEnabled = computed(() => !!search.value);
const storage = useStorage<{ ncode: string; last_update: string }[]>(
  "books",
  []
);
const ncodeStr = computed(
  () => storage.value.map(({ ncode }) => ncode).join("-") ?? ""
);

const { data } = useQuery({
  queryKey: ["search", search, page],
  queryFn: async () =>
    await fetch(
      `/novelapi?of=n-t-u-w-s-g-gl-e-ga&out=json&word=${
        search.value
      }&lim=5&st=${5 * page.value + 1}`
    )
      .then((res) => res.json())
      .then((res: Array<NovelData>) => {
        console.log(res);
        total.value = Math.min(Number(res[0]["allcount"]), 100);
        return res.slice(1, 6);
      })
      .catch((e) => {
        console.log(e);
        return null;
      }),
  enabled: isEnabled,
});

const { data: novel } = useQuery({
  queryKey: ["shelf", ncodeStr],
  queryFn: async () =>
    await fetch(`/novelapi?of=n-t-w-gl-ga-e&out=json&ncode=${ncodeStr.value}`)
      .then((res) => res.json())
      .then((res: Array<NovelData>) => {
        const [_first, ...rest] = res;
        return rest;
      })
      .catch((e) => {
        console.log(e);
        return null;
      }),
  enabled: computed(() => ncodeStr.value.length > 0),
});

const removeBook = (ncode: string) => {
  storage.value = storage.value.filter((v) => v.ncode !== ncode);
};

const resetBookShelf = () => {
  storage.value = [];
};

const addBook = (item: NovelData) => {
  const found = storage.value.find((v) => v.ncode === item.ncode);
  if (!found) {
    storage.value.push({
      ncode: item.ncode,
      last_update: item.general_lastup,
    });
  }
  return;
};
</script>

<template>
  <div class="flex flex-col p-2 gap-2">
    <div class="flex justify-end gap-2 w-full">
      <button class="bg-green-500 text-white font-bold p-2 rounded-lg">
        Import
      </button>
      <button
        class="bg-red-500 text-white rounded-lg p-2"
        @click="resetBookShelf"
      >
        Reset
      </button>
    </div>
    <div class="w-full">
      <InputText
        type="search"
        placeholder="Search"
        v-model="search"
        fluid
      ></InputText>
    </div>

    <div>
      <DataView dataKey="novel" :value="novel!" :layout="'grid'">
        <template #grid="slotProps">
          <div class="grid grid-cols-12 gap-4">
            <div
              v-for="(item, index) in slotProps.items"
              :key="index"
              @click="console.log(item.ncode)"
              class="grid col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-4 p-2"
            >
              <div class="grid gap-3 p-6 border rounded">
                <div class="font-bold text-lg">
                  <span>{{ item.title }}</span>
                </div>
                <div class="text-sm text-gray-400">
                  <span>{{ item.writer }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>{{ item.end ? "Serial" : "Completed" }} </span>
                  <span>Total Chapters: {{ item.general_all_no }}</span>
                </div>
                <div class="text-sm">
                  <span>Last updated: {{ item.general_lastup }}</span>
                </div>
                <div class="flex gap-2">
                  <a
                    class="bg-green-500 hover:bg-green-600 w-full max-h-10 p-2 rounded-lg text-white text-center"
                    :href="`https://ncode.syosetu.com/${item.ncode.toLowerCase()}/${
                      item.general_all_no
                    }/`"
                    target="_blank"
                  >
                    Last Chapter
                  </a>
                  <button
                    class="max-h-10 border border-red-500 p-2 rounded-lg text-red-500 hover:bg-red-100 hover:bg-opacity-10 aspect-ratio-1"
                    @click="removeBook(item.ncode)"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </div>

    <div>
      <DataView
        dataKey="ncode"
        :value="data!"
        paginator
        paginatorPosition="both"
        :rows="5"
        :totalRecords="total"
        @page="page = $event.page"
        lazy
      >
        <template #list="slotProps">
          <div class="flex flex-col gap-2">
            <div
              v-for="(item, idx) in (slotProps.items as NovelData[])"
              :key="idx"
            >
              <div class="flex border-gray border-b p-2 gap-1">
                <div class="flex flex-col gap-1 w-70%">
                  <span>Title: {{ item.title }}</span>
                  <span>Synopsis: {{ item.story }}</span>
                  <span
                    >Last update:
                    {{
                      dayjs
                        .tz(item.general_lastup, "Asia/Tokyo")
                        .tz(dayjs.tz.guess())
                        .toDate()
                    }}
                  </span>
                </div>
                <div
                  class="flex flex-col justify-between items-center w-30% p-2"
                >
                  <div class="flex flex-col gap-1">
                    <span>Author: {{ item.writer }}</span>
                    <span>Genre: {{ GENRE[item.genre] }}</span>
                    <span>Total Chapters: {{ item.general_all_no }}</span>
                    <span>{{ STATE[item.end] }}</span>
                  </div>
                  <div>
                    <button
                      class="bg-gray-700 hover:bg-gray-800 p-2 rounded-lg"
                      @click="addBook(item)"
                    >
                      Add to BookShelf
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </DataView>
    </div>
    <div></div>
  </div>
</template>
