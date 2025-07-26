import { connectToDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    console.log("[MIGRATION] Starting integrations field migration...");

    // Find all users that don't have the integrations field or have it as undefined/null
    const usersToUpdate = await User.find({
      $or: [
        { integrations: { $exists: false } },
        { integrations: null },
        { integrations: undefined },
      ],
    });

    console.log(`[MIGRATION] Found ${usersToUpdate.length} users to update`);
    console.log(
      `[MIGRATION] Users to update:`,
      usersToUpdate.map((u) => ({ id: u.id, integrations: u.integrations }))
    );

    let updatedCount = 0;
    let failedCount = 0;

    for (const user of usersToUpdate) {
      try {
        console.log(
          `[MIGRATION] Processing user ${user.id}, current integrations:`,
          user.integrations
        );
        console.log(`[MIGRATION] User before update:`, {
          id: user.id,
          integrations: user.integrations,
          hasIntegrationsField: user.hasOwnProperty("integrations"),
          integrationsType: typeof user.integrations,
        });

        // Initialize integrations as empty array
        user.integrations = [];
        // Mark the integrations field as modified so Mongoose saves it
        user.markModified("integrations");

        console.log(
          `[MIGRATION] About to save user ${user.id} with integrations:`,
          user.integrations
        );

        const savedUser = await user.save();
        updatedCount++;

        console.log(
          `[MIGRATION] Updated user ${user.id} - integrations field added`
        );
        console.log(
          `[MIGRATION] Verified user ${user.id} integrations after save:`,
          savedUser.integrations
        );

        // Double-check by fetching from DB again
        const fetchedUser = await User.findOne({ id: user.id });
        console.log(`[MIGRATION] Double-check user ${user.id} from DB:`, {
          id: fetchedUser?.id,
          integrations: fetchedUser?.integrations,
          hasIntegrationsField: fetchedUser?.hasOwnProperty("integrations"),
        });
      } catch (error) {
        failedCount++;
        console.error(`[MIGRATION] Failed to update user ${user.id}:`, error);
        if (error instanceof Error) {
          console.error(`[MIGRATION] Error details:`, {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
        }
      }
    }

    console.log(
      `[MIGRATION] Migration completed. Updated: ${updatedCount}, Failed: ${failedCount}`
    );

    return NextResponse.json({
      status: "success",
      message: "Migration completed successfully",
      data: {
        totalUsersFound: usersToUpdate.length,
        usersUpdated: updatedCount,
        usersFailed: failedCount,
      },
    });
  } catch (error) {
    console.error("[MIGRATION_ERROR]", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Migration failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check how many users need migration
export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    // Count users without integrations field
    const usersNeedingMigration = await User.countDocuments({
      $or: [
        { integrations: { $exists: false } },
        { integrations: null },
        { integrations: undefined },
      ],
    });

    // Count users with integrations field
    const usersWithIntegrations = await User.countDocuments({
      integrations: { $exists: true, $ne: null },
    });

    const totalUsers = await User.countDocuments({});

    return NextResponse.json({
      status: "success",
      message: "Migration status check completed",
      data: {
        totalUsers,
        usersNeedingMigration,
        usersWithIntegrations,
        migrationNeeded: usersNeedingMigration > 0,
      },
    });
  } catch (error) {
    console.error("[MIGRATION_CHECK_ERROR]", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to check migration status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT endpoint to test migration on a specific user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { status: "error", message: "userId is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    console.log(`[MIGRATION_TEST] Testing migration for user: ${userId}`);

    const user = await User.findOne({ id: userId });

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "User not found" },
        { status: 404 }
      );
    }

    console.log(`[MIGRATION_TEST] User before migration:`, {
      id: user.id,
      integrations: user.integrations,
      hasIntegrationsField: user.hasOwnProperty("integrations"),
      integrationsType: typeof user.integrations,
      fullUser: user.toObject(),
    });

    // Initialize integrations as empty array
    user.integrations = [];
    user.markModified("integrations");

    console.log(
      `[MIGRATION_TEST] About to save user with integrations:`,
      user.integrations
    );

    const savedUser = await user.save();

    console.log(`[MIGRATION_TEST] User after save:`, {
      id: savedUser.id,
      integrations: savedUser.integrations,
      hasIntegrationsField: savedUser.hasOwnProperty("integrations"),
      fullUser: savedUser.toObject(),
    });

    // Fetch fresh from DB
    const fetchedUser = await User.findOne({ id: userId });

    return NextResponse.json({
      status: "success",
      message: "Test migration completed",
      data: {
        userBeforeMigration: {
          id: user.id,
          integrations: user.integrations,
          hasIntegrationsField: user.hasOwnProperty("integrations"),
        },
        userAfterSave: {
          id: savedUser.id,
          integrations: savedUser.integrations,
          hasIntegrationsField: savedUser.hasOwnProperty("integrations"),
        },
        userFromDB: {
          id: fetchedUser?.id,
          integrations: fetchedUser?.integrations,
          hasIntegrationsField: fetchedUser?.hasOwnProperty("integrations"),
          fullUser: fetchedUser?.toObject(),
        },
      },
    });
  } catch (error) {
    console.error("[MIGRATION_TEST_ERROR]", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Test migration failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
