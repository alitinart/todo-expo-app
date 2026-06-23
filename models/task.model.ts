import { colors } from "@/utils/theme";

export type Task = {
  id: string;
  icon: string;
  color: keyof typeof colors;
  title: string;
  description: string;
  status: "COMPLETED" | "TODO";
  createdAt: Date;
};
