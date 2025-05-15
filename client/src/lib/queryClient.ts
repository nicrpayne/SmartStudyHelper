import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Handle FormData objects separately to properly upload files
  const isFormData = data instanceof FormData;
  
  const res = await fetch(url, {
    method,
    // Don't set Content-Type header for FormData (browser will set it with boundary)
    headers: data && !isFormData ? { "Content-Type": "application/json" } : {},
    // Don't stringify FormData objects
    body: data 
      ? isFormData 
        ? data 
        : JSON.stringify(data) 
      : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle array query keys for URLs with parameters
    let url = queryKey[0] as string;
    
    // If queryKey has multiple segments and the second one is a string or number,
    // construct a path with it
    if (queryKey.length > 1 && queryKey[1] !== null && queryKey[1] !== undefined) {
      // For paths like /api/problems/1
      if (url.endsWith('/')) {
        url = `${url}${queryKey[1]}`;
      } else {
        url = `${url}/${queryKey[1]}`;
      }
    }
    
    console.log("Making fetch request to:", url);
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
