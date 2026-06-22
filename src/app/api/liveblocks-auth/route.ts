import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { auth, currentUser } from "@clerk/nextjs/server";

import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(req: Request) {
  console.log("SECRET KEY EXISTS:", !!process.env.LIVEBLOCKS_SECRET_KEY);
  console.log("CONVEX URL EXISTS:", !!process.env.NEXT_PUBLIC_CONVEX_URL);

  const { sessionClaims } = await auth();

  console.log("1. sessionClaims:", sessionClaims);

  if (!sessionClaims) {
    console.log("FAILED: no sessionClaims");
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await currentUser();

  if (!user) {
    console.log("FAILED: no user");
    return new Response("Unauthorized", { status: 401 });
  }

  const { room } = await req.json();

  const document = await convex.query(api.documents.getById, {
    id: room,
  });

  if (!document) {
    console.log("FAILED: document not found");
    return new Response("Unauthorized", { status: 401 });
  }

  const claims = sessionClaims as {
    o?: {
      id?: string;
    };
  };

  const orgId = claims.o?.id;

  console.log("document.organizationId", document.organizationId);
  console.log("document.ownerId", document.ownerId);
  console.log("user.id", user.id);
  console.log("orgId", orgId);

  const isOwner = document.ownerId === user.id;

  const isOrganizationMember =
    !!document.organizationId &&
    document.organizationId === orgId;

  console.log("isOwner", isOwner);
  console.log("isOrganizationMember", isOrganizationMember);

  if (!isOwner && !isOrganizationMember) {
    console.log("FAILED AUTH CHECK");
    return new Response("Unauthorized", { status: 401 });
  }

  const name =
    user.fullName ??
    user.primaryEmailAddress?.emailAddress ??
    "Anonymous";

  const nameToNumber = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const hue = Math.abs(nameToNumber) % 360;
  const color = `hsl(${hue}, 80%, 60%)`;

  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name,
      avatar: user.imageUrl,
      color,
    },
  });

  session.allow(room, session.FULL_ACCESS);

  const { body, status } = await session.authorize();

  return new Response(body, { status });
}