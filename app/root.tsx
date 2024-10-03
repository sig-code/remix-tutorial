import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  redirect,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import styles from "./tailwind.css?url";
import { createEmptyContact, getContacts } from "./data";
import { useEffect } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";


export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

// カードの型定義
type CardType = {
  id: string;
  content: string;
};

// リストの型定義
type ListType = {
  id: string;
  title: string;
  cards: CardType[];
};

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    const searchFiled = document.getElementById("q");
    if (searchFiled instanceof HTMLInputElement) {
      searchFiled.value = q || "";
    }
  }, [q]);

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div>
          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <span>タスク管理</span>
                <div>
                  <Button size="sm" variant="ghost" onClick={() => { }}>
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
