import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InputImage from "@/src/components/custom/InputImage"

it("clicks the hidden file input", async () => {
  const user = userEvent.setup();

  render(<InputImage onSelect={jest.fn()} />);

  const input = document.querySelector(
    'input[type="file"]'
  )

  const clickSpy = jest.spyOn(input, "click");

  await user.click(screen.getByRole("button"));

  expect(clickSpy).toHaveBeenCalled();
});