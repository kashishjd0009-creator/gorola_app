import type { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";

import { useGorolaMotion } from "@/hooks/useGorolaMotion";
import { HomePage } from "@/pages/HomePage";

export function App(): ReactElement {
  useGorolaMotion();
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
