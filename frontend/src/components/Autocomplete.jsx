import React, { useState, useEffect, useRef } from "react";

export default function Autocomplete({ label, fetchUrl, value, onChange, disabled  }) {
  const [input, setInput] = useState(value?.name || "");
  const [suggestions, setSuggestions] = useState([]);
  const suppressFetch = useRef(false);

  useEffect(() => {
    if (value) {
      suppressFetch.current = true;
      setInput(value.name);
      setSuggestions([]);
    } else {
      setInput("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.id]);

  useEffect(() => {
    if (suppressFetch.current) {
      suppressFetch.current = false;
      return;
    }

    const run = async () => {
      if (input.length > 1) {
        // try both ?search and ?q (support both backends)
        const tryUrls = [
          `${fetchUrl}?search=${encodeURIComponent(input)}`,
          `${fetchUrl}?q=${encodeURIComponent(input)}`,
        ];
        for (const url of tryUrls) {
          try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const data = await res.json();
            setSuggestions(Array.isArray(data) ? data : []);
            return;
          } catch {}
        }
      } else {
        setSuggestions([]);
      }
    };
    run();
  }, [input, fetchUrl]);

  const pickId = (item) =>
    item.customer_id ?? item.process_id ?? item.part_id ?? item.id;

  const pickName = (item) =>
    item.customer_name ?? item.short_name ?? item.part_name ?? item.name;

  return (
    <div>
      {label ? <label className="block text-sm mb-1">{label}</label> : null}
      <input
        type="text"
        value={input}
        disabled={disabled}
        onChange={(e) => {
          setInput(e.target.value);
          setSuggestions([])
        }}
        className="border p-2 w-full"
        placeholder={`Search ${label?.toLowerCase() || ""}`}
      />

      {suggestions.length > 0 && (
        <ul className="border mt-0 max-h-56 overflow-auto bg-white z-10 relative">
          {suggestions.map((item) => {
            const id = pickId(item);
            const name = pickName(item);
            return (
              <li
                key={id}
                className="px-2 py-1 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  suppressFetch.current = true;
                  setInput(name);
                  onChange({ id, name });
                  setSuggestions([]);
                }}
              >
                {name}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
