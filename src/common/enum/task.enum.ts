enum Type {
  Task = 'task',
  Event = 'event',
}

enum Priority {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}
enum TaskCategories {
  Work = 'work',
  Life = 'life',
  Learning = 'learning',
}

enum TutorialLinkField {
  HasCreatedTask = 'hasCreatedTask',
  HasCreatedBalance = 'hasCreatedBalance',
  HasAddedTag = 'hasAddedTag',
  HasSetReminder = 'hasSetReminder',
}

export { Priority, TaskCategories, TutorialLinkField, Type };
