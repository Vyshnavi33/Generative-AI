import { Loader2 } from "lucide-react";

export function getToolCallLabel(
  toolName: string,
  args: Record<string, unknown>,
  state: string
): string {
  const done = state === "result";
  const pathVal = args?.path;
  const file =
    typeof pathVal === "string" && pathVal.length > 0
      ? pathVal.replace(/\/$/, "").split("/").pop() || "file"
      : "file";

  if (toolName === "str_replace_editor") {
    const command = typeof args?.command === "string" ? args.command : "";
    switch (command) {
      case "create":
        return done ? `Created ${file}` : `Creating ${file}...`;
      case "str_replace":
        return done ? `Updated ${file}` : `Editing ${file}...`;
      case "insert":
        return done ? `Updated ${file}` : `Editing ${file}...`;
      case "view":
        return done ? `Read ${file}` : `Reading ${file}...`;
      case "undo_edit":
        return done ? `Reverted ${file}` : `Undoing changes to ${file}...`;
      default:
        return done ? `Done with ${file}` : `Working on ${file}...`;
    }
  }

  if (toolName === "file_manager") {
    const command = typeof args?.command === "string" ? args.command : "";
    switch (command) {
      case "rename":
        return done ? `Renamed ${file}` : `Renaming ${file}...`;
      case "delete":
        return done ? `Deleted ${file}` : `Deleting ${file}...`;
      default:
        return done ? `Done with ${file}` : `Managing ${file}...`;
    }
  }

  return done ? "Tool completed" : "Running tool...";
}

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

export function ToolCallBadge({ toolName, args, state, result }: ToolCallBadgeProps) {
  const label = getToolCallLabel(toolName, args, state);
  const isDone = state === "result" && result != null;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
