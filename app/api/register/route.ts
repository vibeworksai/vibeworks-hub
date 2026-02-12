import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import {
  validateUsername,
  validatePassword,
  validateEmail,
  validateFullName,
  validateInviteCode,
} from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, fullName, email, inviteCode } = body;

    // Validate required fields
    if (!username || !password || !fullName || !inviteCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate inputs
    const usernameError = validateUsername(username);
    if (usernameError) {
      return NextResponse.json({ error: usernameError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const fullNameError = validateFullName(fullName);
    if (fullNameError) {
      return NextResponse.json({ error: fullNameError }, { status: 400 });
    }

    const emailError = validateEmail(email || "");
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const inviteCodeError = validateInviteCode(inviteCode);
    if (inviteCodeError) {
      return NextResponse.json({ error: inviteCodeError }, { status: 400 });
    }

    if (!sql) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Validate invite code (case-insensitive)
    const invites = await sql`
      SELECT * FROM invites 
      WHERE UPPER(code) = UPPER(${inviteCode})
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (max_uses IS NULL OR current_uses < max_uses)
    `;

    if (invites.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired invite code" },
        { status: 400 }
      );
    }

    // Check if username already exists (case-insensitive)
    const existingUsers = await sql`
      SELECT id FROM users WHERE LOWER(username) = LOWER(${username})
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with minimal info (onboarding will complete the rest)
    const users = await sql`
      INSERT INTO users (
        username,
        password_hash,
        full_name,
        email,
        invite_code,
        birth_date,
        life_path_number,
        sun_sign,
        onboarding_complete
      ) VALUES (
        ${username},
        ${passwordHash},
        ${fullName},
        ${email || null},
        ${inviteCode},
        '2000-01-01',
        1,
        'Unknown',
        FALSE
      )
      RETURNING id, username, full_name
    `;

    const newUser = users[0];

    // Update invite usage
    await sql`
      UPDATE invites 
      SET 
        current_uses = current_uses + 1,
        used_by = ${newUser.id},
        used_at = NOW()
      WHERE code = ${inviteCode}
    `;

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.full_name,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
