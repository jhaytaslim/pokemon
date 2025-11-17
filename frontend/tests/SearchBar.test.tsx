import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import SearchBar from "../src/components/SearchBar";

it("debounces input and calls onSearch", async () => {
  const mockOnSearch = vi.fn();
  render(<SearchBar onSearch={mockOnSearch} />);

  fireEvent.change(screen.getByRole("textbox"), { target: { value: "pik" } });

  await waitFor(() => {
    expect(mockOnSearch).toHaveBeenCalledWith("pik");
  });
});
