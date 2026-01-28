<script lang="ts">
    /**
     * TimestampedText Component
     * Parses text and converts timestamps (e.g., "1:23", "12:34", "1:23:45") into clickable links
     * that trigger a seek event when clicked.
     */

    let {
        text,
        onSeek,
    }: {
        text: string;
        onSeek?: (seconds: number) => void;
    } = $props();

    // Regex to match timestamps like 0:00, 1:23, 12:34, 1:23:45
    const timestampRegex = /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/g;

    interface TextPart {
        type: "text" | "timestamp";
        content: string;
        seconds?: number;
    }

    function parseTimestamp(match: string): number {
        const parts = match.split(":").map(Number);
        if (parts.length === 2) {
            // MM:SS
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            // HH:MM:SS
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        return 0;
    }

    function parseText(input: string): TextPart[] {
        const parts: TextPart[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        // Reset regex state
        timestampRegex.lastIndex = 0;

        while ((match = timestampRegex.exec(input)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                parts.push({
                    type: "text",
                    content: input.slice(lastIndex, match.index),
                });
            }

            // Add the timestamp
            parts.push({
                type: "timestamp",
                content: match[0],
                seconds: parseTimestamp(match[0]),
            });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < input.length) {
            parts.push({
                type: "text",
                content: input.slice(lastIndex),
            });
        }

        return parts;
    }

    let parsedParts = $derived(parseText(text));

    function handleTimestampClick(seconds: number) {
        if (onSeek) {
            onSeek(seconds);
        }
    }
</script>

{#each parsedParts as part}
    {#if part.type === "timestamp" && part.seconds !== undefined}
        <button
            type="button"
            onclick={() => handleTimestampClick(part.seconds!)}
            class="inline text-primary-400 hover:text-primary-300 font-medium cursor-pointer transition-colors hover:underline"
        >
            {part.content}
        </button>
    {:else}
        {part.content}
    {/if}
{/each}
