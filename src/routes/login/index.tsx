import { component$, useSignal } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { login, logout } from "~/lib/firebase";
import { ShardMapKeys } from "~/types/sharedMap";
import pkg from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { sessionCookieName } from "~/types/firebase";

const defaultCookieOpts = {
  httpOnly: true,
  secure: true,
  path: "/",
};

const setCookieForAdmin = server$(async function (idToken: string) {
  // you can access all requestEvent properties in server$ functions
  // by using a normal function call and through the "this" keyword
  // https://qwik.builder.io/docs/server$/
  try {
    pkg.initializeApp({
      credential: pkg.credential.cert({
        projectId: this.env.get("FB_PROJECT_ID"),
        clientEmail: this.env.get("FB_CLIENT_EMAIL"),
        privateKey: this.env.get("FB_PRIVATE_KEY"),
      }),
    });
  } catch (err) {
    if (!/already exists/u.test(err.message)) {
      console.error("Firebase Admin Error: ", err.stack);
    }
  }
  const adminAuth = getAuth();

  const expiresIn = 60 * 60 * 24 * 14 * 1000;
  const decodedIdToken = await adminAuth.verifyIdToken(idToken);

  if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
    const cookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    const options = {
      maxAge: expiresIn,
      ...defaultCookieOpts,
    };

    this.cookie.set(sessionCookieName, cookie, options);
  }
});
const deleteCookieForAdmin = server$(function () {
  // you can access all requestEvent properties in server$ functions
  // by using a normal function call and through the "this" keyword
  // https://qwik.builder.io/docs/server$/
  this.cookie.delete(sessionCookieName, {
    ...defaultCookieOpts,
  });
});

export default component$(() => {
  const emailQ = useSignal<string>("");
  const passwordQ = useSignal<string>("");
  const showPasswordQ = useSignal<boolean>(false);
  return (
    <div>
      <label for="email">Email</label>
      <input
        type="text"
        name="email"
        id="email"
        autoComplete="email"
        bind:value={emailQ}
      />
      <label for="password">Password</label>
      <input
        type={showPasswordQ.value ? "text" : "password"}
        name="password"
        id="password"
        autoComplete="password"
        bind:value={passwordQ}
      />
      <button onClick$={() => (showPasswordQ.value = !showPasswordQ.value)}>
        {showPasswordQ.value ? "hide" : "show"}
      </button>
      <button
        onClick$={async () => {
          const credential = await login(emailQ.value, passwordQ.value);
          const idToken = await credential.user.getIdToken();
          await setCookieForAdmin(idToken);
        }}
      >
        Login
      </button>
      <button
        onClick$={async () => {
          await logout();
          await deleteCookieForAdmin();
        }}
      >
        Login
      </button>
    </div>
  );
});
