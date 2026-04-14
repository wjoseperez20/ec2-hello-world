import { render, screen, act } from "@testing-library/react";
import DaysCounter from "@/app/components/DaysCounter";

const START_DATE = new Date("2024-11-21T00:00:00");
const FIXED_NOW = new Date("2026-04-13T12:00:00");
const EXPECTED_DAYS = Math.floor(
  (FIXED_NOW.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)
);

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(FIXED_NOW);
});

afterAll(() => {
  jest.useRealTimers();
});

describe("DaysCounter", () => {
  it('renders the "Together for" label', () => {
    render(<DaysCounter />);
    expect(screen.getByText(/together for/i)).toBeInTheDocument();
  });

  it("renders the computed day count after effects run", async () => {
    render(<DaysCounter />);
    await act(async () => {});
    expect(screen.getByText(String(EXPECTED_DAYS))).toBeInTheDocument();
  });

  it('renders "days" label after effects run', async () => {
    render(<DaysCounter />);
    await act(async () => {});
    expect(screen.getByText(/^days$/i)).toBeInTheDocument();
  });

  it('renders the "Since November 21, 2024" label', async () => {
    render(<DaysCounter />);
    await act(async () => {});
    expect(screen.getByText(/since november 21, 2024/i)).toBeInTheDocument();
  });

  it("increments the count after one day elapses", async () => {
    render(<DaysCounter />);
    await act(async () => {});
    expect(screen.getByText(String(EXPECTED_DAYS))).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(1000 * 60 * 60 * 24);
    });
    expect(screen.getByText(String(EXPECTED_DAYS + 1))).toBeInTheDocument();
  });
});
