package service

import (
	"context"
	"errors"
	"fmt"
	"slices"

	"github.com/justinmay/my-app/internal/models"
	"github.com/justinmay/my-app/internal/storage"
)

type AppService struct {
	store *storage.Store
}

func NewAppService(dataDir string) (*AppService, error) {
	store, err := storage.NewStore(dataDir)
	if err != nil {
		return nil, err
	}
	return &AppService{store: store}, nil
}

func (s *AppService) DataDir(_ context.Context) (string, error) {
	return s.store.DataDir(), nil
}

func (s *AppService) ListGoals(_ context.Context) ([]models.Goal, error) {
	return s.store.LoadGoals()
}

func (s *AppService) GetGoal(_ context.Context, id string) (*models.Goal, error) {
	goals, err := s.store.LoadGoals()
	if err != nil {
		return nil, err
	}
	for _, goal := range goals {
		if goal.ID == id {
			copy := goal
			return &copy, nil
		}
	}
	return nil, fmt.Errorf("goal %s not found", id)
}

func (s *AppService) CreateGoal(_ context.Context, goal models.Goal) (models.Goal, error) {
	goals, err := s.store.LoadGoals()
	if err != nil {
		return models.Goal{}, err
	}
	goals = append(goals, goal)
	if err := s.store.SaveGoals(goals); err != nil {
		return models.Goal{}, err
	}
	return goal, nil
}

func (s *AppService) UpdateGoal(_ context.Context, goal models.Goal) (models.Goal, error) {
	goals, err := s.store.LoadGoals()
	if err != nil {
		return models.Goal{}, err
	}
	index := slices.IndexFunc(goals, func(g models.Goal) bool { return g.ID == goal.ID })
	if index == -1 {
		return models.Goal{}, fmt.Errorf("goal %s not found", goal.ID)
	}
	goals[index] = goal
	if err := s.store.SaveGoals(goals); err != nil {
		return models.Goal{}, err
	}
	return goal, nil
}

func (s *AppService) DeleteGoal(_ context.Context, id string) error {
	goals, err := s.store.LoadGoals()
	if err != nil {
		return err
	}
	filtered := slices.DeleteFunc(goals, func(goal models.Goal) bool { return goal.ID == id })
	if len(filtered) == len(goals) {
		return fmt.Errorf("goal %s not found", id)
	}
	return s.store.SaveGoals(filtered)
}

func (s *AppService) ListEntries(_ context.Context, goalID string) ([]models.Entry, error) {
	entries, err := s.store.LoadEntries()
	if err != nil {
		return nil, err
	}
	if goalID == "" {
		return entries, nil
	}
	filtered := make([]models.Entry, 0, len(entries))
	for _, entry := range entries {
		if entry.GoalID == goalID {
			filtered = append(filtered, entry)
		}
	}
	return filtered, nil
}

func (s *AppService) GetEntry(_ context.Context, id string) (*models.Entry, error) {
	entries, err := s.store.LoadEntries()
	if err != nil {
		return nil, err
	}
	for _, entry := range entries {
		if entry.ID == id {
			copy := entry
			return &copy, nil
		}
	}
	return nil, fmt.Errorf("entry %s not found", id)
}

func (s *AppService) CreateEntry(_ context.Context, entry models.Entry) (models.Entry, error) {
	entries, err := s.store.LoadEntries()
	if err != nil {
		return models.Entry{}, err
	}
	entries = append(entries, entry)
	if err := s.store.SaveEntries(entries); err != nil {
		return models.Entry{}, err
	}
	return entry, nil
}

func (s *AppService) UpdateEntry(_ context.Context, entry models.Entry) (models.Entry, error) {
	entries, err := s.store.LoadEntries()
	if err != nil {
		return models.Entry{}, err
	}
	index := slices.IndexFunc(entries, func(e models.Entry) bool { return e.ID == entry.ID })
	if index == -1 {
		return models.Entry{}, fmt.Errorf("entry %s not found", entry.ID)
	}
	entries[index] = entry
	if err := s.store.SaveEntries(entries); err != nil {
		return models.Entry{}, err
	}
	return entry, nil
}

