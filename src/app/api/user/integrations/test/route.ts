import { connectToDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { status: "unauthorized", message: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    await connectToDB();

    const user = await User.findOne({ id: userId });

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    console.log(
      `[TEST] User ${userId} integrations from DB:`,
      user.integrations
    );

    return NextResponse.json({
      status: "success",
      message: "Integrations fetched from database",
      data: {
        userId: user.id,
        integrations: user.integrations || [],
        totalIntegrations: user.integrations?.length || 0,
      },
    });
  } catch (error) {
    console.error("[INTEGRATION_TEST_ERROR]", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch integrations",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
