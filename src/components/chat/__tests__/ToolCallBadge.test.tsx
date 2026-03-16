import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getToolCallLabel, ToolCallBadge } from "../ToolCallBadge";

vi.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="spinner" className={className} />
  ),
}));

afterEach(() => {
  cleanup();
});

// --- getToolCallLabel unit tests ---

// str_replace_editor commands
test("getToolCallLabel: str_replace_editor create in-progress", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "src/Button.tsx" }, "call")).toBe("Creating Button.tsx...");
});

test("getToolCallLabel: str_replace_editor create done", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "src/Button.tsx" }, "result")).toBe("Created Button.tsx");
});

test("getToolCallLabel: str_replace_editor str_replace in-progress", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "str_replace", path: "src/App.tsx" }, "call")).toBe("Editing App.tsx...");
});

test("getToolCallLabel: str_replace_editor str_replace done", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "str_replace", path: "src/App.tsx" }, "result")).toBe("Updated App.tsx");
});

test("getToolCallLabel: str_replace_editor insert in-progress", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "insert", path: "src/App.tsx" }, "call")).toBe("Editing App.tsx...");
});

test("getToolCallLabel: str_replace_editor insert done", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "insert", path: "src/App.tsx" }, "result")).toBe("Updated App.tsx");
});

test("getToolCallLabel: str_replace_editor view in-progress", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "view", path: "src/App.tsx" }, "call")).toBe("Reading App.tsx...");
});

test("getToolCallLabel: str_replace_editor view done", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "view", path: "src/App.tsx" }, "result")).toBe("Read App.tsx");
});

test("getToolCallLabel: str_replace_editor undo_edit in-progress", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "src/App.tsx" }, "call")).toBe("Undoing changes to App.tsx...");
});

test("getToolCallLabel: str_replace_editor undo_edit done", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "src/App.tsx" }, "result")).toBe("Reverted App.tsx");
});

// file_manager commands
test("getToolCallLabel: file_manager rename in-progress", () => {
  expect(getToolCallLabel("file_manager", { command: "rename", path: "src/old.tsx" }, "call")).toBe("Renaming old.tsx...");
});

test("getToolCallLabel: file_manager rename done", () => {
  expect(getToolCallLabel("file_manager", { command: "rename", path: "src/old.tsx" }, "result")).toBe("Renamed old.tsx");
});

test("getToolCallLabel: file_manager delete in-progress", () => {
  expect(getToolCallLabel("file_manager", { command: "delete", path: "src/old.tsx" }, "call")).toBe("Deleting old.tsx...");
});

test("getToolCallLabel: file_manager delete done", () => {
  expect(getToolCallLabel("file_manager", { command: "delete", path: "src/old.tsx" }, "result")).toBe("Deleted old.tsx");
});

// Unknown command fallbacks
test("getToolCallLabel: str_replace_editor unknown command in-progress", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "unknown", path: "src/App.tsx" }, "call")).toBe("Working on App.tsx...");
});

test("getToolCallLabel: str_replace_editor unknown command done", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "unknown", path: "src/App.tsx" }, "result")).toBe("Done with App.tsx");
});

test("getToolCallLabel: file_manager unknown command in-progress", () => {
  expect(getToolCallLabel("file_manager", { command: "unknown", path: "src/App.tsx" }, "call")).toBe("Managing App.tsx...");
});

test("getToolCallLabel: file_manager unknown command done", () => {
  expect(getToolCallLabel("file_manager", { command: "unknown", path: "src/App.tsx" }, "result")).toBe("Done with App.tsx");
});

// Unknown tool
test("getToolCallLabel: unknown tool in-progress", () => {
  expect(getToolCallLabel("some_other_tool", {}, "call")).toBe("Running tool...");
});

test("getToolCallLabel: unknown tool done", () => {
  expect(getToolCallLabel("some_other_tool", {}, "result")).toBe("Tool completed");
});

