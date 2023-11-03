import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { RequestHandler } from "@builder.io/qwik-city";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import pkg from "firebase-admin";

import Header from "~/components/starter/header/header";
import Footer from "~/components/starter/footer/footer";

import styles from "./styles.css?inline";
import { ShardMapKeys } from "~/types/sharedMap";
import { sessionCookieName } from "~/types/firebase";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export const onRequest: RequestHandler = async ({
  next,
  env,
  sharedMap,
  cookie,
}) => {
  // if (import.meta.env.DEV) {
  //   const projectId = env.get("FB_PROJECT_ID");
  //   const clientEmail = env.get("FB_CLIENT_EMAIL");
  //   const privateKey = env.get("FB_PRIVATE_KEY");
  //   console.log(projectId, clientEmail, privateKey);
  // }

  try {
    pkg.initializeApp({
      credential: pkg.credential.cert({
        projectId: env.get("FB_PROJECT_ID"),
        clientEmail: env.get("FB_CLIENT_EMAIL"),
        privateKey: env.get("FB_PRIVATE_KEY"),
      }),
    });
  } catch (err) {
    if (!/already exists/u.test(err.message)) {
      console.error("Firebase Admin Error: ", err.stack);
    }
  }

  const adminAuth = getAuth();
  sharedMap.set(ShardMapKeys.adminDB, getFirestore());
  sharedMap.set(ShardMapKeys.adminAuth, adminAuth);

  const sessionCookie = cookie.get(sessionCookieName);
  if (sessionCookie) {
    const userId = (await adminAuth.verifySessionCookie(sessionCookie.value))
      .uid;
    sharedMap.set(ShardMapKeys.userId, userId);
  } else {
    sharedMap.delete(ShardMapKeys.userId);
  }

  await next();
};

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export default component$(() => {
  useStyles$(styles);
  return (
    <>
      <Header />
      <main>
        <Slot />
      </main>
      <Footer />
    </>
  );
});
