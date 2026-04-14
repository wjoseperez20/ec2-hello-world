import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

// next/image relies on Next.js build pipeline — replace with a plain <img>
// Destructure `fill` out so it isn't forwarded as a non-boolean DOM attribute
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    fill: _fill,
    sizes: _sizes,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    sizes?: string;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Isolate page tests from DaysCounter behaviour
jest.mock("@/app/components/DaysCounter", () => ({
  __esModule: true,
  default: () => <div data-testid="days-counter" />,
}));

describe("Home page", () => {
  it('renders the hero heading "To the Love of My Life"', () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /to the love of my life/i, level: 1 })
    ).toBeInTheDocument();
  });

  it("renders the DaysCounter component", () => {
    render(<Home />);
    expect(screen.getByTestId("days-counter")).toBeInTheDocument();
  });

  it('renders the "Our Story" section heading', () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /our story/i })
    ).toBeInTheDocument();
  });

  it('renders the "Our Memories" section heading', () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /our memories/i })
    ).toBeInTheDocument();
  });

  it("renders all 5 timeline memory titles", () => {
    render(<Home />);
    expect(screen.getByText(/the beginning/i)).toBeInTheDocument();
    expect(screen.getByText(/first holiday season together/i)).toBeInTheDocument();
    expect(screen.getByText(/first valentine's day/i)).toBeInTheDocument();
    expect(screen.getByText(/the everyday moments/i)).toBeInTheDocument();
    expect(screen.getByText(/adventures ahead/i)).toBeInTheDocument();
  });

  it("renders 6 photo images", () => {
    render(<Home />);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThanOrEqual(6);
  });

  it("renders the Maya Angelou attribution", () => {
    render(<Home />);
    expect(screen.getByText(/maya angelou/i)).toBeInTheDocument();
  });

  it("renders a footer element", () => {
    render(<Home />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