// partial-call and call both treated as in-progress
test("getToolCallLabel: partial-call treated as in-progress", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "src/Button.tsx" }, "partial-call")).toBe("Creating Button.tsx...");
});

test("getToolCallLabel: call treated as in-progress", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "src/Button.tsx" }, "call")).toBe("Creating Button.tsx...");
});

// basename extraction
test("getToolCallLabel: extracts basename from nested path", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "src/components/Button.tsx" }, "call")).toBe("Creating Button.tsx...");
});

test("getToolCallLabel: uses bare filename as-is", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "Button.tsx" }, "call")).toBe("Creating Button.tsx...");
});

test("getToolCallLabel: empty string path falls back to 'file'", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "" }, "call")).toBe("Creating file...");
});

test("getToolCallLabel: missing path falls back to 'file'", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create" }, "call")).toBe("Creating file...");
});

test("getToolCallLabel: non-string path falls back to 'file'", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: 42 }, "call")).toBe("Creating file...");
});

test("getToolCallLabel: trailing slash stripped from path", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "src/components/" }, "call")).toBe("Creating components...");
});

test("getToolCallLabel: deeply nested path extracts basename", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "view", path: "a/b/c/d/e.ts" }, "call")).toBe("Reading e.ts...");
});

// --- ToolCallBadge render tests ---

test("ToolCallBadge shows spinner for state: call", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/Button.tsx" }}
      state="call"
    />
  );
  expect(screen.getByTestId("spinner")).toBeDefined();
});

test("ToolCallBadge shows spinner for state: partial-call", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/Button.tsx" }}
      state="partial-call"
    />
  );
  expect(screen.getByTestId("spinner")).toBeDefined();
});

test("ToolCallBadge shows green dot for state: result with non-null result", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/Button.tsx" }}
      state="result"
      result="Success"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("ToolCallBadge shows spinner for state: result with result: null", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/Button.tsx" }}
      state="result"
      result={null}
    />
  );
  expect(screen.getByTestId("spinner")).toBeDefined();
});

test("ToolCallBadge shows spinner for state: result with result: undefined", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/Button.tsx" }}
      state="result"
      result={undefined}
    />
  );
  expect(screen.getByTestId("spinner")).toBeDefined();
});

test("ToolCallBadge label: create/call shows Creating Button.tsx...", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/components/Button.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating Button.tsx...")).toBeDefined();
});

test("ToolCallBadge label: create/result shows Created Button.tsx", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/components/Button.tsx" }}
      state="result"
      result="ok"
    />
  );
  expect(screen.getByText("Created Button.tsx")).toBeDefined();
});

test("ToolCallBadge label: str_replace/call shows Editing App.tsx...", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "src/App.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing App.tsx...")).toBeDefined();
});

test("ToolCallBadge label: rename/result shows Renamed old.tsx", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "rename", path: "src/old.tsx" }}
      state="result"
      result="ok"
    />
  );
  expect(screen.getByText("Renamed old.tsx")).toBeDefined();
});

test("ToolCallBadge container has correct class names", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "src/Button.tsx" }}
      state="call"
    />
  );
  const div = container.firstChild as HTMLElement;
  expect(div.className).toContain("inline-flex");
  expect(div.className).toContain("items-center");
  expect(div.className).toContain("bg-neutral-50");
  expect(div.className).toContain("rounded-lg");
  expect(div.className).toContain("font-mono");
  expect(div.className).toContain("border-neutral-200");
});

test("ToolCallBadge unknown tool in-progress shows Running tool...", () => {
  render(
    <ToolCallBadge
      toolName="mystery_tool"
      args={{}}
      state="call"
    />
  );
  expect(screen.getByText("Running tool...")).toBeDefined();
});

test("ToolCallBadge unknown tool done shows Tool completed", () => {
  render(
    <ToolCallBadge
      toolName="mystery_tool"
      args={{}}
      state="result"
      result="done"
    />
  );
  expect(screen.getByText("Tool completed")).toBeDefined();
});
