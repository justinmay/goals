package storage

import (
	"encoding/json"
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"sync"

	"github.com/justinmay/my-app/internal/models"
)

type Store struct {
	dir string
	mu  sync.Mutex
}

func NewStore(dir string) (*Store, error) {
	resolved, err := resolveDataDir(dir)
	if err != nil {
		return nil, err
	}
	if err := os.MkdirAll(resolved, 0o755); err != nil {
		return nil, err
	}
	return &Store{dir: resolved}, nil
}

func resolveDataDir(dir string) (string, error) {
	if dir != "" {
		return filepath.Abs(dir)
	}
	if env := os.Getenv("GOALS_DATA_DIR"); env != "" {
		return filepath.Abs(env)
	}
	if candidate := findExistingDataDir(); candidate != "" {
		return candidate, nil
	}
	if cfgDir, err := os.UserConfigDir(); err == nil && cfgDir != "" {
		return filepath.Join(cfgDir, "goals"), nil
	}
	wd, err := os.Getwd()
	if err != nil {
		return "", err
	}
	return filepath.Join(wd, "data"), nil
}

func findExistingDataDir() string {
	wd, err := os.Getwd()
	if err != nil {
		return ""
	}
	visited := make(map[string]struct{})
	for {
		if _, seen := visited[wd]; seen {
			break
		}
		visited[wd] = struct{}{}
		candidate := filepath.Join(wd, "data")
		if info, err := os.Stat(candidate); err == nil && info.IsDir() {
			abs, err := filepath.Abs(candidate)
			if err != nil {
				return ""
			}
			return abs
		}
		parent := filepath.Dir(wd)
		if parent == wd {
			break
		}
		wd = parent
	}
	return ""
}

func (s *Store) dataPath(filename string) string {
	return filepath.Join(s.dir, filename)
}

func (s *Store) ensureFile(path string, defaultContent []byte) error {
	if _, err := os.Stat(path); err != nil {
		if errors.Is(err, fs.ErrNotExist) {
			return os.WriteFile(path, defaultContent, 0o644)
		}
		return err
	}
	return nil
}

func (s *Store) read(path string, defaultContent []byte, dest any) error {
	if err := s.ensureFile(path, defaultContent); err != nil {
		return err
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, dest)
}

func (s *Store) write(path string, value any) error {
	bytes, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, bytes, 0o644)
}

type goalsFile struct {
	Goals []models.Goal `json:"goals"`
}

type entriesFile struct {
	Entries []models.Entry `json:"entries"`
}

type todosFile struct {
	Todos []models.Todo `json:"todos"`
}

type tagsFile struct {
	Tags []models.Tag `json:"tags"`
}

func (s *Store) LoadGoals() ([]models.Goal, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var file goalsFile
	if err := s.read(s.dataPath("goals.json"), []byte(`{"goals": []}`), &file); err != nil {
		return nil, err
	}
	return file.Goals, nil
}

func (s *Store) SaveGoals(goals []models.Goal) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.write(s.dataPath("goals.json"), goalsFile{Goals: goals})
}

func (s *Store) LoadEntries() ([]models.Entry, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var file entriesFile
	if err := s.read(s.dataPath("entries.json"), []byte(`{"entries": []}`), &file); err != nil {
		return nil, err
	}
	return file.Entries, nil
}

func (s *Store) SaveEntries(entries []models.Entry) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.write(s.dataPath("entries.json"), entriesFile{Entries: entries})
}

func (s *Store) LoadTodos() ([]models.Todo, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var file todosFile
	if err := s.read(s.dataPath("todos.json"), []byte(`{"todos": []}`), &file); err != nil {
		return nil, err
	}
	return file.Todos, nil
}

func (s *Store) SaveTodos(todos []models.Todo) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.write(s.dataPath("todos.json"), todosFile{Todos: todos})
}

func (s *Store) LoadTags() ([]models.Tag, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	var file tagsFile
	if err := s.read(s.dataPath("tags.json"), []byte(`{"tags": []}`), &file); err != nil {
		return nil, err
	}
	return file.Tags, nil
}

func (s *Store) SaveTags(tags []models.Tag) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.write(s.dataPath("tags.json"), tagsFile{Tags: tags})
}

func (s *Store) DataDir() string {
	return s.dir
}
