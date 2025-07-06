import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at?: string;
  role?: 'admin' | 'staff' | 'user' | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get action from request body or URL params
    let action = 'list';
    let body = null;
    
    if (req.method === 'POST') {
      try {
        body = await req.json();
        action = body.action || 'list';
      } catch {
        // If no body, default to list
      }
    } else {
      const url = new URL(req.url);
      action = url.searchParams.get("action") || "list";
    }

    // Check if user is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user has admin role
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || userRole?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    if (action === 'list') {
      // Get all users from auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw authError;
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        throw rolesError;
      }

      // Combine users with their roles
      const usersWithRoles: UserWithRole[] = authUsers.users.map(authUser => {
        const roleData = userRoles?.find(r => r.user_id === authUser.id);
        return {
          id: authUser.id,
          email: authUser.email || 'Ingen email',
          created_at: authUser.created_at,
          email_confirmed_at: authUser.email_confirmed_at,
          role: roleData?.role || null
        };
      });

      return new Response(JSON.stringify({ users: usersWithRoles }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    if (action === 'delete-user') {
      let userId;
      
      if (body && body.userId) {
        userId = body.userId;
      } else {
        const url = new URL(req.url);
        userId = url.searchParams.get('userId');
      }
      
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    console.error("Error in admin-user-management function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);