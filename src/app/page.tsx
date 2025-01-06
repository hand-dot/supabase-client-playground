"use client";

import React, { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "tailwindcss/tailwind.css";
import Image from "next/image";

function SupabasePlayground() {
  const [apiKey, setApiKey] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleRunQuery = async (e: FormEvent) => {
    e.preventDefault();
    if (!apiKey || !apiUrl) {
      setError("Please provide both the API Key and URL.");
      return;
    }

    const supabase = createClient(apiUrl, apiKey);

    try {
      setError(null);
      setResponse(null);
      setLoading(true);

      // Evaluate the query dynamically
      const func = new Function("supabase", `return ${query}`);
      const result = await func(supabase);

      const { data, error } = result;

      if (error) {
        setError(error);
        setLoading(false);
      } else {
        setResponse(data);
        setHistory((prev) => [...prev, query]);
        setLoading(false);
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div className="bg-neutral-900 h-screen grid grid-cols-3 gap-4 font-sans min-h-screen">
      <main className="col-span-2 p-4">
        <h1 className="text-2xl font-bold mb-8 flex gap-4">
          <Image
            src="https://supabase.com/dashboard/img/supabase-logo.svg"
            width={24}
            height={24}
            alt="Supabase Logo"
          />
          Supabase Client Playground
        </h1>

        <form className="space-y-4">
          <div className="bg-neutral-800 py-6 px-4 rounded-md">
            <div className="flex gap-4">
              <div className="w-full">
                <label className="block font-medium mb-2">API URL:</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="text-neutral-900 w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="w-full">
                <label className="block font-medium mb-2">API Key:</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Your Supabase API Key"
                  className="text-neutral-900 w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mt-2 mb-2">Query:</label>
              <div className="flex gap-4">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="supabase.from('table').select()"
                  className="text-neutral-900 w-full p-2 border border-gray-300 rounded-lg h-14"
                />
                <button
                  type="submit"
                  onClick={handleRunQuery}
                  className="flex justify-center items-center gap-2 w-48 rounded-lg bg-green-600 border-green-500 border-2 py-3 px-6 font-sans text-xs font-bold text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                    />
                  </svg>
                  Run query
                </button>
              </div>
            </div>
          </div>

          <div>
            {error && (
              <div className="text-red-900 font-medium">
                <strong className="text-white font-medium mb-2">Error:</strong>
                <p className="bg-red-200 h-[calc(100vh-364px)] px-4 py-2 text-red-900 rounded-lg mt-2 overflow-x-auto text-center my-auto">
                  {JSON.stringify(error, null, 2)}
                </p>
              </div>
            )}

            {response && (
              <div className="text-green-900 font-medium">
                <strong className="text-white font-medium mb-2">
                  Response:
                </strong>
                <pre className="h-[calc(100vh-364px)] px-4 py-2 bg-green-100 rounded-lg mt-2 overflow-x-auto">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}

            {!response && !error && (
              <div className="text-green-900 font-medium">
                <strong className="text-white font-medium mb-2">
                  Response:
                </strong>
                {loading && (
                  <pre className="bg-neutral-800 h-[calc(100vh-364px)] px-4 py-2 text-neutral-400 rounded-lg mt-2 overflow-x-auto text-center my-auto">
                    Executing query...
                  </pre>
                )}
                {!loading && (
                  <pre className="bg-neutral-800 h-[calc(100vh-364px)] px-4 py-2 text-neutral-400 rounded-lg mt-2 overflow-x-auto text-center my-auto">
                    Run a query to see the response here.
                  </pre>
                )}
              </div>
            )}
          </div>
        </form>
      </main>

      <aside className="bg-neutral-800 p-4 h-screen overflow-y-auto">
        <h2 className="text-xl mb-8">Query history</h2>
        {history.length === 0 ? (
          <p className="text-neutral-400">No queries executed yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((q, index) => (
              <li
                key={index}
                className="bg-white px-2 py-4 rounded-lg shadow-sm border border-gray-300"
              >
                <pre className="text-sm text-gray-800 overflow-x-auto flex justify-between items-center">
                  {q}
                  <button
                    onClick={() => handleCopyToClipboard(q)}
                    className="ml-2 text-xs text-gray-800 bg-gray-200 p-2 rounded-md"
                  >
                    {!copied ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </button>
                </pre>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

export default SupabasePlayground;
