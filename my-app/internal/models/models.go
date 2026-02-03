package models

type GoalType string

const (
	GoalTypeNumeric   GoalType = "numeric"
	GoalTypeAdherence GoalType = "adherence"
	GoalTypeFrequency GoalType = "frequency"
	GoalTypeDuration  GoalType = "duration"
)

type Milestone struct {
	ID           string  `json:"id"`
	Value        float64 `json:"value"`
	Label        string  `json:"label"`
	Achieved     *bool   `json:"achieved,omitempty"`
	AchievedDate string  `json:"achievedDate,omitempty"`
}

type Goal struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description,omitempty"`
	Type        GoalType       `json:"type"`
	CreatedAt   string         `json:"createdAt"`
	Config      map[string]any `json:"config"`
	Milestones  []Milestone    `json:"milestones"`
}

type Entry struct {
	ID        string `json:"id"`
	GoalID    string `json:"goalId"`
	Date      string `json:"date"`
	Timestamp string `json:"timestamp"`
	Value     any    `json:"value"`
	Note      string `json:"note,omitempty"`
}

type SubTask struct {
	ID        string `json:"id"`
	Text      string `json:"text"`
	Completed bool   `json:"completed"`
}

type Todo struct {
	ID        string    `json:"id"`
	Date      string    `json:"date"`
	Text      string    `json:"text"`
	Completed bool      `json:"completed"`
	CreatedAt string    `json:"createdAt"`
	TagIDs    []string  `json:"tagIds,omitempty"`
	Order     *int      `json:"order,omitempty"`
	SubTasks  []SubTask `json:"subTasks,omitempty"`
}

type Tag struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color"`
}
