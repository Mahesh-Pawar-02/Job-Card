import React, { useState, useEffect, useRef } from "react";

export default function Autocomplete({ label, fetchUrl, value, onChange }) {
    const [input, setInput] = useState(value?.name || "");
    const [suggestions, setSuggestions] = useState([]);
    const suppressFetch = useRef(false); // 👈 flag to skip fetch

    useEffect(() => {
        if (value) {
            suppressFetch.current = true; // 👈 next input update should not trigger fetch
            setInput(value.name);
            setSuggestions([]); // clear suggestions when prefilling
        } else {
            setInput(""); // ✅ clear when null
        }
    }, [value?.id]);

    useEffect(() => {
        if (suppressFetch.current) {
            suppressFetch.current = false; // reset after skipping once
            return;
        }

        if (input.length > 1) {
            const fetchData = async () => {
                const res = await fetch(`${fetchUrl}?search=${input}`);
                const data = await res.json();
                setSuggestions(data);
            };
            fetchData();
        } else {
            setSuggestions([]);
        }
    }, [input, fetchUrl]);

    return (
        <div>
            <label>{label ? label : ""}</label>
            <input
                type="text"
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                    onChange(null); // reset until selected
                }}
            />
            {suggestions.length > 0 && (
                <ul style={{ border: "1px solid #ccc", marginTop: "0" }}>
                    {suggestions.map((item) => (
                        <li
                            key={item.customer_id || item.part_id}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                suppressFetch.current = true; // 👈 don’t fetch right after selection
                                setInput(item.customer_name || item.part_name);
                                onChange({
                                    id: item.customer_id || item.part_id,
                                    name: item.customer_name || item.part_name,
                                });
                                setSuggestions([]); // hide dropdown after selecting
                            }}
                        >
                            {item.customer_name || item.part_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
