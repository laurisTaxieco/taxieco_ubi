import AWS from "aws-sdk";
import { getToken } from "./cognito";
import { CredentialsOptions } from "aws-sdk/lib/credentials";

export type QSCredentials =
  | AWS.Credentials
  | CredentialsOptions
  | null
  | undefined;

export const isQSCredentials = (
  credentials: unknown
): credentials is QSCredentials => {
  if (
    credentials !== null &&
    typeof credentials === "object" &&
    ("accessKeyId" && "secretAccessKey" && "sessionToken") in credentials
  ) {
    return true;
  }
  return false;
};

async function createQuickSightGroup(
  credentials: QSCredentials,
  quickSightManagement: AWS.QuickSight,
  username: string
) {
  const params: AWS.QuickSight.CreateGroupRequest = {
    AwsAccountId: process.env.QUICKSIGHT_ACCOUNT_ID!,
    Namespace: process.env.QUICKSIGHT_NAMESPACE!,
    GroupName: process.env.QUICKSIGHT_GROUP_NAME!,
  };

  try {
    await new Promise((resolve, reject) => {
      quickSightManagement.createGroup(params, (err, data) => {
        if (data) {
          console.log("QuickSight group created successfully");
          return resolve("proceed");
        } else {
          console.log(err);
          return reject("create group failed");
        }
      });
    });

    return registerQuickSightMembership(
      credentials,
      quickSightManagement,
      username
    );
  } catch (err) {
    if (err === "create group failed") {
      throw new Error("failed to create QuickSight group");
    }
    console.log(err);
    throw new Error("error @ quicksight.createQuickSightGroup");
  }
}

async function registerQuickSightMembership(
  credentials: QSCredentials,
  quickSightManagement: AWS.QuickSight,
  username: string
): Promise<any> {
  const params: AWS.QuickSight.CreateGroupMembershipRequest = {
    AwsAccountId: process.env.QUICKSIGHT_ACCOUNT_ID!,
    Namespace: process.env.QUICKSIGHT_NAMESPACE!,
    MemberName: process.env.QUICKSIGHT_IAM_ROLENAME! + "/" + username,
    GroupName: process.env.QUICKSIGHT_GROUP_NAME!,
  };

  try {
    await new Promise((resolve, reject) => {
      quickSightManagement.createGroupMembership(params, (err, data) => {
        if (data) {
          console.log("successfully created group membership for " + username);
          return resolve("proceed to generate URL");
        } else if (err && err.code === "ResourceNotFoundException") {
          return reject("no user group");
        } else {
          console.log(err);
          return reject("register membership failed");
        }
      });
    });

    return getDashboard(credentials, username, 0);
  } catch (err) {
    if (err === "no user group") {
      return createQuickSightGroup(credentials, quickSightManagement, username);
    } else if (err === "register membership failed") {
      throw new Error("failed to register QuickSight membership");
    }
    console.log(err);
    throw new Error("error @ quicksight.registerQuickSightMembership");
  }
}

