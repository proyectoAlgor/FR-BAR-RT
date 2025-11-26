package models

import "time"

// ReportRequest representa los parámetros para generar un reporte
type ReportRequest struct {
	LocationID *string    `json:"location_id" form:"location_id"`
	StartDate  *time.Time `json:"start_date" form:"start_date"`
	EndDate    *time.Time `json:"end_date" form:"end_date"`
}

// UserReport representa estadísticas de usuarios
type UserReport struct {
	TotalUsers      int            `json:"total_users"`
	ActiveUsers     int            `json:"active_users"`
	InactiveUsers   int            `json:"inactive_users"`
	UsersByRole     []RoleCount    `json:"users_by_role"`
	UsersByLocation []LocationUserCount `json:"users_by_location"`
	RecentLogins    int            `json:"recent_logins"`
	FailedLogins    int            `json:"failed_logins"`
}

// RoleCount representa el conteo de usuarios por rol
type RoleCount struct {
	RoleCode string `json:"role_code"`
	RoleName string `json:"role_name"`
	Count    int    `json:"count"`
}

// LocationUserCount representa el conteo de usuarios por sede
type LocationUserCount struct {
	LocationID   string `json:"location_id"`
	LocationName string `json:"location_name"`
	Count        int    `json:"count"`
}

// ProductReport representa estadísticas de productos
type ProductReport struct {
	TotalProducts    int              `json:"total_products"`
	ActiveProducts   int              `json:"active_products"`
	InactiveProducts int              `json:"inactive_products"`
	ProductsByCategory []CategoryProductCount `json:"products_by_category"`
	AveragePrice     float64          `json:"average_price"`
	PriceRange       PriceRange       `json:"price_range"`
}

// CategoryProductCount representa el conteo de productos por categoría
type CategoryProductCount struct {
	CategoryID   string `json:"category_id"`
	CategoryName string `json:"category_name"`
	Count        int    `json:"count"`
}

// PriceRange representa el rango de precios
type PriceRange struct {
	Min float64 `json:"min"`
	Max float64 `json:"max"`
}

// VenueReport representa estadísticas de sedes
type VenueReport struct {
	TotalLocations   int              `json:"total_locations"`
	ActiveLocations  int              `json:"active_locations"`
	TotalTables      int              `json:"total_tables"`
	TablesByStatus   []TableStatusCount `json:"tables_by_status"`
	LocationDetails  []LocationDetail  `json:"location_details"`
}

// TableStatusCount representa el conteo de mesas por estado
type TableStatusCount struct {
	Status string `json:"status"`
	Count  int    `json:"count"`
}

// LocationDetail representa detalles de una sede
type LocationDetail struct {
	LocationID   string `json:"location_id"`
	LocationName string `json:"location_name"`
	Code         string `json:"code"`
	TotalTables  int    `json:"total_tables"`
	AvailableTables int `json:"available_tables"`
	OccupiedTables   int `json:"occupied_tables"`
	ReservedTables   int `json:"reserved_tables"`
}

// ActivityReport representa estadísticas de actividad del sistema
type ActivityReport struct {
	TotalLoginAttempts    int                    `json:"total_login_attempts"`
	SuccessfulLogins     int                    `json:"successful_logins"`
	FailedLogins          int                    `json:"failed_logins"`
	LoginAttemptsByDay    []DailyLoginCount      `json:"login_attempts_by_day"`
	RecentFailedLogins    []FailedLoginDetail    `json:"recent_failed_logins"`
	PasswordResets        int                    `json:"password_resets"`
	PasswordResetsByDay   []DailyPasswordReset   `json:"password_resets_by_day"`
}

// DailyLoginCount representa conteo de logins por día
type DailyLoginCount struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

// FailedLoginDetail representa detalles de un login fallido
type FailedLoginDetail struct {
	Email     string    `json:"email"`
	IPAddress string    `json:"ip_address"`
	AttemptedAt time.Time `json:"attempted_at"`
}

// DailyPasswordReset representa conteo de reseteos de contraseña por día
type DailyPasswordReset struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

// VenueSpecificReport representa reporte específico de una sede (para cajeros)
type VenueSpecificReport struct {
	LocationID      string          `json:"location_id"`
	LocationName    string          `json:"location_name"`
	LocationCode    string          `json:"location_code"`
	TotalTables     int             `json:"total_tables"`
	TablesStatus    TableStatusCount `json:"tables_status"`
	AssignedUsers   int             `json:"assigned_users"`
	UserDetails     []VenueUserInfo `json:"user_details"`
}

// VenueUserInfo representa información de usuarios asignados a una sede
type VenueUserInfo struct {
	UserID      string   `json:"user_id"`
	Email       string   `json:"email"`
	FirstName   string   `json:"first_name"`
	LastName    string   `json:"last_name"`
	Roles       []string `json:"roles"`
	IsActive    bool     `json:"is_active"`
}

// AnalyticsReport representa reporte completo de analytics (para administradores)
type AnalyticsReport struct {
	GeneratedAt    time.Time     `json:"generated_at"`
	UserReport     UserReport    `json:"user_report"`
	ProductReport  ProductReport `json:"product_report"`
	VenueReport    VenueReport   `json:"venue_report"`
	ActivityReport ActivityReport `json:"activity_report"`
}




