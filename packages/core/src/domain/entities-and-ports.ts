export type User = {
  id: string;
  email: string;
};

export type Task = {
  id: string;
  description: string;
  owner: User;
};

export type AddTaskInput = {
  id: string;
  description: string;
};

export type TaskRepository = {
  save: (task: Task) => Promise<void>;
  getAllForUser: (userId: string) => Promise<Task[]>;
};

export type Uow = {
  taskRepository: TaskRepository;
};

export type WithUow = <T>(cb: (uow: Uow) => T) => T;
