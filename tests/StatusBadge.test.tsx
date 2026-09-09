import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "@/components/StatusBadge";

describe("StatusBadge", () => {
  it("renders correct label for pending status", () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText("MENUNGGU BERKAS")).toBeInTheDocument();
  });

  it("renders correct label for active status", () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText("STREETBARBER AKTIF")).toBeInTheDocument();
  });

  it("renders correct label for rejected status", () => {
    render(<StatusBadge status="rejected" />);
    expect(screen.getByText("DITOLAK")).toBeInTheDocument();
  });

  it("renders correct label for menunggu_tes status", () => {
    render(<StatusBadge status="menunggu_tes" />);
    expect(screen.getByText("TAHAP TES")).toBeInTheDocument();
  });

  it("renders correct label for seleksi_berkas_lolos status", () => {
    render(<StatusBadge status="seleksi_berkas_lolos" />);
    expect(screen.getByText("TAHAP TES")).toBeInTheDocument();
  });
});
