import { create } from "zustand";
import { persist } from "zustand/middleware";

type StoreProps = {
  employeeId: string;
  employeeName: string;
};

type HookProps = {
  employee: StoreProps;
  isOpen: boolean;
  setEmployee: (data: Partial<StoreProps>) => void;
  setOpen: (open: boolean) => void;
  setClear: () => void;
};

const initialStore = {
  employee: {
    employeeId: "",
    employeeName: "",
  },
  isOpen: false,
};

export const useAttendance = create<HookProps>()(
  persist(
    (set) => ({
      ...initialStore,
      setEmployee: (employee) =>
        set((state) => ({ employee: { ...state.employee, ...employee } })),
      setOpen: (open) => set({ isOpen: open }),
      setClear: () => set({ ...initialStore }),
    }),
    {
      name: "ATTENDANCE-DATA",
    },
  ),
);
