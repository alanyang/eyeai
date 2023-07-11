import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import stylesheet from '~/tailwind.css'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet }
];

export default function App () {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-100 text-slate-900">
        <div className="mx-5 mt-2 flex flex-col gap-1">
          <img src={logo} width={"120"} height={"120"} className="self-start " />
          <div className="mt-3">
            <label className="font-bold text-xl">AI Photo Generate</label>
            <div className="font-light text-md">Generate your ideal visual style</div>
          </div>

        </div>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}


const logo = "data:image/png;base64,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"