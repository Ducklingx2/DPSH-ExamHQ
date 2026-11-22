
import { supabase } from "./supabase.js";

export async function api(path, options = {}) {
    const {
        data: { session }
    } = await supabase.auth.getSession();

    const headers = new Headers(options.headers || {});

    if (session?.access_token) {
        headers.set(
            "Authorization",
            `Bearer ${session.access_token}`
        );
    }

    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`/api${path}`, {
        ...options,
        headers
    });

    const text = await response.text();

    let result = {};

    try {
        result = text ? JSON.parse(text) : {};
    } catch {
        result = {
            error: "The server returned an invalid response."
        };
    }

    if (!response.ok) {
        throw new Error(
            result.error || `Request failed: ${response.status}`
        );
    }

    return result;
}

