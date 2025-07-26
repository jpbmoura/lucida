import { connectToDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { status: "unauthorized", message: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { integrationName, isActive } = body;

    if (!integrationName || typeof isActive !== "boolean") {
      return NextResponse.json(
        {
          status: "error",
          message: "Integration name and isActive status are required",
        },
        { status: 400 }
      );
    }

    await connectToDB();

    let user = await User.findOne({ id: userId });

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    // Initialize integrations array if it doesn't exist (for existing users)
    if (!user.integrations) {
      user.integrations = [];
      user.markModified("integrations");
      await user.save();
      console.log(
        `[INTEGRATION_PATCH] Initialized integrations array for user ${userId}`
      );
    }

    // Find the integration to update
    const integrationIndex = user.integrations?.findIndex(
      (integration: any) => integration.name === integrationName
    );

    if (integrationIndex === -1 || integrationIndex === undefined) {
      return NextResponse.json(
        { status: "error", message: "Integration not found" },
        { status: 404 }
      );
    }

    // Update the integration status
    user.integrations[integrationIndex].isActive = isActive;

    // Mark the integrations array as modified so Mongoose saves it
    user.markModified("integrations");

    console.log(
      `[INTEGRATION_PATCH] Updating integration ${integrationName} status to ${isActive} for user ${userId}`
    );
    console.log(
      `[INTEGRATION_PATCH] Integration before save:`,
      user.integrations[integrationIndex]
    );

    try {
      const savedUser = await user.save();
      console.log(
        `[INTEGRATION_PATCH] Successfully saved integration ${integrationName} status`
      );
      console.log(
        `[INTEGRATION_PATCH] Integration after save:`,
        savedUser.integrations[integrationIndex]
      );
    } catch (saveError) {
      console.error(
        `[INTEGRATION_PATCH] Save error for ${integrationName}:`,
        saveError
      );
      throw saveError;
    }

    return NextResponse.json({
      status: "success",
      message: `Integration ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      data: {
        integration: user.integrations[integrationIndex],
      },
    });
  } catch (error) {
    console.error("[INTEGRATION_UPDATE_ERROR]", error);
    return NextResponse.json(
      { status: "error", message: "Failed to update integration" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { status: "unauthorized", message: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { integrationName, apiKey, isActive } = body;

    if (!integrationName || !apiKey || typeof isActive !== "boolean") {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Integration name, API key, and isActive status are required",
        },
        { status: 400 }
      );
    }

    await connectToDB();

    let user = await User.findOne({ id: userId });

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    // Initialize integrations array if it doesn't exist (for existing users)
    if (!user.integrations) {
      user.integrations = [];
      user.markModified("integrations");
      await user.save();
      console.log(
        `[INTEGRATION_PUT] Initialized integrations array for user ${userId}`
      );
    }

    // Find the integration to update
    const integrationIndex = user.integrations?.findIndex(
      (integration: any) => integration.name === integrationName
    );

    if (integrationIndex === -1 || integrationIndex === undefined) {
      return NextResponse.json(
        { status: "error", message: "Integration not found" },
        { status: 404 }
      );
    }

    // Update the integration with new data
    user.integrations[integrationIndex].apiKey = apiKey;
    user.integrations[integrationIndex].isActive = isActive;

    // Mark the integrations array as modified so Mongoose saves it
    user.markModified("integrations");

    console.log(
      `[INTEGRATION_PUT] Updating integration ${integrationName} for user ${userId}`
    );
    console.log(
      `[INTEGRATION_PUT] Integration data before save:`,
      user.integrations[integrationIndex]
    );

    try {
      const savedUser = await user.save();
      console.log(
        `[INTEGRATION_PUT] Successfully saved integration ${integrationName}`
      );
      console.log(
        `[INTEGRATION_PUT] Integration data after save:`,
        savedUser.integrations[integrationIndex]
      );
    } catch (saveError) {
      console.error(
        `[INTEGRATION_PUT] Save error for ${integrationName}:`,
        saveError
      );
      throw saveError;
    }

    return NextResponse.json({
      status: "success",
      message: "Integration updated successfully",
      data: {
        integration: user.integrations[integrationIndex],
      },
    });
  } catch (error) {
    console.error("[INTEGRATION_PUT_ERROR]", error);
    return NextResponse.json(
      { status: "error", message: "Failed to update integration" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { status: "unauthorized", message: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, apiKey, isActive = false } = body;

    if (!name || !apiKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "Integration name and API key are required",
        },
        { status: 400 }
      );
    }

    await connectToDB();

    let user = await User.findOne({ id: userId });

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    // Initialize integrations array if it doesn't exist (for existing users)
    if (!user.integrations) {
      user.integrations = [];
      user.markModified("integrations");
      await user.save();
      console.log(
        `[INTEGRATION_POST] Initialized integrations array for user ${userId}`
      );
    }

    // Check if integration already exists
    const existingIntegration = user.integrations?.find(
      (integration: any) => integration.name === name
    );

    if (existingIntegration) {
      return NextResponse.json(
        { status: "error", message: "Integration already exists" },
        { status: 409 }
      );
    }

    // Add new integration
    if (!user.integrations) {
      user.integrations = [];
    }

    const newIntegration = {
      name,
      apiKey,
      isActive,
    };

    user.integrations.push(newIntegration);

    // Mark the integrations array as modified so Mongoose saves it
    user.markModified("integrations");

    console.log(
      `[INTEGRATION_POST] Creating new integration ${name} for user ${userId}`
    );
    console.log(`[INTEGRATION_POST] New integration data:`, newIntegration);
    console.log(
      `[INTEGRATION_POST] Total integrations before save:`,
      user.integrations.length
    );

    try {
      const savedUser = await user.save();
      console.log(
        `[INTEGRATION_POST] Successfully saved new integration ${name}`
      );
      console.log(
        `[INTEGRATION_POST] Total integrations after save:`,
        savedUser.integrations.length
      );
      console.log(
        `[INTEGRATION_POST] Saved integration:`,
        savedUser.integrations[savedUser.integrations.length - 1]
      );
    } catch (saveError) {
      console.error(`[INTEGRATION_POST] Save error for ${name}:`, saveError);
      throw saveError;
    }

    return NextResponse.json({
      status: "success",
      message: "Integration added successfully",
      data: {
        integration: user.integrations[user.integrations.length - 1],
      },
    });
  } catch (error) {
    console.error("[INTEGRATION_CREATE_ERROR]", error);
    return NextResponse.json(
      { status: "error", message: "Failed to create integration" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { status: "unauthorized", message: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const integrationName = searchParams.get("name");

    if (!integrationName) {
      return NextResponse.json(
        { status: "error", message: "Integration name is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    let user = await User.findOne({ id: userId });

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    // Find and remove the integration
    const integrationIndex = user.integrations?.findIndex(
      (integration: any) => integration.name === integrationName
    );

    if (integrationIndex === -1 || integrationIndex === undefined) {
      return NextResponse.json(
        { status: "error", message: "Integration not found" },
        { status: 404 }
      );
    }

    user.integrations.splice(integrationIndex, 1);

    await user.save();

    return NextResponse.json({
      status: "success",
      message: "Integration deleted successfully",
    });
  } catch (error) {
    console.error("[INTEGRATION_DELETE_ERROR]", error);
    return NextResponse.json(
      { status: "error", message: "Failed to delete integration" },
      { status: 500 }
    );
  }
}
