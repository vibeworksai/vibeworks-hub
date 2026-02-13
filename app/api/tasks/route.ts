import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql, isDatabaseConfigured } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json({ tasks: [] });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const context = searchParams.get("context");
    const projectId = searchParams.get("project_id");
    const dealId = searchParams.get("deal_id");
    const nextActions = searchParams.get("next_actions") === "true";
    const today = searchParams.get("today") === "true";

    // Build query dynamically based on filters
    let query = `
      SELECT * FROM tasks 
      WHERE user_id = $1
    `;
    const params: any[] = [session.user.id];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (context) {
      query += ` AND context = $${paramIndex}`;
      params.push(context);
      paramIndex++;
    }

    if (projectId) {
      query += ` AND project_id = $${paramIndex}`;
      params.push(projectId);
      paramIndex++;
    }

    if (dealId) {
      query += ` AND deal_id = $${paramIndex}`;
      params.push(dealId);
      paramIndex++;
    }

    if (nextActions) {
      query += ` AND next_action = true`;
    }

    if (today) {
      query += ` AND (
        (due_date IS NOT NULL AND DATE(due_date) = CURRENT_DATE)
        OR (scheduled_date IS NOT NULL AND DATE(scheduled_date) = CURRENT_DATE)
        OR (status = 'next_actions' AND due_date IS NULL)
      )`;
    }

    query += ` ORDER BY 
      CASE 
        WHEN status = 'next_actions' THEN 1
        WHEN status = 'inbox' THEN 2
        WHEN status = 'waiting' THEN 3
        WHEN status = 'someday' THEN 4
        ELSE 5
      END,
      CASE priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
        ELSE 5
      END,
      created_at DESC
    `;

    const tasks = await sql.unsafe(query, params);

    // Parse numeric fields
    const parsedTasks = tasks.map((task: any) => ({
      ...task,
      time_estimate: task.time_estimate ? Number(task.time_estimate) : null,
    }));

    return NextResponse.json({ tasks: parsedTasks });
  } catch (error: any) {
    console.error("Tasks GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const task = {
      id: body.id || `task-${Date.now()}`,
      user_id: session.user.id,
      title: body.title,
      description: body.description || null,
      context: body.context || null,
      project_id: body.project_id || null,
      deal_id: body.deal_id || null,
      next_action: body.next_action || false,
      status: body.status || "inbox",
      priority: body.priority || null,
      energy_level: body.energy_level || null,
      time_estimate: body.time_estimate || null,
      due_date: body.due_date || null,
      scheduled_date: body.scheduled_date || null,
      created_by: body.created_by || session.user.username || "user",
      tags: body.tags || null,
    };

    // Validate required fields
    if (!task.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO tasks (
        id, user_id, title, description, context, project_id, deal_id,
        next_action, status, priority, energy_level, time_estimate,
        due_date, scheduled_date, created_by, tags, created_at, updated_at
      ) VALUES (
        ${task.id}, ${task.user_id}, ${task.title}, ${task.description},
        ${task.context}, ${task.project_id}, ${task.deal_id},
        ${task.next_action}, ${task.status}, ${task.priority},
        ${task.energy_level}, ${task.time_estimate}, ${task.due_date},
        ${task.scheduled_date}, ${task.created_by}, ${task.tags},
        NOW(), NOW()
      )
      RETURNING *
    `;

    // Log activity
    try {
      await sql`
        INSERT INTO activity_feed (id, username, action, target, timestamp)
        VALUES (
          ${`activity-${Date.now()}`},
          ${task.created_by},
          ${"created"},
          ${`task: ${task.title}`},
          NOW()
        )
      `;
    } catch (err) {
      // Activity feed might not exist, that's ok
      console.log("Activity feed not available");
    }

    return NextResponse.json({
      success: true,
      message: "Task created",
      data: result[0],
    });
  } catch (error: any) {
    console.error("Tasks POST error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Task ID required" },
        { status: 400 }
      );
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const params: any[] = [id, session.user.id];
    let paramIndex = 3;

    const allowedFields = [
      "title",
      "description",
      "context",
      "project_id",
      "deal_id",
      "next_action",
      "status",
      "priority",
      "energy_level",
      "time_estimate",
      "due_date",
      "scheduled_date",
      "completed_at",
      "tags",
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        params.push(updates[field]);
        paramIndex++;
      }
    }

    // Auto-set completed_at if status changed to completed
    if (updates.status === "completed" && !updates.completed_at) {
      updateFields.push(`completed_at = NOW()`);
    }

    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) {
      // Only updated_at, nothing to update
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE tasks 
      SET ${updateFields.join(", ")}
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await sql.unsafe(query, params);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Log activity
    try {
      await sql`
        INSERT INTO activity_feed (id, username, action, target, timestamp)
        VALUES (
          ${`activity-${Date.now()}`},
          ${session.user.username || "user"},
          ${"updated"},
          ${`task: ${result[0].title} → ${result[0].status}`},
          NOW()
        )
      `;
    } catch (err) {
      console.log("Activity feed not available");
    }

    return NextResponse.json({
      success: true,
      message: "Task updated",
      data: result[0],
    });
  } catch (error: any) {
    console.error("Tasks PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isDatabaseConfigured() || !sql) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Task ID required" },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM tasks 
      WHERE id = ${id} AND user_id = ${session.user.id}
      RETURNING title
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Log activity
    try {
      await sql`
        INSERT INTO activity_feed (id, username, action, target, timestamp)
        VALUES (
          ${`activity-${Date.now()}`},
          ${session.user.username || "user"},
          ${"deleted"},
          ${`task: ${result[0].title}`},
          NOW()
        )
      `;
    } catch (err) {
      console.log("Activity feed not available");
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted",
    });
  } catch (error: any) {
    console.error("Tasks DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
