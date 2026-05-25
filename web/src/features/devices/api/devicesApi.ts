import { baseApi } from "@/lib/api/baseApi";

import type { Device } from "../types/device";

export const devicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getDevices: builder.query<Device[], void>({
      query: () => "/devices",

      providesTags: ["Devices"],
    }),

  }),
});

export const {
  useGetDevicesQuery,
} = devicesApi;