import { component$, Slot } from "@builder.io/qwik";
import { server$, type RequestHandler } from "@builder.io/qwik-city";
import { logout } from "~/lib/firebase";
import { defaultCookieOpts } from "~/types/defaultCookieOpts";
import { sessionCookieName } from "~/types/firebase";
import { ShardMapKeys } from "~/types/sharedMap";

export const onRequest: RequestHandler = async ({
  next,
  redirect,
  sharedMap,
}) => {
  const userId = sharedMap.get(ShardMapKeys.userId);
  if (!userId) {
    throw redirect(302, "/login/");
  }

  await next();
};
const deleteCookieForAdmin = server$(function () {
  // you can access all requestEvent properties in server$ functions
  // by using a normal function call and through the "this" keyword
  // https://qwik.builder.io/docs/server$/
  this.cookie.delete(sessionCookieName, {
    ...defaultCookieOpts,
  });
});

export default component$(() => {
  return (
    <>
      <button
        onClick$={async () => {
          await logout();
          await deleteCookieForAdmin();
        }}
      >
        logout
      </button>
      <Slot />;
    </>
  );
});
