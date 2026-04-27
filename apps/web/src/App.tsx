import type { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";

import { HomePage } from "@/pages/HomePage";

export function App(): ReactElement {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
