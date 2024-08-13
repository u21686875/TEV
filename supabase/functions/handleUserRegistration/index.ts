import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface UserCredentials {
    email: string;
    password?: string;
    create_at?: string;
}

interface ErrorResponse {
    error: string;
}

interface UserResponse {
    user: any;  // Ideally, replace `any` with a more specific type.
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key length:', supabaseKey?.length);

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Key is missing');
}


const supabase = createClient(supabaseUrl, supabaseKey);

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 20;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    console.log(`Received ${req.method} request to ${path}`);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    switch (true) {
        case req.method === 'POST' && path === '/api/user/register':
            return handleUserRegistration(req);
        case req.method === 'GET' && path === '/api/user/details':
            return getUserDetails(req);
        case req.method === 'PUT' && path === '/api/user/update':==
            return updateUserDetails(req);
        case req.method === 'DELETE' && path === '/api/user/delete':
            return deleteUserAccount(req);
        default:
            console.log('No matching route found');
            return createResponse<ErrorResponse>({ error: "Not Found" }, 404);
    }
}


async function getUserDetails(req: Request): Promise<Response> {
    try {
        const { user_id } = await req.json();

        if (!user_id) {
            return createResponse<ErrorResponse>({ error: "User ID is required" }, 400);
        }

        const { data, error } = await supabase
            .from('users')
            .select('id, email, created_at')
            .eq('id', user_id)
            .single();

        if (error) {
            return createResponse<ErrorResponse>({ error: error.message }, 400);
        }

        if (data) {
            return createResponse<UserResponse>({ user: data }, 200);
        } else {
            return createResponse<ErrorResponse>({ error: "User not found" }, 404);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
        return createResponse<ErrorResponse>({ error: error.message || "An unexpected error occurred" }, 500);
    }
}

async function updateUserDetails(req: Request): Promise<Response> {
    try {
        const { user_id, email, password } = await req.json();

        if (!user_id) {
            return createResponse<ErrorResponse>({ error: "User ID is required" }, 400);
        }

        let updateData: { email?: string } = {};
        
        if (email) {
            if (!validateEmail(email)) {
                return createResponse<ErrorResponse>({ error: "Invalid email format" }, 400);
            }
            updateData.email = email;
        }

        if (password) {
            if (!validatePassword(password)) {
                return createResponse<ErrorResponse>({ error: "Password does not meet complexity requirements" }, 400);
            }
            // For password update, we need to use the auth.updateUser method
            const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
                user_id,
                { password: password }
            );
            if (authError) {
                return createResponse<ErrorResponse>({ error: authError.message }, 400);
            }
        }

        if (Object.keys(updateData).length > 0) {
            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', user_id)
                .select('id, email, created_at')
                .single();

            if (error) {
                return createResponse<ErrorResponse>({ error: error.message }, 400);
            }

            if (data) {
                return createResponse<UserResponse>({ user: data }, 200);
            }
        }

        return createResponse<UserResponse>({ user: { id: user_id, ...(email && { email }) } }, 200);

    } catch (error) {
        console.error('Unexpected error:', error);
        return createResponse<ErrorResponse>({ error: error.message || "An unexpected error occurred" }, 500);
    }
}

async function deleteUserAccount(req: Request): Promise<Response> {
    try {
        const { user_id } = await req.json();

        if (!user_id) {
            return createResponse<ErrorResponse>({ error: "User ID is required" }, 400);
        }

        // Delete the user from auth
        const { error: authError } = await supabase.auth.admin.deleteUser(user_id);

        if (authError) {
            return createResponse<ErrorResponse>({ error: authError.message }, 400);
        }

        return createResponse({ message: "User account deleted successfully" }, 200);

    } catch (error) {
        console.error('Unexpected error:', error);
        return createResponse<ErrorResponse>({ error: error.message || "An unexpected error occurred" }, 500);
    }
}

async function handleUserRegistration(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("client-ip") || "unknown";
    
    if (await isRateLimited(clientIp)) {
        return createResponse<ErrorResponse>({ error: "Too many requests, please try again later" }, 429);
    }

    try {
        const { email, password }: UserCredentials = await req.json();

        if (!email || !password) {
            return createResponse<ErrorResponse>({ error: "Email and password are required" }, 400);
        }

        if (!validateEmail(email)) {
            return createResponse<ErrorResponse>({ error: "Invalid email format" }, 400);
        }

        if (!validatePassword(password)) {
            return createResponse<ErrorResponse>({ error: "Password does not meet complexity requirements" }, 400);
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('Supabase error:', error);
            return createResponse<ErrorResponse>({ error: error.message, details: error }, 400);
        }

        if (data && data.user) {
            return createResponse<UserResponse>({ user: data.user }, 200);
        } else {
            return createResponse<ErrorResponse>({ error: "No user data available" }, 404);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
        return createResponse<ErrorResponse>({ error: error.message || "An unexpected error occurred" }, 500);
    }
}

function createResponse<T>(body: T, status: number): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

function validateEmail(email: string): boolean {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function validatePassword(password: string): boolean {
    // This is a basic password validation. Adjust as needed.
    return password.length >= 8;
}

async function isRateLimited(clientIp: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('rate_limits')
        .select('count, timestamp')
        .eq('ip', clientIp)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error checking rate limit:', error);
        return false; // Assume not rate limited on error
    }

    const now = Date.now();
    if (data && (now - data.timestamp) < RATE_LIMIT_WINDOW_MS) {
        if (data.count >= RATE_LIMIT_MAX_REQUESTS) {
            return true;
        }
        await supabase
            .from('rate_limits')
            .update({ count: data.count + 1 })
            .eq('ip', clientIp);
    } else {
        await supabase
            .from('rate_limits')
            .upsert({ ip: clientIp, count: 1, timestamp: now }, { onConflict: 'ip' });
    }

    return false;
}

// Setting up the server to use the named function as the handler
// Deno.serve(handleUserRegistration);
Deno.serve(handleRequest);