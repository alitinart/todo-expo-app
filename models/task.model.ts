export type Task = {
  id: string;
  icon: string;
  color: string;
  title: string;
  description: string;
  status: "COMPLETED" | "TODO";
  createdAt: Date;
};
