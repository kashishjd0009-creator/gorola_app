import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Required")
});

type FormValues = z.infer<typeof schema>;

function TrivialForm({ onValid }: { onValid: (v: FormValues) => void }): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" }
  });

  return (
    <form onSubmit={handleSubmit((data) => onValid(data))}>
      <input aria-label="name" type="text" {...register("name")} />
      {errors.name !== undefined && <p role="alert">{errors.name.message}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}

describe("RHF + Zod (form wiring)", () => {
  it("rejects empty submit", async () => {
    const onValid = vi.fn();
    const user = userEvent.setup();
    render(<TrivialForm onValid={onValid} />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(onValid).not.toHaveBeenCalled();
  });

  it("submits valid data", async () => {
    const onValid = vi.fn();
    const user = userEvent.setup();
    render(<TrivialForm onValid={onValid} />);
    await user.type(screen.getByLabelText("name"), "Mussoorie");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => {
      expect(onValid).toHaveBeenCalledWith({ name: "Mussoorie" });
    });
  });
});