async function registerQuickSightUser(
  credentials: QSCredentials,
  username: string,
  recursion: number
) {
  const quickSightManagement = new AWS.QuickSight({
    region: process.env.QUICKSIGHT_MANAGEMENT_REGION,
    credentials: credentials,
  });

  const params: AWS.QuickSight.RegisterUserRequest = {
    AwsAccountId: process.env.QUICKSIGHT_ACCOUNT_ID!,
    Namespace: process.env.QUICKSIGHT_NAMESPACE!,
    IdentityType: process.env.QUICKSIGHT_ID_TYPE!,
    IamArn: process.env.QUICKSIGHT_ROLE_ARN!,
    SessionName: username,
    Email: "taxieco_ubi@dummy.org", //
    UserRole: process.env.QUICKSIGHT_USER_ROLE!,
  };

  try {
    if (recursion > 10) {
      console.log(
        "generate QuickSight dashboard recursion > 10, username: " + username
      );
      throw new Error("maximum recursion limit, generate dashboard");
    }

    await new Promise((resolve, reject) => {
      quickSightManagement.registerUser(params, (err, data) => {
        if (data) {
          console.log("QuickSight user registered");
          console.log(data);
          return resolve(data);
        } else if (
          err &&
          err.code === "ResourceExistsException" &&
          recursion <= 10
        ) {
          recursion++;
          console.log("generate QuickSight dashboard recursion: " + recursion);
          return reject("retry");
        } else {
          console.log("unable to register " + username);
          console.log(err);
          return reject("registration failed");
        }
      });
    });

    return registerQuickSightMembership(
      credentials,
      quickSightManagement,
      username
    );
  } catch (err) {
    if (err === "retry") {
      return getDashboard(credentials, username, recursion);
    } else if (err === "registration failed") {
      throw new Error("failed to register QuickSight user");
    } else if (
      err instanceof Error &&
      err.message === "maximum recursion limit, generate dashboard"
    ) {
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("error @ quicksight.registerQuickSightUser");
  }
}

export async function getDashboard(
  credentials: QSCredentials,
  username: string,
  recursion: number = 0
): Promise<any> {
  const dashboard = new AWS.QuickSight({
    region: process.env.REGION_AWS,
    credentials: credentials,
  });

  const params: AWS.QuickSight.GenerateEmbedUrlForRegisteredUserRequest = {
    AwsAccountId: process.env.QUICKSIGHT_ACCOUNT_ID!,
    ExperienceConfiguration: {
      Dashboard: {
        InitialDashboardId: process.env.QUICKSIGHT_UBI_DASHBOARD_ID!,
      },
    },
    UserArn: `arn:aws:quicksight:${process.env
      .QUICKSIGHT_MANAGEMENT_REGION!}:${process.env
      .QUICKSIGHT_ACCOUNT_ID!}:user/${process.env
      .QUICKSIGHT_NAMESPACE!}/${process.env
      .QUICKSIGHT_IAM_ROLENAME!}/${username}`,
    SessionLifetimeInMinutes: 60,
  };

  try {
    const response: unknown = await new Promise((resolve, reject) => {
      dashboard.generateEmbedUrlForRegisteredUser(params, async (err, data) => {
        if (data) {
          console.log("successfully generated dashboard for " + username);
          return resolve(data);
        } else if (
          err &&
          (err.code === "ResourceNotFoundException" ||
            err.code === "QuickSightUserNotFoundException")
        ) {
          return reject("no QuickSight user");
        } else {
          console.log("unable to generate dashboard URL for " + username);
          console.log(err);
          return reject("no QuickSight URL");
        }

        //   const returnable = {
        //     statusCode: 200,
        //     headers: {
        //       "Access-Control-Allow-Origin": "*",
        //       "Access-Control-Allow-Headers": "Content-Type",
        //     },
        //     body: JSON.stringify(data),
        //     isBase64Encoded: false,
        //   };
        //   console.log("successfully generated dashboard for " + username);
        //   return returnable;
      });
    });

    return response;
  } catch (err) {
    if (err === "no QuickSight user") {
      return registerQuickSightUser(credentials, username, recursion);
    } else if (err === "no QuickSight URL") {
      throw new Error("failed to generate QuickSight URL");
    }
    console.log(err);
    throw new Error("error @ quicksight.getDashboard");
  }
}

export async function assumeRole(username: string) {
  const idToken = await getToken("id");
  if (idToken === undefined) {
    console.log("No idToken");
    throw new Error("Error @ quicksight.assumeRole");
  }

  const stsClient = new AWS.STS({ region: process.env.REGION_AWS });
  const stsParams = {
    RoleSessionName: username,
    WebIdentityToken: idToken,
    RoleArn: process.env.QUICKSIGHT_ROLE_ARN!,
  };

  try {
    const response: unknown = await new Promise((resolve, reject) => {
      stsClient.assumeRoleWithWebIdentity(stsParams, (err, data) => {
        if (err) {
          console.log(err);
          return reject("failed to assume role");
        }

        const assumedCredentials: QSCredentials = {
          accessKeyId: data.Credentials?.AccessKeyId!,
          secretAccessKey: data.Credentials?.SecretAccessKey!,
          sessionToken: data.Credentials?.SessionToken!,
          expireTime: data.Credentials?.Expiration!,
        };

        return resolve(assumedCredentials);
      });
    });

    if (isQSCredentials(response)) {
      return response;
    } else {
      throw new Error(
        "error @ quicksight.assumeRole.stsClient.assumeRoleWithWebIdentity"
      );
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Error @ quicksight.assumeRole");
  }
}
