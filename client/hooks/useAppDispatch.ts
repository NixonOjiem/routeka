import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();

// src/hooks/useAppSelector.ts
import { useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState } from "@/redux/store";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
