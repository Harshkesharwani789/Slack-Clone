import { v } from "convex/values";
import { auth } from "./auth";
import { mutation, query } from "./_generated/server";
import { error } from "console";

const generateCode = () => {
  const code = Array.from(
    { length: 6 },
    () => "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
  ).join("");
  return code;
};

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    //Todo : create a proper method later
    const joinCode = generateCode();

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      userId,
      joinCode,
    });

    await ctx.db.insert("members", {
      userId,
      workspaceId,
      role: "admin",
    });

    return workspaceId;
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }
    const members = await ctx.db
      .query("members")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
    const workspaceIds = members.map((member) => member.workspaceId);

    const workspaces = [];

    for (const workspaceId of workspaceIds) {
      const workspace = await ctx.db.get(workspaceId);
      if (workspace) {
        workspaces.push(workspace);
      }
    }
    return workspaces;
  },
});

export const getById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    // Get the user ID from the context
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if the user is a member of the workspace
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();

    // If the user is not a member, return null
    if (!member) {
      return null;
    }

    // Retrieve and return the workspace by ID
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx,args)=>{
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if the user is a member of the workspace
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();
    
    if(!member || member.role !== "admin"){
      throw new Error("Unauthorized")
    }
    await ctx.db.patch(args.id, {
      name: args.name,
    })
    return args.id;
  },
});


export const remove = mutation({
  args: {
    id: v.id("workspaces"), 
  },
  handler: async (ctx,args)=>{
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if the user is a member of the workspace
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();
    
    if(!member || member.role !== "admin"){
      throw new Error("Unauthorized")
    }

    const [members] =  await Promise.all([
      ctx.db
        .query("members")
        .withIndex("by_workspace_id", (q)=> q.eq("workspaceId", args.id))
        .collect(),
    ]);

    for(const member of members){
      await ctx.db.delete(member._id)
    }



    await ctx.db.delete(args.id);
    return args.id;
  },
});