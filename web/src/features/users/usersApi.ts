import { baseApi } from "@/lib/api/baseApi";

export interface User {
  id: string;
  name: string;
  role: string;
  company: string;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;