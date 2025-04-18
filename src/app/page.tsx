"use client";

import React, { FormEvent, useState, useEffect, useCallback, Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import "tailwindcss/tailwind.css";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function SupabasePlaygroundContent() {
  const [apiKey, setApiKey] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [hasShownConfirmation, setHasShownConfirmation] = useState(false);
  const searchParams = useSearchParams();

  const handleRunQuery = useCallback(async ({ key, url, query }: { key: string, url: string, query: string }) => {
    console.log("Running:", key, url, query);
    const supabase = createClient(url, key);

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
  }, [setError, setResponse, setLoading, setHistory]);

  useEffect(() => {
    const urlSupabaseUrl = searchParams.get("supabaseUrl");
    const urlSupabaseKey = searchParams.get("supabaseKey");
    const urlQuery = searchParams.get("query");

    if (urlSupabaseUrl) setApiUrl(urlSupabaseUrl);
    if (urlSupabaseKey) setApiKey(urlSupabaseKey);
    if (urlQuery) setQuery(urlQuery);

    if (urlSupabaseUrl && urlSupabaseKey && urlQuery && !hasShownConfirmation) {
      setHasShownConfirmation(true);
      setTimeout(() => {
        if (window.confirm(
          "You have opened this page with query parameters. Do you want to run the query?"
        )) {
          handleRunQuery({
            key: urlSupabaseKey,
            url: urlSupabaseUrl,
            query: urlQuery,
          });
        }
      }, 500);
    }

  }, [searchParams, handleRunQuery, hasShownConfirmation]);



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
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex gap-4">
            <Image
              src="https://supabase.com/dashboard/img/supabase-logo.svg"
              width={24}
              height={24}
              alt="Supabase Logo"
            />
            Supabase Client Playground
          </h1>
          <div className="flex gap-4 items-center">
            <a
              target="_blank"
              href="https://github.com/hand-dot/supabase-client-playground"
            >
              <svg
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="36"
                height="36"
                viewBox="0 0 50 50"
              >
                <path d="M17.791,46.836C18.502,46.53,19,45.823,19,45v-5.4c0-0.197,0.016-0.402,0.041-0.61C19.027,38.994,19.014,38.997,19,39 c0,0-3,0-3.6,0c-1.5,0-2.8-0.6-3.4-1.8c-0.7-1.3-1-3.5-2.8-4.7C8.9,32.3,9.1,32,9.7,32c0.6,0.1,1.9,0.9,2.7,2c0.9,1.1,1.8,2,3.4,2 c2.487,0,3.82-0.125,4.622-0.555C21.356,34.056,22.649,33,24,33v-0.025c-5.668-0.182-9.289-2.066-10.975-4.975 c-3.665,0.042-6.856,0.405-8.677,0.707c-0.058-0.327-0.108-0.656-0.151-0.987c1.797-0.296,4.843-0.647,8.345-0.714 c-0.112-0.276-0.209-0.559-0.291-0.849c-3.511-0.178-6.541-0.039-8.187,0.097c-0.02-0.332-0.047-0.663-0.051-0.999 c1.649-0.135,4.597-0.27,8.018-0.111c-0.079-0.5-0.13-1.011-0.13-1.543c0-1.7,0.6-3.5,1.7-5c-0.5-1.7-1.2-5.3,0.2-6.6 c2.7,0,4.6,1.3,5.5,2.1C21,13.4,22.9,13,25,13s4,0.4,5.6,1.1c0.9-0.8,2.8-2.1,5.5-2.1c1.5,1.4,0.7,5,0.2,6.6c1.1,1.5,1.7,3.2,1.6,5 c0,0.484-0.045,0.951-0.11,1.409c3.499-0.172,6.527-0.034,8.204,0.102c-0.002,0.337-0.033,0.666-0.051,0.999 c-1.671-0.138-4.775-0.28-8.359-0.089c-0.089,0.336-0.197,0.663-0.325,0.98c3.546,0.046,6.665,0.389,8.548,0.689 c-0.043,0.332-0.093,0.661-0.151,0.987c-1.912-0.306-5.171-0.664-8.879-0.682C35.112,30.873,31.557,32.75,26,32.969V33 c2.6,0,5,3.9,5,6.6V45c0,0.823,0.498,1.53,1.209,1.836C41.37,43.804,48,35.164,48,25C48,12.318,37.683,2,25,2S2,12.318,2,25 C2,35.164,8.63,43.804,17.791,46.836z"></path>
              </svg>
            </a>
            <a
              href="https://github.com/hand-dot/supabase-client-playground/issues/"
              target="_blank"
              className="rounded-lg bg-neutral-800 border-green-600 border-2 py-2 px-6 font-sans text-sm font-light text-white"
            >
              Give feedback
            </a>
          </div>
        </div>

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
                  onClick={(e: FormEvent) => {
                    e.preventDefault();
                    if (apiKey && apiUrl && query) {
                      handleRunQuery({ key: apiKey, url: apiUrl, query });
                    }
                  }}
                  disabled={!apiKey || !apiUrl || !query}
                  className="flex justify-center items-center gap-2 w-48 rounded-lg bg-green-600 border-green-500 border-2 py-3 px-6 font-sans text-xs font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className="bg-red-200 h-[calc(100vh-372px)] px-4 py-2 text-red-900 rounded-lg mt-2 overflow-x-auto text-center my-auto">
                  {JSON.stringify(error, null, 2)}
                </p>
              </div>
            )}

            {response && (
              <div className="text-green-900 font-medium">
                <strong className="text-white font-medium mb-2">
                  Response:
                </strong>
                <pre className="h-[calc(100vh-372px)] px-4 py-2 bg-green-100 rounded-lg mt-2 overflow-x-auto">
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

function SupabasePlayground() {
  return (
    <Suspense fallback={<div className="bg-neutral-900 h-screen flex items-center justify-center text-white">読み込み中...</div>}>
      <SupabasePlaygroundContent />
    </Suspense>
  );
}

export default SupabasePlayground;
