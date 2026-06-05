import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Search from "./search";

// Mock Next.js navigation hooks
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/",
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock use-debounce to run callbacks immediately in tests
vi.mock("use-debounce", () => ({
  useDebouncedCallback: (fn: (...args: unknown[]) => void) => fn,
}));

describe("Search 組件", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it("應正確渲染搜尋輸入框", () => {
    render(<Search />);
    expect(screen.getByPlaceholderText("Search by name")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("輸入文字後應更新 URL query 參數", async () => {
    const user = userEvent.setup();
    render(<Search />);

    const input = screen.getByPlaceholderText("Search by name");
    await user.type(input, "pikachu");

    expect(mockReplace).toHaveBeenLastCalledWith(
      expect.stringContaining("query=pikachu"),
    );
  });

  it("清空輸入後應移除 query 參數", async () => {
    const user = userEvent.setup();
    render(<Search />);

    const input = screen.getByPlaceholderText("Search by name");
    // 先輸入文字，再清空
    await user.type(input, "pikachu");
    mockReplace.mockClear();
    await user.clear(input);

    expect(mockReplace).toHaveBeenLastCalledWith(
      expect.not.stringContaining("query="),
    );
  });
});