func (s *AppService) DeleteEntry(_ context.Context, id string) error {
	entries, err := s.store.LoadEntries()
	if err != nil {
		return err
	}
	filtered := slices.DeleteFunc(entries, func(entry models.Entry) bool { return entry.ID == id })
	if len(filtered) == len(entries) {
		return fmt.Errorf("entry %s not found", id)
	}
	return s.store.SaveEntries(filtered)
}

func (s *AppService) ListTodos(_ context.Context) ([]models.Todo, error) {
	return s.store.LoadTodos()
}

func (s *AppService) CreateTodo(_ context.Context, todo models.Todo) (models.Todo, error) {
	todos, err := s.store.LoadTodos()
	if err != nil {
		return models.Todo{}, err
	}
	todos = append(todos, todo)
	if err := s.store.SaveTodos(todos); err != nil {
		return models.Todo{}, err
	}
	return todo, nil
}

func (s *AppService) UpdateTodo(_ context.Context, todo models.Todo) (models.Todo, error) {
	todos, err := s.store.LoadTodos()
	if err != nil {
		return models.Todo{}, err
	}
	index := slices.IndexFunc(todos, func(t models.Todo) bool { return t.ID == todo.ID })
	if index == -1 {
		return models.Todo{}, fmt.Errorf("todo %s not found", todo.ID)
	}
	todos[index] = todo
	if err := s.store.SaveTodos(todos); err != nil {
		return models.Todo{}, err
	}
	return todo, nil
}

func (s *AppService) DeleteTodo(_ context.Context, id string) error {
	todos, err := s.store.LoadTodos()
	if err != nil {
		return err
	}
	filtered := slices.DeleteFunc(todos, func(todo models.Todo) bool { return todo.ID == id })
	if len(filtered) == len(todos) {
		return fmt.Errorf("todo %s not found", id)
	}
	return s.store.SaveTodos(filtered)
}

func (s *AppService) ReorderTodos(_ context.Context, orderedIDs []string) error {
	todos, err := s.store.LoadTodos()
	if err != nil {
		return err
	}
	if len(orderedIDs) == 0 {
		return errors.New("orderedIDs cannot be empty")
	}
	indexMap := make(map[string]models.Todo, len(todos))
	for _, todo := range todos {
		indexMap[todo.ID] = todo
	}
	reordered := make([]models.Todo, 0, len(todos))
	for idx, id := range orderedIDs {
		todo, ok := indexMap[id]
		if !ok {
			continue
		}
		order := idx
		todo.Order = &order
		reordered = append(reordered, todo)
		delete(indexMap, id)
	}
	remaining := make([]models.Todo, 0, len(indexMap))
	idx := len(reordered)
	for _, todo := range indexMap {
		order := idx
		todo.Order = &order
		remaining = append(remaining, todo)
		idx++
	}
	return s.store.SaveTodos(append(reordered, remaining...))
}

func (s *AppService) ListTags(_ context.Context) ([]models.Tag, error) {
	return s.store.LoadTags()
}

func (s *AppService) CreateTag(_ context.Context, tag models.Tag) (models.Tag, error) {
	tags, err := s.store.LoadTags()
	if err != nil {
		return models.Tag{}, err
	}
	tags = append(tags, tag)
	if err := s.store.SaveTags(tags); err != nil {
		return models.Tag{}, err
	}
	return tag, nil
}

func (s *AppService) UpdateTag(_ context.Context, tag models.Tag) (models.Tag, error) {
	tags, err := s.store.LoadTags()
	if err != nil {
		return models.Tag{}, err
	}
	index := slices.IndexFunc(tags, func(t models.Tag) bool { return t.ID == tag.ID })
	if index == -1 {
		return models.Tag{}, fmt.Errorf("tag %s not found", tag.ID)
	}
	tags[index] = tag
	if err := s.store.SaveTags(tags); err != nil {
		return models.Tag{}, err
	}
	return tag, nil
}

func (s *AppService) DeleteTag(_ context.Context, id string) error {
	tags, err := s.store.LoadTags()
	if err != nil {
		return err
	}
	filtered := slices.DeleteFunc(tags, func(tag models.Tag) bool { return tag.ID == id })
	if len(filtered) == len(tags) {
		return fmt.Errorf("tag %s not found", id)
	}
	return s.store.SaveTags(filtered)
}
